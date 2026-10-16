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
