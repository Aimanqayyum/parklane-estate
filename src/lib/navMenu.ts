import type { ListingMenu, MenuCategory } from '@/types/property';

/** What a header nav entry for a purpose needs (a subset of MenuPurpose). */
export interface NavPurpose {
  slug: string;
  navLabel: string;
  label: string;
  urlSegment: string;
  totalCount: number;
  /** Empty while loading or in the fallback. */
  categories: MenuCategory[];
}

/**
 * ready    - menu loaded: dropdowns / accordions with categories
 * loading  - placeholders, so the header does not shift when the menu arrives
 * fallback - the request failed: two plain links, no dropdowns
 */
export type NavState = 'ready' | 'loading' | 'fallback';

/** Used only while the menu is loading or if it cannot be loaded (spec section 5). */
export const FALLBACK_PURPOSES: NavPurpose[] = [
  { slug: 'sale', navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', totalCount: 0, categories: [] },
  { slug: 'rent', navLabel: 'Rent', label: 'For Rent', urlSegment: 'rent', totalCount: 0, categories: [] },
];

export function navPurposes(
  menu: ListingMenu,
  status: { isLoading: boolean; isError: boolean },
): { state: NavState; purposes: NavPurpose[] } {
  if (status.isLoading) return { state: 'loading', purposes: FALLBACK_PURPOSES };
  if (status.isError) return { state: 'fallback', purposes: FALLBACK_PURPOSES };
  return { state: 'ready', purposes: menu };
}

/** True for '/buy' and anything below it, but not look-alikes such as '/buyers'. */
export function isUnderPurpose(pathname: string, urlSegment: string): boolean {
  const base = `/${urlSegment}`;
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * True when the path is a real listing page (/buy, /rent/flat), i.e. one that
 * renders the hero. Paths that resolve to the 404 page return false.
 */
export function isListingPath(pathname: string, purposes: NavPurpose[]): boolean {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return false;
  const purpose = purposes.find((p) => p.urlSegment === parts[0].toLowerCase());
  if (!purpose) return false;
  if (parts.length === 1) return true;
  // Categories are unknown while loading / in the fallback: accept.
  if (purpose.categories.length === 0) return true;
  return purpose.categories.some((c) => c.slug === parts[1].toLowerCase());
}
