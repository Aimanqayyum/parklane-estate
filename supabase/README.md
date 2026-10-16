# Database changes for the Buy / Rent menu

For whoever owns the Supabase project. You do not need to read any code. You paste three SQL files into the **SQL Editor** (Supabase dashboard → SQL Editor → New query), in order, and run a check script between them.

Nothing here is run automatically. Nobody else touches the database.

## Before you start

1. **Take a backup.** Dashboard → Database → Backups (or `pg_dump`). Do this before step 1 and again before step 3.
2. Check that your Supabase plan lets you restore from it.

## The order matters

| Step | File | When | What it does |
|------|------|------|--------------|
| 1 | `migrations/20261016000001_listing_purposes_expand.sql` | **Before** the new website code goes live | Adds the Buy / Rent tables, labels existing listings, adds the menu function. Removes nothing. |
| 2 | `migrations/20261016000002_listing_purposes_constrain.sql` | After the new code is live **and** the checks below are clean | Makes the new fields mandatory and stops invalid combinations (a Plot for rent, a "Sold" rental). |
| 3 | `migrations/20261016000003_listing_purposes_contract.sql` | Only after the site has run happily for a while (a week or two) | Removes the old `property_type` column. |

**Never deploy the new website code before step 1.** The listing pages would fail because the new columns don't exist yet.

## Step 1: run the first file

Open the file, copy everything, paste into the SQL Editor, press Run.

- It runs as a single transaction: it either fully applies or does nothing.
- Safe to run twice.
- If it stops with **"Backfill stopped: these properties have a property_type that has no matching category"**, it listed the offending listings. Nothing was changed. Send the list to the developer; they will tell you how to map them (or you can fix the rows' `property_type` to one of: Apartment, Flat, Bungalow, Penthouse, Plot, Shop, Office, and run again).

When it succeeds, tell the developer. The code can now be deployed.

## Step 2: check, then run the second file

1. Open `verify.sql`. Run the three queries in **Part A**. **Each must return zero rows.**
2. If any returns rows, those listings need fixing first (for example, a listing added through the old admin form after step 1 has no purpose). Fix them in the admin panel, or ask the developer.
3. Only when all three are empty, run the second migration file.
4. Then run the two blocks in **Part B** of `verify.sql`, one at a time. They try to save bad data and must be **rejected**. "Success. No rows returned" means the rule works. An error starting with `TEST FAILED` means it doesn't. Tell the developer.
5. In the dashboard, Authentication → Providers → Email: confirm **public sign-ups are disabled**. Anyone signed in can currently edit properties, so open sign-up would let any visitor do that.

## Step 3: later

After the new site has been live for a while with no problems, take another backup and run the third file. This cannot be undone without a backup.

## Rolling back

Each migration file ends with a commented **`-- down`** section. To undo a step, copy that section, remove the leading `-- `, and run it. Undo in reverse order: 3, then 2, then 1. Also revert the website deploy (Vercel keeps previous builds) before undoing step 1.

## Adding categories or purposes later

No code change needed. Examples (see the spec, section 3.9):

```sql
-- A new category, allowed under both Buy and Rent:
insert into property_categories (slug, label, label_plural, icon, sort_order) values ('land', 'Land', 'Lands', 'Trees', 7);
insert into purpose_categories (purpose, category, sort_order) values ('sale','land',7), ('rent','land',6);

-- Hide a category from the site without touching listings:
update purpose_categories set is_active = false where purpose = 'rent' and category = 'office';
```
