import { describe, it, expect } from 'vitest';
import { navPurposes, isUnderPurpose, isListingPath, FALLBACK_PURPOSES } from './navMenu';
import type { ListingMenu } from '@/types/property';

const menu: ListingMenu = [
  {
    slug: 'sale', navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', closedStatus: 'Sold',
    priceSuffix: '', priceSliderMax: 1, priceSliderStep: 1, totalCount: 7,
    categories: [
      { slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 5 },
      { slug: 'plot', label: 'Plot', labelPlural: 'Plots', icon: 'LandPlot', count: 2 },
    ],
  },
  {
    slug: 'rent', navLabel: 'Rent', label: 'For Rent', urlSegment: 'rent', closedStatus: 'Rented',
    priceSuffix: '/ month', priceSliderMax: 1, priceSliderStep: 1, totalCount: 3,
    categories: [{ slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 3 }],
  },
];

describe('navPurposes', () => {
  it('uses the menu when it has loaded', () => {
    const r = navPurposes(menu, { isLoading: false, isError: false });
    expect(r.state).toBe('ready');
    expect(r.purposes.map((p) => p.navLabel)).toEqual(['Buy', 'Rent']);
    expect(r.purposes[0].categories).toHaveLength(2);
  });

  it('shows placeholder Buy / Rent triggers while loading', () => {
    const r = navPurposes([], { isLoading: true, isError: false });
    expect(r.state).toBe('loading');
    expect(r.purposes.map((p) => p.urlSegment)).toEqual(['buy', 'rent']);
    expect(r.purposes.every((p) => p.categories.length === 0)).toBe(true);
  });

  it('falls back to two plain links when the request fails', () => {
    const r = navPurposes([], { isLoading: false, isError: true });
    expect(r.state).toBe('fallback');
    expect(r.purposes).toEqual(FALLBACK_PURPOSES);
  });

  it('shows nothing when the database has no active purposes', () => {
    const r = navPurposes([], { isLoading: false, isError: false });
    expect(r.state).toBe('ready');
    expect(r.purposes).toEqual([]);
  });
});

describe('isUnderPurpose', () => {
  it('matches the purpose page and anything below it', () => {
    expect(isUnderPurpose('/buy', 'buy')).toBe(true);
    expect(isUnderPurpose('/buy/flat', 'buy')).toBe(true);
  });

  it('does not match other paths or look-alike prefixes', () => {
    expect(isUnderPurpose('/rent', 'buy')).toBe(false);
    expect(isUnderPurpose('/buyers', 'buy')).toBe(false);
    expect(isUnderPurpose('/', 'buy')).toBe(false);
  });
});

describe('isListingPath', () => {
  const { purposes } = navPurposes(menu, { isLoading: false, isError: false });

  it('is true for valid purpose and purpose + category paths', () => {
    expect(isListingPath('/buy', purposes)).toBe(true);
    expect(isListingPath('/rent/flat', purposes)).toBe(true);
  });

  it('is false for pages that render the 404 (no hero)', () => {
    expect(isListingPath('/rent/plot', purposes)).toBe(false);
    expect(isListingPath('/buy/unknown', purposes)).toBe(false);
    expect(isListingPath('/sell', purposes)).toBe(false);
    expect(isListingPath('/buy/flat/extra', purposes)).toBe(false);
  });

  it('accepts any category when the categories are not known yet', () => {
    const loading = navPurposes([], { isLoading: true, isError: false }).purposes;
    expect(isListingPath('/buy/flat', loading)).toBe(true);
    expect(isListingPath('/sell', loading)).toBe(false);
  });
});
