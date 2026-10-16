# Intent: Buy / Rent mega-menu navigation

Status: DRAFT, for review. Next steps: intent → spec → plan → implementation.

## Goal

Add Zameen.com-style navigation to the header. The top-level items are **Buy** and **Rent**, next to the existing **Properties** link. Hovering over Buy or Rent opens a dropdown (mega-menu) of property categories. Clicking a category opens a listing page already filtered to that purpose and category. The experience should be visibly cleaner and more premium than Zameen's, and match the site's existing gold / luxury look.

The admin dashboard must support this: when adding or editing a property, the admin chooses whether it is for sale or for rent, and that decides where it shows up on the site.

## Requested menu structure

| Menu | Categories |
|------|-----------|
| **Buy**  | Bungalow, Penthouse, Flat, Plot, Shop, Office |
| **Rent** | Bungalow, Flat, Penthouse, Shop, Office *(no Plot under Rent)* |

## Behaviour wanted

1. Desktop: hovering over Buy or Rent opens a dropdown with that menu's categories. It closes when the pointer leaves, and also works with keyboard focus and click.
2. Mobile: the slide-out panel gets expandable Buy / Rent sections (accordion), since hover doesn't exist on touch devices.
3. Clicking a category navigates to a page showing only the properties that match that purpose and category. The state lives in the URL, so links are shareable and the back button works.
4. The listing page shows the active purpose and category (heading, breadcrumb or tab), lets the user switch between them, and keeps the existing filters (location, price, bedrooms, project) and sorting.
5. Rent never shows Plot, in the menu or in the listing's category filter.
6. Admin: the property form has a required "Listed for" field (Sale / Rent). The list of property types in the form follows the same rule (no Plot when Rent is selected).

## Why this needs more than a header change (current state)

Findings from the codebase today:

- **The data has no Buy/Rent concept.** `properties` has `property_type` and `status` (`Available` / `Sold` / `Rented`). Nothing says whether a listing is for sale or for rent. The status values record what happened to a listing, not what it is offered for. Buy / Rent filtering needs a new field, `purpose` (`sale` | `rent`), set in the admin form.
- **Category list mismatch.** The current types are Apartment, Bungalow, Office, Shop, Plot (`PropertyForm.tsx`, `PropertyFilters.tsx`). The new list is Bungalow, Penthouse, Flat, Plot, Shop, Office: Penthouse and Flat are new, Apartment is gone, Office stays.
- The header (`src/components/common/Header.tsx`) is a floating pill with a flat link list. It has no dropdown pattern yet, and the mobile panel is a flat list.
- The listing page (`PropertiesListing.tsx`) already keeps filters in URL params and queries Supabase server-side, so purpose and category can be added to the same query.

## Proposed approach (high level, to be refined in the spec)

- Add a `purpose` column (`sale` | `rent`) to `properties` and add it to the admin property form (required). Existing listings are mock data, so the migration sets them to `sale` and they can be corrected in the admin panel.
- Define the menu structure (purpose → categories) in one config module that the header, the mobile panel, the listing filters and the admin form all read from. That keeps the "no Plot under Rent" rule in one place.
- Header: a desktop mega-menu built on the existing Radix / shadcn navigation-menu or hover-card, restyled to the site, plus an accordion section in the mobile panel.
- Listing: read purpose and category from the URL, filter the Supabase query, show the context in the page hero, and drop the Plot option while purpose = rent.
- Routing: clean paths `/buy`, `/buy/flat`, `/rent`, `/rent/shop` and so on, rendered by the listing page. The general `/properties` page keeps working, and extra filters (location, price, bedrooms, project) stay as query params.

## Recommendations for making it better than Zameen

These are proposals for us to accept or reject, not requirements.

1. **Counts next to each category** ("Flat · 24"), hiding empty categories or greying them out, so users never land on an empty page.
2. **Icon per category** and a short descriptor, which gives a cleaner look than Zameen's plain text lists.
3. **Featured / popular strip** inside the dropdown (top locations such as DHA, Clifton, or a featured listing), so one hover leads to location-based browsing too.
4. **Page `<title>` and meta description per combination** (for example "Flats for Rent in Karachi"), using the existing SEO component. This helps SEO for a real-estate site.
5. **"All properties" link** at the top of each dropdown ("All for Rent").
6. **Hover-intent delay** so the menu doesn't flicker when the mouse crosses the header, plus full keyboard and screen-reader support.
7. **Empty state** with a CTA to the contact form / WhatsApp when a purpose + category combination has no listings.
8. **Purpose toggle on the listing page** (Buy | Rent), so users can switch without going back to the menu.
9. **Admin cross-validation:** the admin form blocks Plot + Rent, so inconsistent data can't be created.

## Decisions made

- **No Sell menu.** Visitors come to buy or rent. Property for sale is added by the admin from the dashboard, so a Sell menu has no purpose for visitors. It can be added later if there is a real need.
- **Public posting is not allowed.** Only admins add listings.
- **Flat replaces Apartment.** Categories are Bungalow, Penthouse, Flat, Plot, Shop and Office.
- **Office stays,** and is added to both the Buy and Rent menus (Rent excludes only Plot). Existing Apartment rows (mock data) need to be moved to Flat in the migration.
- **The "Properties" link stays in the header** next to Buy and Rent for now.
- **Purpose values are `sale` and `rent`.** Buy shows `sale` listings, Rent shows `rent` listings.
- **Existing listings are mock data,** so the migration marks them `sale`.
- **URL style: clean paths** (`/buy/flat`, `/rent/shop`), because they read well, help SEO, and give each combination its own title.
- **Only `Available` listings are shown** on the public pages, as today.

## Open questions

None at the moment.

## Out of scope for this change

- Public user accounts, or letting visitors post listings themselves.
- A Sell menu or a "list your property" page.
- Payments, saved searches, alerts.
- Redesigning pages other than the header and the listing page.
