import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ListingMenu } from '@/types/property';

const menu: ListingMenu = [
  {
    slug: 'sale', navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', closedStatus: 'Sold',
    priceSuffix: '', priceSliderMax: 1, priceSliderStep: 1, totalCount: 5,
    categories: [{ slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 5 }],
  },
  {
    slug: 'rent', navLabel: 'Rent', label: 'For Rent', urlSegment: 'rent', closedStatus: 'Rented',
    priceSuffix: '/ month', priceSliderMax: 1, priceSliderStep: 1, totalCount: 1,
    categories: [{ slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 1 }],
  },
];

vi.mock('@/hooks/useListingMenu', () => ({
  useListingMenu: () => ({ menu, isLoading: false, isError: false, refetch: () => {} }),
}));

import Header from './Header';

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>
  );

describe('Header', () => {
  it('lists Home, Buy, Rent, Properties, About Us, Services, FAQ, Contact in the desktop nav', () => {
    renderAt('/');
    const main = screen.getByRole('navigation', { name: 'Main' });
    const labels = within(main)
      .getAllByRole('listitem')
      .map((li) => li.textContent?.trim());
    expect(labels).toEqual(['Home', 'Buy', 'Rent', 'Properties', 'About Us', 'Services', 'FAQ', 'Contact']);
  });

  it('uses the light logo over the hero on listing pages', () => {
    renderAt('/buy/flat');
    expect(screen.getAllByAltText('Park Lane Estate')[0].className).toContain('invert');
  });

  it('does not treat a 404 path under a purpose as a hero page', () => {
    renderAt('/rent/plot');
    expect(screen.getAllByAltText('Park Lane Estate')[0].className).not.toContain('invert');
  });

  it('puts Buy and Rent accordions in the mobile panel', () => {
    renderAt('/');
    const mobile = screen.getByRole('navigation', { name: 'Mobile' });
    expect(within(mobile).getByRole('button', { name: 'Buy' })).toBeInTheDocument();
    expect(within(mobile).getByRole('button', { name: 'Rent' })).toBeInTheDocument();
  });
});
