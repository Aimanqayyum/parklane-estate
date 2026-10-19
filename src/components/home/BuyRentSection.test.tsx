import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ListingMenu } from '@/types/property';

const state = vi.hoisted(() => ({
  value: { menu: [] as unknown[], isLoading: false, isError: false },
}));

vi.mock('@/hooks/useListingMenu', () => ({
  useListingMenu: () => ({ ...state.value, refetch: () => {} }),
}));

import BuyRentSection from './BuyRentSection';

const menu: ListingMenu = [
  {
    slug: 'sale', navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', closedStatus: 'Sold',
    priceSuffix: '', priceSliderMax: 1, priceSliderStep: 1, totalCount: 6,
    categories: [
      { slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 5 },
      { slug: 'plot', label: 'Plot', labelPlural: 'Plots', icon: 'LandPlot', count: 1 },
    ],
  },
  {
    slug: 'rent', navLabel: 'Rent', label: 'For Rent', urlSegment: 'rent', closedStatus: 'Rented',
    priceSuffix: '/ month', priceSliderMax: 1, priceSliderStep: 1, totalCount: 0,
    categories: [{ slug: 'shop', label: 'Shop', labelPlural: 'Shops', icon: 'Store', count: 0 }],
  },
];

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

const renderSection = (value: { menu: unknown[]; isLoading: boolean; isError: boolean }) => {
  state.value = value;
  return render(
    <MemoryRouter>
      <BuyRentSection />
    </MemoryRouter>
  );
};

describe('BuyRentSection', () => {
  it('shows a Buy and a Rent card with counts and a browse-all link each', () => {
    renderSection({ menu, isLoading: false, isError: false });
    expect(screen.getByRole('heading', { level: 3, name: 'Buy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Rent' })).toBeInTheDocument();
    expect(screen.getByText('6 properties available')).toBeInTheDocument();
    expect(screen.getByText('0 properties available')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse all for sale/ })).toHaveAttribute('href', '/buy');
    expect(screen.getByRole('link', { name: /Browse all for rent/ })).toHaveAttribute('href', '/rent');
  });

  it('links each category chip to its filtered page, with its count', () => {
    renderSection({ menu, isLoading: false, isError: false });
    const buy = within(screen.getByRole('list', { name: 'Buy by property type' }));
    expect(buy.getByRole('link', { name: /Flat/ })).toHaveAttribute('href', '/buy/flat');
    expect(buy.getByRole('link', { name: /Flat/ })).toHaveTextContent('5');
    const rent = within(screen.getByRole('list', { name: 'Rent by property type' }));
    expect(rent.getByRole('link', { name: /Shop/ })).toHaveAttribute('href', '/rent/shop');
    expect(rent.queryByRole('link', { name: /Plot/ })).not.toBeInTheDocument();
  });

  it('keeps both cards while loading, with chip placeholders and no counts', () => {
    renderSection({ menu: [], isLoading: true, isError: false });
    expect(screen.getByRole('link', { name: /Browse all for sale/ })).toHaveAttribute('href', '/buy');
    expect(screen.queryByText(/properties available/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Flat/ })).not.toBeInTheDocument();
  });

  it('falls back to two plain cards when the menu failed', () => {
    renderSection({ menu: [], isLoading: false, isError: true });
    expect(screen.getByRole('link', { name: /Browse all for sale/ })).toHaveAttribute('href', '/buy');
    expect(screen.getByRole('link', { name: /Browse all for rent/ })).toHaveAttribute('href', '/rent');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText(/properties available/)).not.toBeInTheDocument();
  });

  it('renders nothing when the database has no active purposes', () => {
    const { container } = renderSection({ menu: [], isLoading: false, isError: false });
    expect(container).toBeEmptyDOMElement();
  });
});
