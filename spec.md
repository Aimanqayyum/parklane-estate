# Spec: Buy / Rent mega-menu navigation

Status: **APPROVED** (database design approved by the project owner; decisions in section 14 resolved).
Derived from: `intent.md`. Next steps: plan (`plan.md`) → implementation.

## 1. Scope

In scope:

- A `purpose` (sale / rent) dimension on listings, with a database-driven category model, so the menu, the filters and the admin form all read from one source.
- Header mega-menu (desktop) and accordion (mobile) for **Buy** and **Rent**, next to the existing links.
- Clean routes `/buy`, `/buy/:category`, `/rent`, `/rent/:category`, served by the listing page.
- Listing page, listing card, detail page and admin form updated for purpose and the new categories.

Out of scope: a Sell menu, public posting, an admin UI for editing purposes / categories (they are changed with SQL for now, see section 3.9), SSR / prerendering, user accounts.

## 2. Vocabulary

| Term | Meaning |
|------|---------|
| **Purpose** | What a listing is offered for: `sale` or `rent`. Shown in the UI as **Buy** / **Rent**. |
| **Category** | The kind of property: `bungalow`, `penthouse`, `flat`, `plot`, `shop`, `office`. Replaces today's free-text `property_type`. |
| **Status** | Lifecycle of a listing: `Available`, `Sold` (sale only), `Rented` (rent only). Unchanged, but now validated against the purpose. |
| **Slug** | Lowercase key used in URLs and as the database key (`flat`, `rent`). |
| **URL segment** | The public path word for a purpose: `buy` → purpose `sale`, `rent` → purpose `rent`. |

## 3. Database design (needs approval)

### 3.1 Principles

- **Data, not code, defines the menu.** Purposes, categories and which categories are allowed under which purpose live in tables. Adding "Land" or a "Lease" purpose later is an `INSERT`, not a deploy.
- **The database enforces the rules.** "No Plot under Rent" and "Sold only for sale" are constraints / triggers, not just UI checks, so a bad admin form, a script or a future API cannot create inconsistent data.
- **Expand → migrate → contract.** The change ships in three migrations so the live site keeps working between steps and each step is reversible.
- **Natural text keys.** Slugs are the primary keys (`'flat'`, `'rent'`): readable in queries and URLs, stable, and renamable with `ON UPDATE CASCADE`.
- **One round trip for the menu.** A single function returns the menu with live listing counts.

### 3.2 Entity overview

```
listing_purposes (sale, rent)            property_categories (bungalow, penthouse, flat, plot, shop, office)
        │ slug                                          │ slug
        └──────────────┐                ┌───────────────┘
                purpose_categories (purpose, category)   ← which categories are allowed under which purpose
                        ▲
                        │ composite FK (purpose, category)
                   properties (+ purpose, + category; property_type is retired)
```

### 3.3 New tables

```sql
-- What a listing is offered for.
create table public.listing_purposes (
  slug              text primary key
                    check (slug ~ '^[a-z][a-z0-9-]*$'),
  label             text not null,                 -- 'For Sale'
  nav_label         text not null,                 -- 'Buy'
  url_segment       text not null unique
                    check (url_segment ~ '^[a-z][a-z0-9-]*$'
                       and url_segment not in ('admin','properties','about','services','faq','contact')),
  closed_status     text not null,                 -- status once the deal is done: 'Sold' / 'Rented'
  price_suffix      text not null default '',      -- '' for sale, '/ month' for rent
  price_slider_max  bigint not null check (price_slider_max  > 0),   -- listing price filter range, per purpose
  price_slider_step bigint not null check (price_slider_step > 0),
  sort_order        smallint not null default 0,
  is_active         boolean  not null default true
);

-- The kinds of property.
create table public.property_categories (
  slug          text primary key
                check (slug ~ '^[a-z][a-z0-9-]*$'),
  label         text not null,                     -- 'Flat'
  label_plural  text not null,                     -- 'Flats'
  icon          text not null default 'Home',      -- lucide-react icon name; UI falls back to a default if unknown
  sort_order    smallint not null default 0,
  is_active     boolean  not null default true
);

-- Which categories exist under which purpose (this is where "no Plot under Rent" lives).
create table public.purpose_categories (
  purpose     text not null references public.listing_purposes(slug)    on update cascade on delete restrict,
  category    text not null references public.property_categories(slug) on update cascade on delete restrict,
  sort_order  smallint not null default 0,         -- order inside this purpose's dropdown
  is_active   boolean  not null default true,
  primary key (purpose, category)
);
```

Seed data (idempotent, `on conflict do nothing`):

| listing_purposes | label | nav_label | url_segment | closed_status | price_suffix | slider max / step |
|---|---|---|---|---|---|---|
| `sale` (1) | For Sale | Buy | `buy` | Sold | *(empty)* | 500,000,000 / 10,000,000 |
| `rent` (2) | For Rent | Rent | `rent` | Rented | `/ month` | 2,000,000 / 50,000 |

| property_categories | label | plural | icon (indicative) |
|---|---|---|---|
| `bungalow` | Bungalow | Bungalows | House |
| `penthouse` | Penthouse | Penthouses | Building2 |
| `flat` | Flat | Flats | Building |
| `plot` | Plot | Plots | LandPlot |
| `shop` | Shop | Shops | Store |
| `office` | Office | Offices | Briefcase |

| purpose_categories | order |
|---|---|
| `sale`: bungalow, penthouse, flat, plot, shop, office | 1 to 6 |
| `rent`: bungalow, flat, penthouse, shop, office *(no plot)* | 1 to 5 |

### 3.4 Changes to `properties`

```sql
-- Phase 1 (expand): additive and nullable, nothing existing breaks.
alter table public.properties
  alter column property_type drop not null,   -- the new code stops writing it
  add column if not exists purpose  text,
  add column if not exists category text;

-- Drop any old CHECK constraint on property_type (we have not seen the live schema; this finds it by definition).
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

-- Backfill from existing data. Unknown values must fail loudly, never be guessed.
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
-- The migration then raises an exception listing any row where category is still null.
```

```sql
-- Phase 2 (constrain): run after the new code is deployed and the verification queries in 3.8 are clean.
alter table public.properties
  alter column purpose  set not null,
  alter column category set not null,
  add constraint properties_purpose_category_fk
    foreign key (purpose, category)
    references public.purpose_categories (purpose, category)
    on update cascade on delete restrict;
```

The composite foreign key is the "no Plot under Rent" rule: `('rent','plot')` is not in `purpose_categories`, so the insert is rejected.

```sql
-- Status must fit the purpose: 'Available' always, plus that purpose's closed status.
create function public.properties_check_status() returns trigger
language plpgsql as $$
declare v_closed text;
begin
  select closed_status into v_closed from public.listing_purposes where slug = new.purpose;
  if new.status is distinct from 'Available' and new.status is distinct from v_closed then
    raise exception 'status "%" is not valid for purpose "%" (allowed: Available, %)',
      new.status, new.purpose, v_closed using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger properties_check_status
  before insert or update of status, purpose on public.properties
  for each row execute function public.properties_check_status();
```

```sql
-- Phase 3 (contract): after a release cycle with no reads of property_type.
alter table public.properties drop column property_type;
```

### 3.5 Indexes

```sql
-- Serves the browse pages: /buy, /buy/flat, sorted by featured then newest.
create index properties_browse_idx
  on public.properties (purpose, category, featured desc, created_at desc)
  where status = 'Available';

-- Serves price sort / price filter within a purpose.
create index properties_purpose_price_idx
  on public.properties (purpose, price)
  where status = 'Available';
```

Partial indexes on `status = 'Available'` match every public query (the site only shows Available listings) and stay small as sold / rented history grows.

### 3.6 Menu function (one round trip, live counts)

```sql
create or replace function public.get_listing_menu()
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
```

The purpose-level settings (`closed_status`, `price_suffix`, `price_slider_max`, `price_slider_step`) are returned on every row so the admin form, price formatting and the price slider need no second request. (Added to this function during implementation of Phase 2: sections 6 to 9 need them and the first draft omitted them.)

`security definer` is deliberate: it returns only lookup labels and aggregate counts, so anonymous visitors get counts without needing broader read access to `properties`.

### 3.7 Row Level Security on the new tables

```sql
alter table public.listing_purposes    enable row level security;
alter table public.property_categories enable row level security;
alter table public.purpose_categories  enable row level security;

-- Everyone can read the lookups.
create policy "lookups are public" on public.listing_purposes    for select to anon, authenticated using (true);
create policy "lookups are public" on public.property_categories for select to anon, authenticated using (true);
create policy "lookups are public" on public.purpose_categories  for select to anon, authenticated using (true);

-- Only signed-in admins write (same trust model the app has today).
create policy "admins write" on public.listing_purposes    for all to authenticated using (true) with check (true);
create policy "admins write" on public.property_categories for all to authenticated using (true) with check (true);
create policy "admins write" on public.purpose_categories  for all to authenticated using (true) with check (true);
```

### 3.8 Migration plan, verification and rollback

Files go in `supabase/migrations/` as timestamped SQL files, so the schema is in git (it is not today):

| # | File | When | Reversible by |
|---|------|------|---------------|
| 1 | `…_listing_purposes_expand.sql`: new tables, seed, RLS, `properties.purpose/category` (nullable), backfill, indexes, menu function | before the new code is deployed | drop the new columns, functions, tables |
| 2 | `…_listing_purposes_constrain.sql`: `NOT NULL`, composite FK, status trigger | after the new code is live and checks pass | drop the constraint, trigger, and set columns nullable |
| 3 | `…_listing_purposes_contract.sql`: drop `property_type` | after one stable release cycle | restore the column from the backup and re-derive it from `category` |

Each file ships with a commented `-- down` block. **Before migration 1 we take a database backup** (Supabase dashboard backup, or `pg_dump`).

Checks before running migration 2 (all must return zero rows):

```sql
select id, title, property_type, status from properties where purpose is null or category is null;
select id, title, purpose, category from properties p
  where not exists (select 1 from purpose_categories pc where pc.purpose = p.purpose and pc.category = p.category);
select id, title, purpose, status from properties p
  where status <> 'Available' and status <> (select closed_status from listing_purposes where slug = p.purpose);
```

Between migration 1 and the deploy of the new code, a listing created through the **old** admin form gets `purpose = null` and simply does not appear on the new Buy / Rent pages; migration 2 will flag it in the checks above. With mock data and a single admin, that window is acceptable.

### 3.9 Adding purposes / categories later (the flexibility)

```sql
-- New category, allowed under both purposes:
insert into property_categories (slug, label, label_plural, icon, sort_order) values ('land', 'Land', 'Lands', 'Trees', 7);
insert into purpose_categories (purpose, category, sort_order) values ('sale','land',7), ('rent','land',6);

-- Hide a category from the site without touching listings:
update purpose_categories set is_active = false where purpose = 'rent' and category = 'office';

-- New purpose, for example 'lease':
insert into listing_purposes (slug,label,nav_label,url_segment,closed_status,price_suffix,price_slider_max,price_slider_step,sort_order)
  values ('lease','For Lease','Lease','lease','Leased','/ year',50000000,500000,3);
```

New menu entries, routes, filter chips and admin form options appear with no code change, **except** that a new purpose's closed status needs one extra value in the admin's status colouring (cosmetic). An admin screen for these tables is a possible later feature.

### 3.10 What is known and what is assumed about the live database

I have no database access from this repo. The live schema is **inferred from the application code**, and the migrations are written so they do not depend on what could not be seen.

Known from the code (insert / update / select calls): `properties` has `id` (uuid), `slug`, `title`, `project_name`, `description`, `price`, `location`, `property_type`, `bedrooms`, `bathrooms`, `area_sqft`, `images` (array), `video_url`, `latitude`, `longitude`, `status`, `featured`, `view_count`, `created_at`. The code also uses a `contact_submissions` table and a `property-images` storage bucket.

Not visible, and how the design copes:

| Unknown | How migration 1 / 2 copes |
|---|---|
| RLS policies on `properties` | Not touched. The new tables carry their own policies, and `get_listing_menu()` is `security definer`, so nothing depends on them. |
| An old `CHECK` on `property_type` | Migration 1 finds and drops any check constraint that mentions `property_type`. |
| Real values in `property_type` / `status` | The backfill maps the known values and **aborts with a list of the offending rows** if anything else exists. It never guesses. |
| `property_type` being `NOT NULL` | Harmless: the old column is left alone until migration 3, and the new code stops writing it, so migration 1 (and the new code) must not deploy before the column is made nullable. Migration 1 therefore runs `alter column property_type drop not null`. |
| `updated_at` trigger or other triggers | Unaffected; the new status trigger only fires on `status` / `purpose` changes. |

**Gate before migration 2:** whoever owns the database runs the verification queries in 3.8 (and optionally `select * from pg_policies where tablename = 'properties';`). Until then the site works with migration 1 and the new code, and nothing is made stricter.

**Pre-existing risk, separate from this change:** any signed-in user is treated as an admin (`ProtectedRoute` only checks for a session). When the database owner is available, they should confirm that public email sign-up is disabled in Supabase Auth, otherwise any visitor could register and edit properties. I recommend a separate hardening task (admin role claim).

## 4. Routing

| Path | Page | Notes |
|------|------|-------|
| `/properties` | Listing page, all purposes | Unchanged URL. Accepts `?type=<category slug>` and the existing filter params. Legacy `?type=Bungalow` (capitalised) is matched case-insensitively; unknown values are ignored. |
| `/:purposeSegment` | Listing page, one purpose | `/buy`, `/rent` |
| `/:purposeSegment/:categorySlug` | Listing page, purpose + category | `/buy/flat`, `/rent/shop` |

- The segments are resolved against the menu data (`url_segment`, category slug), not hard-coded, so a new purpose needs no routing change. React Router ranks static routes (`/about`, `/properties`, `/admin/*`) above `/:purposeSegment`, so existing pages are unaffected.
- An unknown purpose segment, an unknown category, or a combination that is not allowed (`/rent/plot`) renders the existing `NotFound` page with a 404 title.
- Other filters (location, price, bedrooms, project, sort, page) stay as query params on all these URLs.
- `vercel.json` already rewrites everything to `index.html`; no change.

## 5. Data layer

- A single hook `useListingMenu()` (React Query, already mounted in `App.tsx`) calls `get_listing_menu()`, groups the rows into `purposes[] → categories[]`, and caches them (stale time 5 minutes). Header, listing page, filters and admin form all use it.
- Pure helpers (unit-tested): `groupMenu(rows)`, `resolveRoute(menu, purposeSegment, categorySlug)`, `buildListingPath(purpose, category?)`, `categoriesFor(menu, purposeSlug)`.
- One shared `PropertyListItem` type in `src/types/property.ts` replaces the seven near-identical `Property` interfaces, and carries `purpose` and `category` instead of `property_type`.
- `formatPrice(price, suffix?)` appends the purpose's `price_suffix` (for example "PKR 1.50 Lac / month").
- If the menu request fails, the header falls back to two plain links ("Buy" → `/buy`, "Rent" → `/rent`) without dropdowns, and listing pages show the existing error state. There is no duplicated category list in code.

## 6. Header

### Desktop (≥ 1024px)

- Order: **Home, Buy, Rent, Properties, About Us, Services, FAQ, Contact.** Eight items do not fit the current pill at 768 to 1023px, so the hamburger breakpoint moves from `md` to `lg`, and the item spacing tightens slightly.
- Buy and Rent are triggers with a small chevron. They open a panel on hover, on keyboard focus + Enter / Space / ArrowDown, and on click. Built on the existing Radix `navigation-menu` (gives keyboard navigation, focus management and ARIA for free), restyled to the site.
- Hover intent: open after about 120 ms, close after about 200 ms of leaving, so crossing the header does not flicker the panel.
- Panel: always a solid light surface (readable over the dark hero), rounded, soft shadow, gold accent on hover. Contents:
  - Header line: "Buy" / "Rent" with a short descriptor and an **"All for sale →"** / **"All for rent →"** link (`/buy`, `/rent`).
  - Category list in two columns: icon in a soft circle, category label, and the live listing count in muted text. Order comes from `purpose_categories.sort_order`.
  - Categories with 0 listings stay visible but dimmed (the menu is stable), and lead to the empty state.
- Active state: the trigger shows the gold underline when the current path is under `/buy…` or `/rent…`.
- `Escape` closes the panel and returns focus to the trigger. Reduced-motion users get no slide / fade animation.

### Mobile (< 1024px)

- The slide-out panel gets **Buy** and **Rent** accordion sections (shadcn `Accordion`, one open at a time). Each section lists the categories with counts and an "All" row. Choosing any link closes the panel.
- Touch targets at least 44px high.

## 7. Listing page

- One component serves `/properties`, `/buy…` and `/rent…`. Purpose and category come from the route; they are not part of the local filters state.
- **Hero / heading:** purpose + category aware ("Flats For Sale", "Shops For Rent", "Properties" on `/properties`). Subtitle shows the count. Breadcrumb: Home › Buy › Flats.
- **Purpose toggle:** a Buy | Rent segmented control under the heading on purpose pages. Switching keeps the category when it exists under the other purpose, and otherwise falls back to the purpose's "All" page.
- **Category chips:** a scrollable chip row of the categories allowed for the current purpose (with "All" first), replacing the sidebar's property-type buttons on purpose pages. On `/properties` the sidebar keeps a type filter with all categories.
- **Query:** adds `.eq('purpose', …)` and `.eq('category', …)` to the existing Supabase query (still `status = 'Available'`, same sort and pagination). Page resets to 1 when purpose or category changes.
- **Price filter:** the slider's range and step come from the purpose (`price_slider_max`, `price_slider_step`), so Rent is not squeezed into a 50 Crore scale. On `/properties` (mixed purposes) it uses the sale range.
- **Empty state:** the existing `EmptyState` gets a message for the combination and two actions: clear filters and "Ask us on WhatsApp / Contact".
- **SEO:** `SEO` title and description per combination (for example "Flats for Rent in Karachi | Park Lane Estate"), and a canonical path.
- Existing behaviour (URL-driven filters, sorting, server-side pagination, skeletons, error state) is kept.

## 8. Cards, detail page, home

- `PropertyCard`: shows the price with the suffix, and a small "For Rent" badge on rent listings. The type text uses the category label.
- `PropertyDetail`: price with suffix, "Category" from the category label, breadcrumb back to `/buy/flat`-style page, related properties limited to the **same purpose** (and preferably the same category), `SEO` description uses the category label.
- `FeaturedProperties` (home): selects the new columns; no other change.
- Home search / hero links that point to `/properties` are left as they are.

## 9. Admin

- **Property form** (`PropertyForm.tsx`, used by Add and Edit):
  - New required **"Listed for"** select (Sale / Rent), loaded from the database.
  - **Property Type** options come from `purpose_categories` for the selected purpose. Changing the purpose to one that does not allow the current category clears the category and shows a short inline message.
  - **Status** options are Available plus the purpose's closed status (Sold for sale, Rented for rent). Changing purpose resets an invalid status to Available.
  - The price label reads "Price (PKR)" for sale and "Monthly rent (PKR)" for rent.
  - Validation messages for the new fields match the existing style.
- `AddProperty` / `EditProperty` write `purpose` and `category` and stop writing `property_type`. If the database rejects a combination (constraint / trigger), the existing error toast shows it.
- **Property list:** a purpose badge per row and a purpose filter. Status badges unchanged.
- **Dashboard:** the "Available" metric stays; optional split "for sale / for rent" if cheap to add.
- `ContactForm`'s property dropdown (Available titles) is unchanged.

## 10. Cleanup

- `src/pages/Index.tsx` and `src/components/SupabaseTest.tsx` are unrouted scaffolding that still reads `property_type`. **Proposal: delete both** so nothing references the retired column. If you prefer to keep them, they are updated to the new columns instead.

## 11. Non-functional requirements

- **Accessibility:** menu usable by keyboard and screen reader (roles / `aria-expanded` from Radix); visible focus ring; contrast at least AA on the panel; reduced-motion respected.
- **Performance:** one menu request per session (cached); listing queries hit the partial indexes in 3.5; no layout shift when the menu loads (triggers render immediately, panel content loads on first open if still pending, with a skeleton).
- **Compatibility:** every existing URL keeps working (`/properties`, `/properties/:slug`, `/admin/*`).
- **Known limitation:** the site is a client-rendered SPA, so per-page titles and canonicals are set by `react-helmet-async` at runtime. Search engines that execute JavaScript will see them; prerendering would be a separate project.

## 12. Testing

- Vitest unit tests (no network) for `groupMenu`, `resolveRoute` (including `/rent/plot` and unknown segments), `buildListingPath`, `categoriesFor`, and `formatPrice` with suffix.
- SQL verification script (section 3.8) run against the database before migration 2, plus manual negative tests: inserting `('rent','plot')` and `('sale','Rented')` must fail.
- Manual checklist: hover / keyboard / touch behaviour at 375, 768, 1024 and 1440 px; each Buy and Rent category link; deep links and refresh on `/rent/shop`; Add / Edit property for both purposes; back button after changing filters.
- `npm run lint` and `npm run build` pass.

## 13. Acceptance criteria

1. The header shows Buy and Rent; hovering or focusing each opens its category panel with correct categories and counts; Rent has no Plot.
2. On mobile the panel has Buy and Rent accordions that navigate and close the panel.
3. `/buy/flat` shows only available sale listings in the Flat category; `/rent/shop` only rent listings in Shop; `/buy` and `/rent` show all categories of that purpose; `/properties` shows everything.
4. `/rent/plot`, `/sell`, `/buy/unknown` render the 404 page.
5. The admin form requires "Listed for", offers only valid categories and statuses for it, and the database rejects invalid combinations even if the form is bypassed.
6. Existing mock listings appear under Buy with the right category (Apartment → Flat); no listing disappears or lands in the wrong purpose without being flagged by the verification queries.
7. Rent prices display with "/ month", and the price slider on `/rent…` uses the rent range.
8. Page titles / descriptions are specific to each purpose + category.
9. Migrations 1 to 3 are in git with down scripts, and migration 2 only runs after the verification queries return zero rows.
10. Lint, build and the new unit tests pass.

## 14. Decisions (resolved)

1. **Database design in section 3: approved.**
2. **Migrations: Option A.** SQL files live in `supabase/migrations/` and are pasted into the Supabase SQL editor by whoever owns the database. No new tooling now; the files are CLI-compatible, so switching to the Supabase CLI later needs no rewrite.
3. **Live schema:** inferred from code (section 3.10). Migration 2 is gated on the verification queries, run by the database owner when available, who also confirms public sign-up is off.
4. **Delete the unrouted `Index.tsx` / `SupabaseTest.tsx`:** yes (recommended default).
5. **Hamburger breakpoint moves to `lg`:** yes (recommended default).
