import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ListingMenu, PropertyListItem } from '@/types/property';

const menu: ListingMenu = [
  {
    slug: 'sale', navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', closedStatus: 'Sold',
    priceSuffix: '', priceSliderMax: 1, priceSliderStep: 1, totalCount: 1,
    categories: [{ slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 1 }],
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

import PropertyCard from './PropertyCard';

const base: PropertyListItem = {
  id: '1', slug: 'x', title: 'A property', project_name: null, price: 150000, location: 'DHA',
  purpose: 'sale', category: 'flat', bedrooms: null, bathrooms: null, area_sqft: null,
  images: null, status: 'Available', featured: false,
};

const renderCard = (property: PropertyListItem) =>
  render(
    <MemoryRouter>
      <PropertyCard property={property} />
    </MemoryRouter>
  );

describe('PropertyCard', () => {
  it('shows a sale price without a suffix or purpose badge', () => {
    renderCard(base);
    expect(screen.getByText('PKR 1.50 Lac')).toBeInTheDocument();
    expect(screen.queryByText('/ month')).not.toBeInTheDocument();
    expect(screen.queryByText('For Rent')).not.toBeInTheDocument();
    expect(screen.getByText('Flat')).toBeInTheDocument();
  });

  it('shows the monthly suffix, a For Rent badge and the category label on rent listings', () => {
    renderCard({ ...base, purpose: 'rent', category: 'shop' });
    expect(screen.getByText('PKR 1.50 Lac')).toBeInTheDocument();
    expect(screen.getByText('/ month')).toBeInTheDocument();
    expect(screen.getByText('For Rent')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });
});
