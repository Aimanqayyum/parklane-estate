import type {
  ListingMenu,
  MenuCategory,
  MenuPurpose,
  MenuRow,
} from '@/types/property';

/** Turns the flat rows from `get_listing_menu()` into purposes -> categories. */
export function groupMenu(rows: MenuRow[]): ListingMenu {
  const purposes = new Map<string, { order: number; purpose: MenuPurpose; orders: Map<string, number> }>();

  for (const row of rows) {
    let entry = purposes.get(row.purpose);
    if (!entry) {
      entry = {
        order: Number(row.purpose_order),
        orders: new Map(),
        purpose: {
          slug: row.purpose,
          navLabel: row.nav_label,
          label: row.label,
          urlSegment: row.url_segment,
          closedStatus: row.closed_status,
          priceSuffix: row.price_suffix,
          priceSliderMax: Number(row.price_slider_max),
          priceSliderStep: Number(row.price_slider_step),
          categories: [],
          totalCount: 0,
        },
      };
      purposes.set(row.purpose, entry);
    }

    // bigint columns can arrive as strings, so coerce.
    const count = Number(row.listing_count);
    entry.purpose.categories.push({
      slug: row.category,
      label: row.category_label,
      labelPlural: row.category_label_plural,
      icon: row.icon,
      count,
    });
    entry.orders.set(row.category, Number(row.category_order));
    entry.purpose.totalCount += count;
  }

  return [...purposes.values()]
    .sort((a, b) => a.order - b.order)
    .map(({ purpose, orders }) => {
      purpose.categories.sort((a, b) => (orders.get(a.slug) ?? 0) - (orders.get(b.slug) ?? 0));
      return purpose;
    });
}

/** Categories allowed under a purpose (by database slug); empty if unknown. */
export function categoriesFor(menu: ListingMenu, purposeSlug: string): MenuCategory[] {
  return menu.find((p) => p.slug === purposeSlug)?.categories ?? [];
}

export interface ResolvedRoute {
  purpose: MenuPurpose;
  /** null on a purpose-only page such as /buy. */
  category: MenuCategory | null;
}

/**
 * Resolves URL params (`/:purposeSegment/:categorySlug?`) against the menu.
 * Returns null for anything that should render the 404 page: an unknown
 * segment, an unknown category, or a category not allowed under the purpose.
 */
export function resolveRoute(
  menu: ListingMenu,
  purposeSegment: string | undefined,
  categorySlug?: string,
): ResolvedRoute | null {
  if (!purposeSegment) return null;
  const segment = purposeSegment.toLowerCase();
  const purpose = menu.find((p) => p.urlSegment === segment);
  if (!purpose) return null;

  if (!categorySlug) return { purpose, category: null };

  const slug = categorySlug.toLowerCase();
  const category = purpose.categories.find((c) => c.slug === slug);
  return category ? { purpose, category } : null;
}

/** '/buy' or '/buy/flat'. Takes the purpose's URL segment, not its slug. */
export function buildListingPath(urlSegment: string, categorySlug?: string): string {
  return categorySlug ? `/${urlSegment}/${categorySlug}` : `/${urlSegment}`;
}

/** Status choices for a purpose: Available, plus that purpose's closed status. */
export function statusOptionsFor(menu: ListingMenu, purposeSlug: string): string[] {
  const purpose = menu.find((p) => p.slug === purposeSlug);
  return purpose ? ['Available', purpose.closedStatus] : ['Available'];
}

/**
 * What the admin form should hold after the purpose changes: the category is
 * cleared if the new purpose does not allow it (`clearedCategory` names the
 * one that was dropped, '' if none), and a status that no longer fits goes
 * back to Available.
 */
export function changePurpose(
  menu: ListingMenu,
  current: { category: string; status: string },
  newPurposeSlug: string,
): { category: string; status: string; clearedCategory: string } {
  const allowed = categoriesFor(menu, newPurposeSlug).some((c) => c.slug === current.category);
  const category = allowed ? current.category : '';
  const status = statusOptionsFor(menu, newPurposeSlug).includes(current.status)
    ? current.status
    : 'Available';
  return { category, status, clearedCategory: allowed ? '' : current.category };
}

/** "Flats For Rent", "Properties For Sale", or "Properties" on /properties. */
export function listingHeading(purpose: MenuPurpose | null, category: MenuCategory | null): string {
  if (purpose && category) return `${category.labelPlural} ${purpose.label}`;
  if (purpose) return `Properties ${purpose.label}`;
  return 'Properties';
}

/** Title, description and canonical path for a listing page. */
export function listingSeo(
  purpose: MenuPurpose | null,
  category: MenuCategory | null,
): { title: string; description: string; path: string } {
  if (!purpose) {
    return {
      title: 'Properties for Sale & Rent',
      description:
        "Browse luxury apartments, bungalows, offices, and plots for sale and rent in Karachi's premium locations - DHA, Clifton, and more.",
      path: '/properties',
    };
  }
  const what = category ? category.labelPlural : 'Properties';
  const forWhat = purpose.label.toLowerCase();
  return {
    title: `${what} ${purpose.label.replace(/^For/, 'for')} in Karachi`,
    description: `Browse ${what.toLowerCase()} ${forWhat} in Karachi's premium locations - DHA, Clifton and more. See photos, prices and details, or contact Park Lane Estate.`,
    path: buildListingPath(purpose.urlSegment, category?.slug),
  };
}

/** Where the Buy | Rent toggle goes: same category if the target has it, else the purpose page. */
export function togglePurposePath(target: MenuPurpose, categorySlug: string | null): string {
  const keep = categorySlug && target.categories.some((c) => c.slug === categorySlug);
  return buildListingPath(target.urlSegment, keep ? categorySlug : undefined);
}

/** Every category once (first-seen order across purposes), for filters that span purposes. */
export function allCategories(menu: ListingMenu): MenuCategory[] {
  const seen = new Map<string, MenuCategory>();
  for (const purpose of menu) {
    for (const category of purpose.categories) {
      if (!seen.has(category.slug)) seen.set(category.slug, category);
    }
  }
  return [...seen.values()];
}
