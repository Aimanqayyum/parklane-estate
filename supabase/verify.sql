-- Verification script for the Buy / Rent migration (spec §3.8, §12).
-- Copy-paste into the Supabase SQL editor. It only reads, except where noted.

-- ===========================================================================
-- PART A. Run BEFORE migration 2. Every query must return ZERO ROWS.
-- ===========================================================================

-- A1. Listings without a purpose or category (e.g. created through the old
--     admin form after migration 1).
select id, title, property_type, status
from public.properties
where purpose is null or category is null;

-- A2. Listings whose purpose + category pair is not allowed (e.g. a rent Plot).
select id, title, purpose, category
from public.properties p
where not exists (
  select 1 from public.purpose_categories pc
  where pc.purpose = p.purpose and pc.category = p.category
);

-- A3. Listings whose status does not fit their purpose (e.g. a sale "Rented").
select id, title, purpose, status
from public.properties p
where status <> 'Available'
  and status <> (select closed_status from public.listing_purposes where slug = p.purpose);

-- Optional: see the access rules on properties (not changed by these migrations).
-- select * from pg_policies where tablename = 'properties';

-- ===========================================================================
-- PART B. Run AFTER migration 2. Negative tests: the database must REJECT bad data.
-- Run each block on its own (select it, Run). Nothing is ever saved.
--   * "Success. No rows returned"  -> PASS (the bad insert was rejected)
--   * error starting "TEST FAILED" -> FAIL (the bad insert was accepted and
--     has been rolled back). Migration 2 is not working: tell the developer.
--   * any other error (e.g. a NOT NULL on another column such as description)
--     -> add a value for that column to the insert and run again.
-- ===========================================================================

-- B1. No Plot under Rent must be rejected by the foreign key.
do $$
begin
  insert into public.properties (slug, title, price, location, purpose, category, status)
  values ('verify-rent-plot', 'verify rent plot', 1, 'verify', 'rent', 'plot', 'Available');
  raise exception 'TEST FAILED: (rent, plot) was accepted';
exception when foreign_key_violation then
  null; -- expected
end $$;

-- B2. Status "Rented" on a sale listing must be rejected by the trigger.
do $$
begin
  insert into public.properties (slug, title, price, location, purpose, category, status)
  values ('verify-sale-rented', 'verify sale rented', 1, 'verify', 'sale', 'flat', 'Rented');
  raise exception 'TEST FAILED: status Rented on a sale listing was accepted';
exception when check_violation then
  null; -- expected
end $$;
