/** One row returned by the `get_listing_menu()` database function. */
export interface MenuRow {
  purpose: string;
  nav_label: string;
  label: string;
  url_segment: string;
  purpose_order: number;
  closed_status: string;
  price_suffix: string;
  price_slider_max: number;
  price_slider_step: number;
  category: string;
  category_label: string;
  category_label_plural: string;
  icon: string;
  category_order: number;
  listing_count: number;
}

export interface MenuCategory {
  slug: string;
  label: string;
  labelPlural: string;
  /** lucide-react icon name; the UI falls back to a default if unknown. */
  icon: string;
  /** Number of Available listings in this purpose + category. */
  count: number;
}

export interface MenuPurpose {
  /** Database key, e.g. 'sale' or 'rent'. */
  slug: string;
  /** Shown in the header, e.g. 'Buy'. */
  navLabel: string;
  /** e.g. 'For Sale'. */
  label: string;
  /** Public path word, e.g. 'buy'. */
  urlSegment: string;
  /** Status once the deal is done: 'Sold' / 'Rented'. */
  closedStatus: string;
  /** '' for sale, '/ month' for rent. */
  priceSuffix: string;
  priceSliderMax: number;
  priceSliderStep: number;
  /** Categories allowed under this purpose, in menu order. */
  categories: MenuCategory[];
  /** Sum of the category counts. */
  totalCount: number;
}

/** The menu grouped as purposes -> categories, in display order. */
export type ListingMenu = MenuPurpose[];

/** Fields shared by every place a property is shown in a list. */
export interface PropertyListItem {
  id: string;
  slug: string;
  title: string;
  project_name: string | null;
  price: number;
  location: string;
  purpose: string;
  category: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  images: string[] | null;
  status: string;
  featured: boolean;
}

/** A full property row, as shown on the detail page. */
export interface PropertyDetailData extends PropertyListItem {
  description: string | null;
  video_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
  updated_at?: string;
}
