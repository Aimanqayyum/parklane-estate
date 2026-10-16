-- Migration 2 of 3: CONSTRAIN (spec §3.4 phase 2, §3.8)
--
-- !!! DO NOT RUN until supabase/verify.sql returns ZERO ROWS for all three
-- !!! checks, and the new code has been deployed.
--
-- Makes purpose / category mandatory, adds the composite foreign key that
-- enforces "no Plot under Rent", and adds the trigger that keeps status in
-- line with the purpose (Available, plus Sold for sale / Rented for rent).
--
-- If this fails on SET NOT NULL or the foreign key, a row still needs fixing:
-- run supabase/verify.sql to see which. The transaction rolls back cleanly.

begin;

alter table public.properties
  alter column purpose  set not null,
  alter column category set not null,
  add constraint properties_purpose_category_fk
    foreign key (purpose, category)
    references public.purpose_categories (purpose, category)
    on update cascade on delete restrict;

-- Status must fit the purpose: 'Available' always, plus that purpose's closed status.
create or replace function public.properties_check_status() returns trigger
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

drop trigger if exists properties_check_status on public.properties;
create trigger properties_check_status
  before insert or update of status, purpose on public.properties
  for each row execute function public.properties_check_status();

commit;

-- ---------------------------------------------------------------------------
-- down (rollback). Uncomment and run ONLY if migration 3 is not applied.
-- ---------------------------------------------------------------------------
-- begin;
-- drop trigger if exists properties_check_status on public.properties;
-- drop function if exists public.properties_check_status();
-- alter table public.properties drop constraint if exists properties_purpose_category_fk;
-- alter table public.properties
--   alter column purpose  drop not null,
--   alter column category drop not null;
-- commit;
