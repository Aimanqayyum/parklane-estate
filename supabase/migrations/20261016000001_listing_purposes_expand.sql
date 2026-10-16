-- Migration 1 of 3: EXPAND (spec §3)
--
-- Adds the purpose / category model next to the existing `property_type`
-- column. Nothing existing is removed, so the live site keeps working.
--
-- Run order: BACKUP first -> this file -> deploy the new code.
-- Everything runs in one transaction: it applies fully or not at all.
-- If the backfill finds a property_type value it does not know, it aborts
-- with a list of the offending rows. Nothing is guessed.
--
-- Safe to re-run: tables use IF NOT EXISTS, seeds use ON CONFLICT DO NOTHING,
-- policies are dropped and re-created.

begin;

-- ---------------------------------------------------------------------------
-- 1. Lookup tables (§3.3)
-- ---------------------------------------------------------------------------

-- What a listing is offered for.
create table if not exists public.listing_purposes (
  slug              text primary key
                    check (slug ~ '^[a-z][a-z0-9-]*$'),
  label             text not null,                 -- 'For Sale'
  nav_label         text not null,                 -- 'Buy'
  url_segment       text not null unique
                    check (url_segment ~ '^[a-z][a-z0-9-]*$'
                       and url_segment not in ('admin','properties','about','services','faq','contact')),
  closed_status     text not null,                 -- status once the deal is done: 'Sold' / 'Rented'
  price_suffix      text not null default '',      -- '' for sale, '/ month' for rent
  price_slider_max  bigint not null check (price_slider_max  > 0),
  price_slider_step bigint not null check (price_slider_step > 0),
  sort_order        smallint not null default 0,
  is_active         boolean  not null default true
);

-- The kinds of property.
create table if not exists public.property_categories (
  slug          text primary key
                check (slug ~ '^[a-z][a-z0-9-]*$'),
  label         text not null,                     -- 'Flat'
  label_plural  text not null,                     -- 'Flats'
  icon          text not null default 'Home',      -- lucide-react icon name
  sort_order    smallint not null default 0,
  is_active     boolean  not null default true
);

-- Which categories exist under which purpose ("no Plot under Rent" lives here).
create table if not exists public.purpose_categories (
  purpose     text not null references public.listing_purposes(slug)    on update cascade on delete restrict,
  category    text not null references public.property_categories(slug) on update cascade on delete restrict,
  sort_order  smallint not null default 0,         -- order inside this purpose's dropdown
  is_active   boolean  not null default true,
  primary key (purpose, category)
);

-- ---------------------------------------------------------------------------
-- 2. Seed data (idempotent)
-- ---------------------------------------------------------------------------

insert into public.listing_purposes
  (slug, label, nav_label, url_segment, closed_status, price_suffix, price_slider_max, price_slider_step, sort_order)
values
  ('sale', 'For Sale', 'Buy',  'buy',  'Sold',   '',        500000000, 10000000, 1),
  ('rent', 'For Rent', 'Rent', 'rent', 'Rented', '/ month',   2000000,    50000, 2)
on conflict (slug) do nothing;

insert into public.property_categories (slug, label, label_plural, icon, sort_order) values
  ('bungalow',  'Bungalow',  'Bungalows',  'House',     1),
  ('penthouse', 'Penthouse', 'Penthouses', 'Building2', 2),
  ('flat',      'Flat',      'Flats',      'Building',  3),
  ('plot',      'Plot',      'Plots',      'LandPlot',  4),
  ('shop',      'Shop',      'Shops',      'Store',     5),
  ('office',    'Office',    'Offices',    'Briefcase', 6)
on conflict (slug) do nothing;

insert into public.purpose_categories (purpose, category, sort_order) values
  ('sale', 'bungalow',  1),
  ('sale', 'penthouse', 2),
  ('sale', 'flat',      3),
  ('sale', 'plot',      4),
  ('sale', 'shop',      5),
  ('sale', 'office',    6),
  ('rent', 'bungalow',  1),
  ('rent', 'flat',      2),
  ('rent', 'penthouse', 3),
  ('rent', 'shop',      4),
  ('rent', 'office',    5)                          -- no plot under rent
on conflict (purpose, category) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Row Level Security on the new tables (§3.7)
-- ---------------------------------------------------------------------------

alter table public.listing_purposes    enable row level security;
alter table public.property_categories enable row level security;
alter table public.purpose_categories  enable row level security;

drop policy if exists "lookups are public" on public.listing_purposes;
drop policy if exists "lookups are public" on public.property_categories;
drop policy if exists "lookups are public" on public.purpose_categories;
drop policy if exists "admins write"       on public.listing_purposes;
drop policy if exists "admins write"       on public.property_categories;
drop policy if exists "admins write"       on public.purpose_categories;

-- Everyone can read the lookups.
create policy "lookups are public" on public.listing_purposes    for select to anon, authenticated using (true);
create policy "lookups are public" on public.property_categories for select to anon, authenticated using (true);
create policy "lookups are public" on public.purpose_categories  for select to anon, authenticated using (true);

-- Only signed-in admins write (same trust model the app has today).
create policy "admins write" on public.listing_purposes    for all to authenticated using (true) with check (true);
create policy "admins write" on public.property_categories for all to authenticated using (true) with check (true);
create policy "admins write" on public.purpose_categories  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- 4. Changes to `properties` (§3.4, phase 1)
-- ---------------------------------------------------------------------------

-- property_type becomes optional: the new code stops writing it, so it must
-- be nullable before the new code is deployed. purpose / category are added
-- nullable; migration 2 makes them NOT NULL.
alter table public.properties
  alter column property_type drop not null,
  add column if not exists purpose  text,
  add column if not exists category text;

-- The live schema was inferred from code, not observed. Find and drop any old
-- CHECK constraint that mentions property_type (it would reject new values).
do $$
declare c record;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.properties'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%property_type%'
  loop
    execute format('alter table public.properties drop constraint %I', c.conname);
  end loop;
end $$;

-- Backfill from existing data. Unknown values fail loudly (below), never guessed.
update public.properties set
  purpose  = case when status = 'Rented' then 'rent' else 'sale' end,
  category = case lower(btrim(property_type))
               when 'apartment' then 'flat'
               when 'flat'      then 'flat'
               when 'bungalow'  then 'bungalow'
               when 'penthouse' then 'penthouse'
               when 'plot'      then 'plot'
               when 'shop'      then 'shop'
               when 'office'    then 'office'
             end
where purpose is null;

-- Abort (and roll everything back) if any row could not be mapped.
do $$
declare v_rows text;
begin
  select string_agg(format('%s (title=%L, property_type=%L)', id, title, property_type), E'\n  ')
    into v_rows
    from public.properties
   where category is null;

  if v_rows is not null then
    raise exception E'Backfill stopped: these properties have a property_type that has no matching category.\n  %\nDecide the mapping, extend the CASE above (or fix the rows), and run again.', v_rows;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Indexes (§3.5)
-- ---------------------------------------------------------------------------

-- Browse pages: /buy, /buy/flat, sorted by featured then newest.
create index if not exists properties_browse_idx
  on public.properties (purpose, category, featured desc, created_at desc)
  where status = 'Available';

-- Price sort / price filter within a purpose.
create index if not exists properties_purpose_price_idx
  on public.properties (purpose, price)
  where status = 'Available';

-- ---------------------------------------------------------------------------
-- 6. Menu function: one round trip, live counts (§3.6)
-- ---------------------------------------------------------------------------
-- security definer is deliberate: it returns only lookup labels and aggregate
-- counts, so anonymous visitors get counts without broader access to properties.

drop function if exists public.get_listing_menu();

create function public.get_listing_menu()
returns table (
  purpose text, nav_label text, label text, url_segment text, purpose_order smallint,
  closed_status text, price_suffix text, price_slider_max bigint, price_slider_step bigint,
  category text, category_label text, category_label_plural text, icon text, category_order smallint,
  listing_count bigint
)
language sql stable security definer set search_path = public as $$
  select p.slug, p.nav_label, p.label, p.url_segment, p.sort_order,
         p.closed_status, p.price_suffix, p.price_slider_max, p.price_slider_step,
         c.slug, c.label, c.label_plural, c.icon, pc.sort_order,
         count(pr.id)
  from public.listing_purposes   p
  join public.purpose_categories pc on pc.purpose  = p.slug and pc.is_active
  join public.property_categories c on c.slug      = pc.category and c.is_active
  left join public.properties    pr on pr.purpose  = pc.purpose
                                   and pr.category = pc.category
                                   and pr.status   = 'Available'
  where p.is_active
  group by p.slug, p.nav_label, p.label, p.url_segment, p.sort_order,
           p.closed_status, p.price_suffix, p.price_slider_max, p.price_slider_step,
           c.slug, c.label, c.label_plural, c.icon, pc.sort_order
  order by p.sort_order, pc.sort_order;
$$;

revoke all on function public.get_listing_menu() from public;
grant execute on function public.get_listing_menu() to anon, authenticated;

commit;

-- ---------------------------------------------------------------------------
-- down (rollback). Uncomment and run ONLY if migrations 2 and 3 are not applied
-- (undo in reverse order: 3, 2, 1). Take a backup first.
-- ---------------------------------------------------------------------------
-- begin;
-- drop function if exists public.get_listing_menu();
-- drop index if exists public.properties_purpose_price_idx;
-- drop index if exists public.properties_browse_idx;
-- alter table public.properties drop column if exists category;
-- alter table public.properties drop column if exists purpose;
-- drop table if exists public.purpose_categories;
-- drop table if exists public.property_categories;
-- drop table if exists public.listing_purposes;
-- -- Not restored by this block (we never saw the original definitions):
-- --   * property_type NOT NULL  -> only re-add if every row has a value:
-- --       alter table public.properties alter column property_type set not null;
-- --   * any old CHECK constraint on property_type that step 4 dropped.
-- commit;
