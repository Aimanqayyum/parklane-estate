# Plan: Buy / Rent mega-menu navigation

Derived from: `spec.md` (approved). Next step: implementation, phase by phase. Section numbers below (§) refer to the spec.

## Progress

Update this list as work lands (`[x]` when done and committed). A new session resumes at the first unchecked item.

- [x] 0.1 Branch `feature/buy-rent-menu` created
- [x] 0.2 Baseline lint / build / test recorded
- [x] 1.1 Migration 1 (expand) written
- [x] 1.2 Migration 2 (constrain) written
- [x] 1.3 Migration 3 (contract) written
- [x] 1.4 `supabase/verify.sql` written
- [x] 1.5 `supabase/README.md` written
- [x] 2.1 Shared types
- [x] 2.2 `listingMenu` helpers + tests
- [x] 2.3 `useListingMenu` hook
- [x] 2.4 `formatPrice` suffix + test
- [ ] 3.1 `PropertyForm` (purpose, category, status)
- [ ] 3.2 Add / Edit property pages
- [ ] 3.3 Admin property list (purpose badge + filter)
- [ ] 3.4 Dashboard split (optional)
- [ ] 4.1 Routes in `App.tsx`
- [ ] 4.2 `PropertiesListing` purpose / category
- [ ] 4.3 `ListingHeader` component
- [ ] 4.4 `PropertyFilters` changes
- [ ] 4.5 `EmptyState` changes
- [ ] 4.6 Per-page SEO
- [ ] 5.1 `MegaMenu` (desktop)
- [ ] 5.2 Mobile accordion
- [ ] 5.3 `Header` integration + `lg` breakpoint
- [ ] 6.1 `PropertyCard` / `PropertyGrid`
- [ ] 6.2 `PropertyDetail`
- [ ] 6.3 `FeaturedProperties`
- [ ] 7.1 Delete `Index.tsx` / `SupabaseTest.tsx`
- [ ] 7.2 No `property_type` left outside migrations
- [ ] 7.3 `CLAUDE.md` architecture notes updated
- [ ] 7.4 Mark intent / spec as implemented
- [ ] 8.1 to 8.6 Release steps (some done by the database owner; note who and when)

### Baseline (task 0.2, 2026-10-16, before any change)

- `npm run lint`: 12 problems = **5 errors, 7 warnings** (errors: `ui/command.tsx` and `ui/textarea.tsx` empty interfaces, `AddProperty.tsx:21` and `EditProperty.tsx:81` `prefer-const`, `tailwind.config.ts:143` `require()`). Not ours; do not add new ones.
- `npm run build`: passes (one chunk-size warning, 814 kB).
- `npm run test`: passes (1 test, `src/test/example.test.ts`).

## Ground rules

- Work on a branch `feature/buy-rent-menu`; one commit per task or tight group of tasks, so any step can be reverted alone.
- After every phase: `npm run lint`, `npm run build`, `npm run test` pass before moving on.
- **No SQL is run by me.** I write the migration files; the database owner applies them in the Supabase SQL editor.
- Pure logic (route resolution, menu grouping, path building, price formatting) is written test-first.

## The one dependency that matters

The new code reads `purpose` / `category` columns and calls `get_listing_menu()`. Those exist only after **migration 1** is applied.

- Phases 1 to 2 need no database at all (SQL files + pure functions with unit tests).
- Phases 3 to 7 can be written and type-checked without it, but **cannot be tried in the browser** until migration 1 is applied to the project's database.
- **Deploy order is fixed: migration 1 first, then the code.** Deploying the code first would make the listing pages fail (missing columns).

Because the database owner is not available yet, the plan front-loads everything that does not need the database, and I will tell you exactly when the first browser test needs migration 1.

---

## Phase 0: Branch and baseline

| Task | Detail |
|------|--------|
| 0.1 | Create branch `feature/buy-rent-menu`. |
| 0.2 | Run `npm install`, `npm run lint`, `npm run build`, `npm run test` once and note the baseline (existing lint errors are not ours to fix, but we must not add new ones). |

## Phase 1: Database files (§3)

No code changes. Output is files in git.

| Task | Files | Detail |
|------|-------|--------|
| 1.1 | `supabase/migrations/20261016000001_listing_purposes_expand.sql` | Tables, seed (idempotent), RLS policies, `property_type` made nullable, old CHECK dropped, `purpose` / `category` columns, backfill with fail-loud check, indexes, `get_listing_menu()`, grants. Ends with a commented `-- down` block. Wrapped in one transaction so it applies fully or not at all. |
| 1.2 | `supabase/migrations/20261016000002_listing_purposes_constrain.sql` | `NOT NULL`, composite FK, status trigger. Header comment: **do not run until `verify.sql` returns zero rows.** Commented `-- down`. |
| 1.3 | `supabase/migrations/20261016000003_listing_purposes_contract.sql` | Drop `property_type`. Header comment: run only after one stable release cycle. Commented `-- down`. |
| 1.4 | `supabase/verify.sql` | The three zero-row check queries from §3.8, plus negative tests (`('rent','plot')` and `('sale','Rented')` must fail), as a copy-paste script. |
| 1.5 | `supabase/README.md` | Short instructions for the database owner in plain English: backup first, order of the three files, how to run `verify.sql`, how to roll back. |

Done when: files exist, SQL reads correctly end to end, and every migration has its down block. (Syntax can only be truly proven on a real database; see Phase 8.)

## Phase 2: Types and data layer (§5)

Test-first for the pure parts.

| Task | Files | Detail |
|------|-------|--------|
| 2.1 | `src/types/property.ts` | Shared `PropertyListItem` / `PropertyDetailData` types with `purpose` and `category`; `MenuPurpose`, `MenuCategory` types. |
| 2.2 | `src/lib/listingMenu.ts` + `.test.ts` | `groupMenu(rows)`, `categoriesFor(menu, purpose)`, `resolveRoute(menu, purposeSegment, categorySlug)` (returns a result or "not found", including `/rent/plot`), `buildListingPath(purpose, category?)`. Tests written first. |
| 2.3 | `src/hooks/useListingMenu.ts` | React Query hook calling `supabase.rpc('get_listing_menu')`, stale time 5 min, typed result. |
| 2.4 | `src/utils/formatPrice.ts` + test | `formatPrice(price, suffix = '')`; existing output unchanged when no suffix. |

Done when: new unit tests pass, build passes.

## Phase 3: Admin (§9)

Done before the public pages so rent listings can be created for testing.

| Task | Files | Detail |
|------|-------|--------|
| 3.1 | `src/components/admin/PropertyForm.tsx` | Add required "Listed for" select; category options from the menu data for the chosen purpose; clear category with an inline message when invalid; status options = Available + that purpose's closed status; price label by purpose; replace hard-coded `PROPERTY_TYPES`. Form data gains `purpose` and `category` (replacing `propertyType`). |
| 3.2 | `src/pages/admin/AddProperty.tsx`, `EditProperty.tsx` | Write `purpose` and `category`; stop writing `property_type`; map loaded row into form data; surface DB rejection through the existing error toast. |
| 3.3 | `src/pages/admin/PropertyList.tsx` | Purpose badge per row and a purpose filter. |
| 3.4 | `src/pages/admin/AdminDashboard.tsx` | Optional "for sale / for rent" split if it takes a few lines; skip otherwise. |

Done when: lint, build pass; with migration 1 applied, an admin can add a rent Flat and a sale Plot, and cannot choose Plot while Rent is selected.

## Phase 4: Routes and listing page (§4, §7)

| Task | Files | Detail |
|------|-------|--------|
| 4.1 | `src/App.tsx` | Add `/:purposeSegment` and `/:purposeSegment/:categorySlug` inside `MainLayout`, below the static routes. |
| 4.2 | `src/pages/PropertiesListing.tsx` | Read purpose / category from route params via `resolveRoute`; render `NotFound` for invalid combinations; add `.eq('purpose')` / `.eq('category')`; reset page on change; stop using `property_type`; `?type=` accepts category slug (case-insensitive, unknown ignored). |
| 4.3 | `src/components/properties/ListingHeader.tsx` (new) | Heading, count, breadcrumb, Buy | Rent toggle, category chip row. |
| 4.4 | `src/components/properties/PropertyFilters.tsx` | Type buttons come from the menu data; hidden on purpose pages (chips replace them); price slider range / step from the purpose (sale range on `/properties`). |
| 4.5 | `src/components/properties/EmptyState.tsx` | Message for the purpose + category, actions: clear filters and WhatsApp / Contact. |
| 4.6 | SEO | Per-combination title, description and canonical via the existing `SEO` component. |

Done when: build passes; with migration 1 applied, `/buy`, `/buy/flat`, `/rent/shop`, `/properties` work, `/rent/plot` and `/sell` show 404, refresh and back button behave.

## Phase 5: Header (§6)

| Task | Files | Detail |
|------|-------|--------|
| 5.1 | `src/components/common/MegaMenu.tsx` (new) | Desktop panel on Radix `navigation-menu`: hover-intent (about 120 / 200 ms), keyboard support, count display, dimmed zero-count rows, "All for sale / rent" link, skeleton while loading, plain-links fallback on error. |
| 5.2 | `src/components/common/MobileMenuSection.tsx` (new) | Accordion sections for Buy and Rent in the slide-out panel, closing the panel on navigation. |
| 5.3 | `src/components/common/Header.tsx` | New order (Home, Buy, Rent, Properties, About Us, Services, FAQ, Contact); hamburger breakpoint `md` → `lg`; active state for `/buy…` and `/rent…`; light / dark text handling stays; add the new paths to `darkHeroPages` logic where relevant (listing pages keep their hero). |

Done when: manual check at 375, 768, 1024 and 1440 px: hover, click, keyboard (Tab, Enter, Arrow keys, Esc) and touch all work; no overflow of the pill at 1024 px.

## Phase 6: Cards, detail, home (§8)

| Task | Files | Detail |
|------|-------|--------|
| 6.1 | `PropertyCard.tsx`, `PropertyGrid.tsx` | Price suffix, "For Rent" badge, category label instead of `property_type`. |
| 6.2 | `PropertyDetail.tsx` | Price suffix, category label, breadcrumb to the purpose / category page, related properties from the same purpose (preferably category), SEO text. |
| 6.3 | `FeaturedProperties.tsx` | Select the new columns. |

Done when: sale and rent cards and detail pages render correctly with real data.

## Phase 7: Cleanup and docs (§10)

| Task | Detail |
|------|--------|
| 7.1 | Delete `src/pages/Index.tsx` and `src/components/SupabaseTest.tsx`; confirm nothing imports them. |
| 7.2 | `grep` for any remaining `property_type` use outside migrations. Must be zero. |
| 7.3 | Update `CLAUDE.md`: new routes, the purpose / category model, the `supabase/` folder and the migration order. |
| 7.4 | Mark `intent.md` / `spec.md` status as implemented when done. |

## Phase 8: Verification and release

| Task | Detail |
|------|--------|
| 8.1 | Full automated run: `npm run lint`, `npm run build`, `npm run test`. |
| 8.2 | **Database owner applies migration 1** (after a backup). I give them `supabase/README.md`. |
| 8.3 | Manual test pass against the spec's acceptance criteria (§13), items 1 to 8, on a local dev server pointed at the database. |
| 8.4 | Deploy the code (Vercel). |
| 8.5 | **Database owner runs `supabase/verify.sql`.** If clean, applies migration 2; the negative tests in `verify.sql` must now fail as expected. Confirms public sign-up is off. |
| 8.6 | After one stable release cycle with no `property_type` reads, apply migration 3. |

Rollback at any point: revert the code deploy (Vercel keeps previous builds), and use the matching `-- down` block for the migration step that was last applied. Migrations are undone in reverse order (3, 2, 1).

## Risks and how the plan handles them

| Risk | Handling |
|------|----------|
| Live schema differs from what the code implies | Migration 1 is defensive and wrapped in a transaction; the backfill aborts with a list instead of guessing; migration 2 is gated on verification. |
| Code deployed before migration 1 | Fixed deploy order in Phase 8, stated in `supabase/README.md` as well. |
| Eight header items crowd the pill | Breakpoint moves to `lg`, spacing tightens, checked at 1024 px in Phase 5. |
| Mock data contains a category I do not know | The fail-loud backfill lists the rows; you decide the mapping. |
| Anyone signed in is an admin | Out of scope here, flagged to the database owner as a separate hardening task. |

## Work order summary

1. Phase 0 and 1: branch, baseline, SQL files (no database needed)
2. Phase 2: types, helpers with tests (no database needed)
3. Phase 3 to 6: admin, listing, header, cards (written and type-checked now; browser-tested once migration 1 is applied)
4. Phase 7: cleanup, docs
5. Phase 8: apply migration 1 → test → deploy → verify → migration 2 → (later) migration 3
