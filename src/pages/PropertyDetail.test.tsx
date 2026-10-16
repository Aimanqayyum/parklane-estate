import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { ListingMenu } from '@/types/property';

const { calls, property } = vi.hoisted(() => {
  const calls: { method: string; args: unknown[] }[] = [];
  const property = {
    id: 'p1', slug: 'shop-1', title: 'Corner Shop', project_name: null, description: 'A nice shop for rent.',
    price: 150000, location: 'Saddar', purpose: 'rent', category: 'shop', bedrooms: null, bathrooms: null,
    area_sqft: null, images: [], video_url: null, latitude: null, longitude: null,
    status: 'Available', featured: false,
  };
  return { calls, property };
});

vi.mock('@/utils/supabase', () => {
  // Awaiting the query builder yields the related list; maybeSingle() yields the property.
  const chain: unknown = new Proxy({}, {
    get(_t, prop: string) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve({ data: [], error: null });
      }
      if (prop === 'maybeSingle') {
        return () => Promise.resolve({ data: property, error: null });
      }
      return (...args: unknown[]) => {
        calls.push({ method: prop, args });
        return chain;
      };
    },
  });
  return { supabase: { from: () => chain, rpc: () => Promise.resolve({ data: null, error: null }) } };
});

const menu: ListingMenu = [
  {
    slug: 'sale', navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', closedStatus: 'Sold',
    priceSuffix: '', priceSliderMax: 1, priceSliderStep: 1, totalCount: 0,
    categories: [{ slug: 'shop', label: 'Shop', labelPlural: 'Shops', icon: 'Store', count: 0 }],
  },
  {
    slug: 'rent', navLabel: 'Rent', label: 'For Rent', urlSegment: 'rent', closedStatus: 'Rented',
    priceSuffix: '/ month', priceSliderMax: 1, priceSliderStep: 1, totalCount: 1,
    categories: [{ slug: 'shop', label: 'Shop', labelPlural: 'Shops', icon: 'Store', count: 1 }],
  },
];

vi.mock('@/hooks/useListingMenu', () => ({
  useListingMenu: () => ({ menu, isLoading: false, isError: false, refetch: () => {} }),
}));

import PropertyDetail from './PropertyDetail';

beforeAll(() => {
  // Reveal-on-scroll and the gallery observe elements; jsdom has neither API.
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  calls.length = 0;
});

const renderDetail = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/properties/shop-1']}>
        <Routes>
          <Route path="/properties/:slug" element={<PropertyDetail />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe('PropertyDetail', () => {
  it('shows the rent price with its suffix', async () => {
    renderDetail();
    const prices = await screen.findAllByText('PKR 1.50 Lac / month');
    expect(prices.length).toBeGreaterThan(0);
  });

  it('breadcrumb links back to the purpose and category pages', async () => {
    renderDetail();
    const nav = (await screen.findAllByRole('link', { name: 'Rent' }))[0];
    expect(nav).toHaveAttribute('href', '/rent');
    expect(screen.getByRole('link', { name: 'Shops' })).toHaveAttribute('href', '/rent/shop');
  });

  it('shows the category label as the type', async () => {
    renderDetail();
    expect(await screen.findByText('Type')).toBeInTheDocument();
    expect(screen.getAllByText('Shop').length).toBeGreaterThan(0);
  });

  it('asks only for related properties of the same purpose', async () => {
    renderDetail();
    await waitFor(() =>
      expect(calls.filter((c) => c.method === 'eq').map((c) => c.args)).toContainEqual(['purpose', 'rent'])
    );
  });
});
