# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Park Lane Estate: a real-estate marketing site (Karachi properties) with a public site and an `/admin` panel. Vite + React 18 + TypeScript SPA, shadcn/ui (Radix + Tailwind), React Router v6, with Supabase as the entire backend (no custom server). Scaffolded by Lovable (hence `lovable-tagger` in dev mode and the boilerplate README).

## Buy / Rent mega-menu initiative (spec-driven)

Work followed `intent.md` → `spec.md` → `plan.md` → implementation, on branch `feature/buy-rent-menu`. **All code phases (0 to 7) are done.** What remains is Phase 8 in `plan.md`: the release steps, several of which are done by the database owner. When asked to continue this feature:

1. Read `plan.md` first, in particular its **Progress** checklist, and resume at the first unchecked task. Read the matching `spec.md` section (the plan cites them as §) before changing anything. Do not redesign what the spec already decided; if something in it is wrong, say so and update the spec first (this happened once: `get_listing_menu()` also returns the purpose settings).
2. Tick the task off in the `plan.md` Progress checklist as each one is finished, and commit per task.
3. Run `npm run lint`, `npm run build` and `npm run test`. Lint has 5 pre-existing errors (baseline recorded in `plan.md`); do not add new ones.

Rules that still apply:

- **Never run SQL against the database.** The project owner's friend owns the Supabase project and applies the migrations by hand. Only write the files in `supabase/migrations/` (+ `supabase/verify.sql`, `supabase/README.md`).
- **Deploy order is fixed:** migration 1 is applied first, then the code. Migration 2 (constraints) only after `supabase/verify.sql` returns zero rows. Migration 3 (drop `property_type`) only after a stable release cycle.
- The live schema was **inferred from code** (spec §3.10), not observed. Don't assume RLS policies or constraints beyond what the spec lists.
- Purposes (`sale` / `rent`, shown as Buy / Rent), categories and which categories each purpose allows live in database tables and are read through `get_listing_menu()`; don't hard-code category lists in components. There is deliberately no "Sell" menu. The only hard-coded purposes are the two plain-link fallbacks in `src/lib/navMenu.ts`, used while the menu loads or if it fails.
- Until migration 1 is applied to a database, the new code is type-checked and unit-tested (Supabase is mocked in tests) but has **not** been tried end to end in a browser. Say so rather than claiming it was verified.

## Commands

```sh
npm run dev         # Vite dev server on port 8080
npm run build       # production build (build:dev for development mode)
npm run lint        # eslint .
npm run test        # vitest run (jsdom, src/**/*.{test,spec}.{ts,tsx})
npx vitest run src/path/to/file.test.ts   # single test file
npm run test:watch
```

Both `package-lock.json` and `bun.lockb` exist; npm is what the scripts/docs use. `npm install` can rewrite `package-lock.json`; don't commit that by accident.

## Environment

`src/utils/supabase.ts` throws at import time unless `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (use a `.env.local`; `*.local` is gitignored). Because it throws on import, any test or page importing it needs these defined, or mocks `@/utils/supabase` (the existing page tests do the latter).

## Architecture

- **Routing** (`src/App.tsx`): two route trees. Public pages render inside `MainLayout` (Header/Footer/WhatsApp button); `/admin/*` routes are wrapped in `ProtectedRoute` + `AdminLayout`, with `/admin/login` outside protection. `vercel.json` rewrites all paths to `index.html` for SPA deep links.
- **Public listing routes**: `/properties` (all purposes), `/:purposeSegment` (`/buy`, `/rent`) and `/:purposeSegment/:categorySlug` (`/buy/flat`) are all served by `PropertiesListing`. Segments are resolved against the menu data with `resolveRoute`; anything invalid (`/rent/plot`, `/sell`, `/buy/unknown`) renders `NotFound`. Static routes rank above the `:purposeSegment` params, so existing pages are unaffected. The url segment `buy` maps to purpose `sale`.
- **Purpose / category model**: tables `listing_purposes`, `property_categories`, `purpose_categories` (which category is allowed under which purpose) and the `get_listing_menu()` function (one round trip, live counts, and the per-purpose settings: closed status, price suffix, price slider range). `properties` has `purpose` and `category` columns; `property_type` is retired (migration 3 drops it) and no code reads or writes it. Status must fit the purpose (Available, plus Sold for sale or Rented for rent), enforced by migration 2.
- **Menu data layer**: `useListingMenu()` (`src/hooks/useListingMenu.ts`, React Query, 5 minute stale time) feeds the header, listing page, filters, cards, detail page and admin form. Pure helpers live in `src/lib/listingMenu.ts` (grouping, route resolution, path building, headings and SEO text, admin form rules), `src/lib/navMenu.ts` (header state: ready / loading / fallback) and `src/lib/related.ts`. Types are in `src/types/property.ts` (`PropertyListItem`, `PropertyDetailData`, menu types).
- **Other data access**: there is no API/service layer. Components and pages call the shared `supabase` client (`@/utils/supabase`) directly with local `useState`/`useEffect` fetching; React Query is used for the menu only.
- **Supabase tables as used by the code**: `properties` (`slug`, `title`, `project_name`, `price`, `location`, `purpose`, `category`, `bedrooms`, `bathrooms`, `area_sqft`, `images[]`, `status`, `featured`, `video_url`, lat/long, `view_count`), the three lookup tables above, and `contact_submissions` (written by the public `ContactForm`, read in admin). Images live in the `property-images` storage bucket; deleting a property must also remove its bucket files (see `PropertyList.tsx`).
- **`supabase/` folder**: `migrations/` (three timestamped SQL files: expand, constrain, contract, each with a commented down block), `verify.sql` (the zero-row checks before migration 2, plus negative tests after it) and `README.md` (plain-English steps for the database owner). Only written here, never run from here.
- **Header** (`components/common/Header.tsx`): order is Home, Buy, Rent, Properties, About Us, Services, FAQ, Contact. Desktop uses `MegaMenu` (Radix `navigation-menu`) from the `lg` breakpoint; below that the slide-out panel uses `MobileMenuSection` (accordion). If the menu request fails the header falls back to two plain Buy / Rent links. Listing paths count as dark-hero pages (light text over the hero); 404 paths under a purpose do not.
- **Auth**: Supabase email auth only. `ProtectedRoute` gates on `supabase.auth.getSession()` plus `onAuthStateChange`; real authorization relies on Supabase RLS, not on the client. Any signed-in user is effectively an admin, so public sign-up must stay disabled in Supabase Auth (flagged to the database owner).
- **Properties are addressed by `slug`**, not id (`/properties/:slug`, `/admin/properties/edit/:slug`). Slugs come from `generateSlug` in `src/utils/slugify.ts`, used by `AddProperty` and `EditProperty`; admin create/edit share `components/admin/PropertyForm.tsx` (image upload/reorder included). The form has a required "Listed for" select; category and status options follow the chosen purpose, and a database rejection shows in the error toast.
- **Listing page** (`PropertiesListing.tsx`): purpose and category come from the route; other filters are initialized from URL search params (`?type=` on `/properties` takes a category slug, case-insensitive, unknown ignored). Pagination is server-side (`ITEMS_PER_PAGE = 12`) with sort options featured/newest/price. The component remounts per purpose + category, so page and sort reset. `ListingHeader` provides the breadcrumb, Buy | Rent toggle and category chips; the price slider range comes from the purpose.
- **Prices**: `formatPrice(price, suffix?)`; the suffix (`/ month` for rent) comes from the purpose via the menu.
- **SEO**: use `components/common/SEO.tsx` (react-helmet-async) on each page.

## Conventions

- Path alias `@/` → `src/`.
- `src/components/ui/` is shadcn-generated (`components.json`); prefer adding via shadcn rather than hand-editing. Note `use-toast` exists in both `src/hooks/` and `src/components/ui/`, and both a Radix `Toaster` and Sonner are mounted.
- The real home page is `pages/Home.tsx`. (The old `pages/Index.tsx` and `components/SupabaseTest.tsx` connectivity scaffolding was deleted.)
- Several older files are formatted with a leading space on every line; edit them in place and keep their style rather than reformatting whole files.
- Tests: pure logic is written test-first (`src/lib/*.test.ts`); pages and components that touch Supabase mock `@/utils/supabase` and `@/hooks/useListingMenu`. jsdom lacks `ResizeObserver` / `IntersectionObserver`, so tests that render Radix or reveal components stub them locally.
- Styling is Tailwind with theme tokens in `src/index.css` / `tailwind.config.ts`; scroll animations use `ScrollReveal`/`StaggerReveal` components.
