import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { MenuRow } from '@/types/property';

// --- mocks (must be declared before the page is imported) -------------------

const { calls, menuRows } = vi.hoisted(() => {
  const calls: { method: string; args: unknown[] }[] = [];

  // sale: flat + plot, rent: flat only (no plot under rent)
  const defs: [string, string, string, string, number, string, string, number, number][] = [
    ['sale', 'Buy', 'For Sale', 'buy', 1, 'Sold', '', 500000000, 10000000],
    ['rent', 'Rent', 'For Rent', 'rent', 2, 'Rented', '/ month', 2000000, 50000],
  ];
  const menuRows: MenuRow[] = defs.flatMap(
    ([purpose, nav_label, label, url_segment, purpose_order, closed_status, price_suffix, max, step]) =>
      (purpose === 'sale' ? ['flat', 'plot'] : ['flat']).map(
        (category, i): MenuRow => ({
          purpose, nav_label, label, url_segment, purpose_order, closed_status, price_suffix,
          price_slider_max: max,
          price_slider_step: step,
          category,
          category_label: category === 'flat' ? 'Flat' : 'Plot',
          category_label_plural: category === 'flat' ? 'Flats' : 'Plots',
          icon: 'Home',
          category_order: i + 1,
          listing_count: 0,
        })
      )
  );
  return { calls, menuRows };
});

vi.mock('@/utils/supabase', () => {
  // A chainable, awaitable stand-in for the query builder that records calls.
  const builder: Record<string, unknown> = {};
  const chain = new Proxy(builder, {
    get(_t, prop: string) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve({ data: [], error: null, count: 0 });
      }
      return (...args: unknown[]) => {
        calls.push({ method: prop, args });
        return chain;
      };
    },
  });
  return { supabase: { from: () => chain } };
});

vi.mock('@/hooks/useListingMenu', async () => {
  const { groupMenu } = await import('@/lib/listingMenu');
  const menu = groupMenu(menuRows);
  return {
    useListingMenu: () => ({ menu, isLoading: false, isError: false, refetch: () => {} }),
  };
});

import PropertiesListing from './PropertiesListing';

// The Radix price slider measures itself with ResizeObserver, which jsdom lacks.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/properties" element={<PropertiesListing />} />
          <Route path="/:purposeSegment" element={<PropertiesListing />} />
          <Route path="/:purposeSegment/:categorySlug" element={<PropertiesListing />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const eqCalls = () => calls.filter((c) => c.method === 'eq').map((c) => c.args);

describe('PropertiesListing routing', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('/buy/flat filters by purpose and category and shows the heading', async () => {
    renderAt('/buy/flat');
    expect(await screen.findByRole('heading', { level: 1, name: 'Flats For Sale' })).toBeInTheDocument();
    await waitFor(() => expect(eqCalls()).toContainEqual(['category', 'flat']));
    expect(eqCalls()).toContainEqual(['purpose', 'sale']);
    expect(eqCalls()).toContainEqual(['status', 'Available']);
  });

  it('/rent filters by purpose only', async () => {
    renderAt('/rent');
    expect(await screen.findByRole('heading', { level: 1, name: 'Properties For Rent' })).toBeInTheDocument();
    await waitFor(() => expect(eqCalls()).toContainEqual(['purpose', 'rent']));
    expect(eqCalls().some(([col]) => col === 'category')).toBe(false);
  });

  it('/properties has no purpose or category filter', async () => {
    renderAt('/properties');
    expect(await screen.findByRole('heading', { level: 1, name: 'Properties' })).toBeInTheDocument();
    await waitFor(() => expect(eqCalls()).toContainEqual(['status', 'Available']));
    expect(eqCalls().some(([col]) => col === 'purpose' || col === 'category')).toBe(false);
  });

  it('/properties?type=Flat (legacy capitalisation) filters by category', async () => {
    renderAt('/properties?type=Flat');
    await waitFor(() => expect(eqCalls()).toContainEqual(['category', 'flat']));
  });

  it('/properties?type=Unknown is ignored', async () => {
    renderAt('/properties?type=Unknown');
    await waitFor(() => expect(eqCalls()).toContainEqual(['status', 'Available']));
    expect(eqCalls().some(([col]) => col === 'category')).toBe(false);
  });

  it.each(['/rent/plot', '/sell', '/buy/unknown'])('%s renders the 404 page and does not query', async (path) => {
    renderAt(path);
    expect(await screen.findByText('Oops! Page not found')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });
});
