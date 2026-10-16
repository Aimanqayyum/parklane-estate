# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Park Lane Estate: a real-estate marketing site (Karachi properties) with a public site and an `/admin` panel. Vite + React 18 + TypeScript SPA, shadcn/ui (Radix + Tailwind), React Router v6, with Supabase as the entire backend (no custom server). Scaffolded by Lovable (hence `lovable-tagger` in dev mode and the boilerplate README).

## Active initiative: Buy / Rent mega-menu (spec-driven)

Work follows `intent.md` → `spec.md` → `plan.md` → implementation. All three documents exist and the spec is **approved**. When asked to develop, build, continue or "start" this feature:

1. Read `plan.md` first, in particular its **Progress** checklist, and resume at the first unchecked task. Read the matching `spec.md` section (the plan cites them as §) before writing code. Do not redesign what the spec already decided; if something in it is wrong, say so and update the spec first.
2. Tick the task off in the `plan.md` Progress checklist as each one is finished, and commit per task on branch `feature/buy-rent-menu`.
3. Run `npm run lint`, `npm run build` and `npm run test` at the end of every phase.

Rules specific to this initiative:

- **Never run SQL against the database.** The project owner's friend owns the Supabase project and applies the migrations by hand. Only write the files in `supabase/migrations/` (+ `supabase/verify.sql`, `supabase/README.md`).
- **Deploy order is fixed:** migration 1 is applied first, then the code. Migration 2 (constraints) only after `supabase/verify.sql` returns zero rows. Migration 3 (drop `property_type`) only after a stable release cycle.
- The live schema was **inferred from code** (spec §3.10), not observed. Don't assume RLS policies or constraints beyond what the spec lists.
- Purposes (`sale` / `rent`, shown as Buy / Rent), categories and which categories each purpose allows live in database tables and are read through `get_listing_menu()`; don't hard-code category lists in components. There is deliberately no "Sell" menu.
- Until migration 1 is applied to a database, new code can be type-checked and unit-tested but not tried end to end in the browser. Say so rather than claiming it was verified.

The architecture notes below describe the code **before** this change (`property_type`, flat `/properties` listing); update them as phases land (plan task 7.3).

## Commands

```sh
npm run dev         # Vite dev server on port 8080
npm run build       # production build (build:dev for development mode)
npm run lint        # eslint .
npm run test        # vitest run (jsdom, src/**/*.{test,spec}.{ts,tsx})
npx vitest run src/path/to/file.test.ts   # single test file
npm run test:watch
```

Both `package-lock.json` and `bun.lockb` exist; npm is what the scripts/docs use.

## Environment

`src/utils/supabase.ts` throws at import time unless `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (use a `.env.local`; `*.local` is gitignored). Because it throws on import, any test or page importing it needs these defined.

## Architecture

- **Routing** (`src/App.tsx`): two route trees. Public pages render inside `MainLayout` (Header/Footer/WhatsApp button); `/admin/*` routes are wrapped in `ProtectedRoute` + `AdminLayout`, with `/admin/login` outside protection. `vercel.json` rewrites all paths to `index.html` for SPA deep links.
- **Data access**: there is no API/service layer. Components and pages call the shared `supabase` client (`@/utils/supabase`) directly with local `useState`/`useEffect` fetching. React Query's `QueryClientProvider` is mounted but pages mostly don't use it. Each page re-declares its own `Property` interface rather than sharing one.
- **Supabase schema as used by the code**: tables `properties` (columns like `slug`, `title`, `project_name`, `price`, `location`, `property_type`, `bedrooms`, `bathrooms`, `area_sqft`, `images[]`, `status`, `featured`, `video_url`, lat/long), `property_*` related table(s), and `contact_submissions` (written by the public `ContactForm`, read in admin). Images live in the `property-images` storage bucket; deleting a property must also remove its bucket files (see `PropertyList.tsx`).
- **Auth**: Supabase email auth only. `ProtectedRoute` gates on `supabase.auth.getSession()` plus `onAuthStateChange`; real authorization relies on Supabase RLS, not on the client.
- **Properties are addressed by `slug`**, not id (`/properties/:slug`, `/admin/properties/edit/:slug`). Slugs come from `generateSlug` in `src/utils/slugify.ts`, used by `AddProperty` and `EditProperty`; admin create/edit share `components/admin/PropertyForm.tsx` (image upload/reorder included).
- **Listing page** (`PropertiesListing.tsx`): filter state is initialized from URL search params; pagination is server-side (`ITEMS_PER_PAGE = 12`) with sort options featured/newest/price.
- **SEO**: use `components/common/SEO.tsx` (react-helmet-async) on each page.

## Conventions

- Path alias `@/` → `src/`.
- `src/components/ui/` is shadcn-generated (`components.json`); prefer adding via shadcn rather than hand-editing. Note `use-toast` exists in both `src/hooks/` and `src/components/ui/`, and both a Radix `Toaster` and Sonner are mounted.
- `src/pages/Index.tsx` and `components/SupabaseTest.tsx` are leftover connectivity-test scaffolding, not routed in `App.tsx`; the real home page is `pages/Home.tsx`.
- Styling is Tailwind with theme tokens in `src/index.css` / `tailwind.config.ts`; scroll animations use `ScrollReveal`/`StaggerReveal` components.
