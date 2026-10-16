import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileMenuSection from './MobileMenuSection';
import { FALLBACK_PURPOSES, type NavPurpose } from '@/lib/navMenu';

const purposes: NavPurpose[] = [
  {
    slug: 'sale', navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', totalCount: 5,
    categories: [{ slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 5 }],
  },
  {
    slug: 'rent', navLabel: 'Rent', label: 'For Rent', urlSegment: 'rent', totalCount: 1,
    categories: [{ slug: 'shop', label: 'Shop', labelPlural: 'Shops', icon: 'Store', count: 1 }],
  },
];

const renderSection = (props: Partial<React.ComponentProps<typeof MobileMenuSection>> = {}) => {
  const onNavigate = vi.fn();
  render(
    <MemoryRouter>
      <MobileMenuSection purposes={purposes} state="ready" pathname="/" onNavigate={onNavigate} {...props} />
    </MemoryRouter>
  );
  return { onNavigate };
};

describe('MobileMenuSection', () => {
  it('opens a section with the All row and categories with counts', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));
    expect(screen.getByRole('link', { name: 'All for sale' })).toHaveAttribute('href', '/buy');
    const flat = screen.getByRole('link', { name: /Flat/ });
    expect(flat).toHaveAttribute('href', '/buy/flat');
    expect(flat).toHaveTextContent('5');
  });

  it('keeps only one section open at a time', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rent' }));
    expect(screen.getByRole('button', { name: 'Buy' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Rent' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the panel when a link is chosen', () => {
    const { onNavigate } = renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Rent' }));
    fireEvent.click(screen.getByRole('link', { name: /Shop/ }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('falls back to plain links when the menu failed', () => {
    const { onNavigate } = renderSection({ purposes: FALLBACK_PURPOSES, state: 'fallback' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Buy' }));
    expect(onNavigate).toHaveBeenCalled();
  });

  it('shows a skeleton while loading', () => {
    renderSection({ purposes: FALLBACK_PURPOSES, state: 'loading' });
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));
    expect(screen.getByLabelText('Loading categories')).toBeInTheDocument();
  });
});
