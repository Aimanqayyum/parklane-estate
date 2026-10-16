-- Migration 3 of 3: CONTRACT (spec §3.4 phase 3)
--
-- !!! Run ONLY after migration 2 is applied AND the new code has been live for
-- !!! one stable release cycle with nothing reading `property_type`.
-- !!! Take a database backup first: dropping a column cannot be undone
-- !!! without one.
--
-- Retires the old free-text `property_type` column. `category` replaces it.

begin;

alter table public.properties drop column property_type;

commit;

-- ---------------------------------------------------------------------------
-- down (rollback). Re-creates the column and re-derives it from `category`.
-- The original free-text values (e.g. 'Apartment' vs 'Flat') are NOT recovered
-- by this; restore them from the backup if they matter.
-- ---------------------------------------------------------------------------
-- begin;
-- alter table public.properties add column property_type text;
-- update public.properties p
--    set property_type = c.label
--   from public.property_categories c
--  where c.slug = p.category;
-- commit;
