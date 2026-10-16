import { describe, it, expect } from 'vitest';
import {
  groupMenu,
  categoriesFor,
  resolveRoute,
  buildListingPath,
  statusOptionsFor,
  changePurpose,
} from './listingMenu';
import type { MenuRow } from '@/types/property';

const purposeBase = {
  sale: {
    purpose: 'sale', nav_label: 'Buy', label: 'For Sale', url_segment: 'buy', purpose_order: 1,
    closed_status: 'Sold', price_suffix: '', price_slider_max: 500000000, price_slider_step: 10000000,
  },
  rent: {
    purpose: 'rent', nav_label: 'Rent', label: 'For Rent', url_segment: 'rent', purpose_order: 2,
    closed_status: 'Rented', price_suffix: '/ month', price_slider_max: 2000000, price_slider_step: 50000,
  },
};

const row = (
  p: keyof typeof purposeBase,
  category: string,
  category_order: number,
  listing_count: number,
): MenuRow => ({
  ...purposeBase[p],
  category,
  category_label: category[0].toUpperCase() + category.slice(1),
  category_label_plural: category[0].toUpperCase() + category.slice(1) + 's',
  icon: 'Home',
  category_order,
  listing_count,
});

// Deliberately shuffled, to prove grouping does not rely on input order.
const rows: MenuRow[] = [
  row('rent', 'shop', 2, 0),
  row('sale', 'flat', 2, 5),
  row('rent', 'flat', 1, 3),
  row('sale', 'plot', 3, 4),
  row('sale', 'bungalow', 1, 2),
];

describe('groupMenu', () => {
  it('returns an empty menu for no rows', () => {
    expect(groupMenu([])).toEqual([]);
  });

  it('groups rows into purposes ordered by purpose_order', () => {
    const menu = groupMenu(rows);
    expect(menu.map((p) => p.slug)).toEqual(['sale', 'rent']);
  });

  it('orders categories inside a purpose by category_order', () => {
    const menu = groupMenu(rows);
    expect(menu[0].categories.map((c) => c.slug)).toEqual(['bungalow', 'flat', 'plot']);
    expect(menu[1].categories.map((c) => c.slug)).toEqual(['flat', 'shop']);
  });

  it('maps purpose settings and totals the counts', () => {
    const [sale, rent] = groupMenu(rows);
    expect(sale).toMatchObject({
      navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', closedStatus: 'Sold',
      priceSuffix: '', priceSliderMax: 500000000, priceSliderStep: 10000000, totalCount: 11,
    });
    expect(rent).toMatchObject({
      navLabel: 'Rent', urlSegment: 'rent', closedStatus: 'Rented',
      priceSuffix: '/ month', priceSliderMax: 2000000, priceSliderStep: 50000, totalCount: 3,
    });
  });

  it('maps category fields and keeps zero counts', () => {
    const rent = groupMenu(rows)[1];
    expect(rent.categories[1]).toEqual({
      slug: 'shop', label: 'Shop', labelPlural: 'Shops', icon: 'Home', count: 0,
    });
  });

  it('coerces counts that arrive as strings (bigint over JSON)', () => {
    const odd = [{ ...row('sale', 'flat', 1, 0), listing_count: '7' as unknown as number }];
    expect(groupMenu(odd)[0].categories[0].count).toBe(7);
    expect(groupMenu(odd)[0].totalCount).toBe(7);
  });

  it('does not mutate its input', () => {
    const copy = JSON.parse(JSON.stringify(rows));
    groupMenu(rows);
    expect(rows).toEqual(copy);
  });
});

describe('categoriesFor', () => {
  const menu = groupMenu(rows);

  it('returns the categories of a purpose', () => {
    expect(categoriesFor(menu, 'rent').map((c) => c.slug)).toEqual(['flat', 'shop']);
  });

  it('returns an empty list for an unknown purpose', () => {
    expect(categoriesFor(menu, 'lease')).toEqual([]);
  });
});

describe('resolveRoute', () => {
  const menu = groupMenu(rows);

  it('resolves a purpose segment', () => {
    const r = resolveRoute(menu, 'buy');
    expect(r?.purpose.slug).toBe('sale');
    expect(r?.category).toBeNull();
  });

  it('resolves purpose + category', () => {
    const r = resolveRoute(menu, 'rent', 'shop');
    expect(r?.purpose.slug).toBe('rent');
    expect(r?.category?.slug).toBe('shop');
  });

  it('matches case-insensitively', () => {
    expect(resolveRoute(menu, 'Buy', 'FLAT')?.category?.slug).toBe('flat');
  });

  it('is not found for a category not allowed under the purpose (/rent/plot)', () => {
    expect(resolveRoute(menu, 'rent', 'plot')).toBeNull();
  });

  it('is not found for an unknown purpose segment (/sell)', () => {
    expect(resolveRoute(menu, 'sell')).toBeNull();
  });

  it('is not found for an unknown category (/buy/unknown)', () => {
    expect(resolveRoute(menu, 'buy', 'unknown')).toBeNull();
  });

  it('is not found when the purpose segment is missing', () => {
    expect(resolveRoute(menu, undefined)).toBeNull();
  });

  it('is not found against an empty menu', () => {
    expect(resolveRoute([], 'buy')).toBeNull();
  });
});

describe('buildListingPath', () => {
  it('builds a purpose path', () => {
    expect(buildListingPath('buy')).toBe('/buy');
  });

  it('builds a purpose + category path', () => {
    expect(buildListingPath('rent', 'shop')).toBe('/rent/shop');
  });

  it('treats an empty category as none', () => {
    expect(buildListingPath('rent', '')).toBe('/rent');
  });
});

describe('statusOptionsFor', () => {
  const menu = groupMenu(rows);

  it('is Available plus the closed status of the purpose', () => {
    expect(statusOptionsFor(menu, 'sale')).toEqual(['Available', 'Sold']);
    expect(statusOptionsFor(menu, 'rent')).toEqual(['Available', 'Rented']);
  });

  it('is just Available when no purpose is chosen yet', () => {
    expect(statusOptionsFor(menu, '')).toEqual(['Available']);
    expect(statusOptionsFor(menu, 'lease')).toEqual(['Available']);
  });
});

describe('changePurpose', () => {
  const menu = groupMenu(rows);

  it('keeps a category and status that are still valid', () => {
    expect(changePurpose(menu, { category: 'flat', status: 'Available' }, 'rent')).toEqual({
      category: 'flat', status: 'Available', clearedCategory: '',
    });
  });

  it('clears a category the new purpose does not allow, and reports it', () => {
    expect(changePurpose(menu, { category: 'plot', status: 'Available' }, 'rent')).toEqual({
      category: '', status: 'Available', clearedCategory: 'plot',
    });
  });

  it('resets a status that does not fit the new purpose to Available', () => {
    expect(changePurpose(menu, { category: 'flat', status: 'Sold' }, 'rent').status).toBe('Available');
  });

  it('keeps the closed status when it fits the new purpose', () => {
    expect(changePurpose(menu, { category: 'flat', status: 'Rented' }, 'rent').status).toBe('Rented');
  });

  it('does not report a cleared category when none was chosen', () => {
    expect(changePurpose(menu, { category: '', status: 'Available' }, 'rent').clearedCategory).toBe('');
  });
});
