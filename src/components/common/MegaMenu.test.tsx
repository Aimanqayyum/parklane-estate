import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { FALLBACK_PURPOSES, type NavPurpose, type NavState } from '@/lib/navMenu';

// Radix measures with ResizeObserver, which jsdom lacks.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const purposes: NavPurpose[] = [
  {
    slug: 'sale', navLabel: 'Buy', label: 'For Sale', urlSegment: 'buy', totalCount: 5,
    categories: [
      { slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 5 },
      { slug: 'plot', label: 'Plot', labelPlural: 'Plots', icon: 'LandPlot', count: 0 },
    ],
  },
  {
    slug: 'rent', navLabel: 'Rent', label: 'For Rent', urlSegment: 'rent', totalCount: 1,
    categories: [{ slug: 'flat', label: 'Flat', labelPlural: 'Flats', icon: 'Building', count: 1 }],
  },
];

const before = [{ name: 'Home', path: '/' }];
const after = [
  { name: 'Properties', path: '/properties' },
  { name: 'Contact', path: '/contact' },
];

const renderMenu = (state: NavState, list: NavPurpose[], pathname = '/') =>
  render(
    <MemoryRouter>
      <MegaMenu
        before={before}
        after={after}
        purposes={list}
        state={state}
        pathname={pathname}
        useLightText={false}
      />
    </MemoryRouter>
  );

describe('MegaMenu', () => {
  it('renders Buy and Rent as triggers between the plain links, in order', () => {
    renderMenu('ready', purposes);
    expect(screen.getByRole('button', { name: 'Buy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rent' })).toBeInTheDocument();
    const labels = within(screen.getByRole('list'))
      .getAllByRole('listitem')
      .map((li) => li.textContent?.trim());
    expect(labels).toEqual(['Home', 'Buy', 'Rent', 'Properties', 'Contact']);
  });

  it('opens the Buy panel with categories, counts and an "All" link', () => {
    renderMenu('ready', purposes);
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));

    expect(screen.getByRole('link', { name: /All for sale/ })).toHaveAttribute('href', '/buy');
    const flat = screen.getByRole('link', { name: /Flat/ });
    expect(flat).toHaveAttribute('href', '/buy/flat');
    expect(flat).toHaveTextContent('5 listings');
  });

  it('keeps empty categories visible but dimmed', () => {
    renderMenu('ready', purposes);
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));
    const plot = screen.getByRole('link', { name: /Plot/ });
    expect(plot).toHaveAttribute('href', '/buy/plot');
    expect(plot).toHaveTextContent('0 listings');
    expect(plot.className).toContain('opacity-60');
  });

  it('Rent has no Plot', () => {
    renderMenu('ready', purposes);
    fireEvent.click(screen.getByRole('button', { name: 'Rent' }));
    expect(screen.getByRole('link', { name: /All for rent/ })).toHaveAttribute('href', '/rent');
    expect(screen.queryByRole('link', { name: /Plot/ })).not.toBeInTheDocument();
  });

  it('shows a skeleton while the menu is loading', () => {
    renderMenu('loading', FALLBACK_PURPOSES);
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));
    expect(screen.getByLabelText('Loading categories')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('link', { name: /All for sale/ })).toHaveAttribute('href', '/buy');
  });

  it('falls back to plain Buy and Rent links when the menu failed', () => {
    renderMenu('fallback', FALLBACK_PURPOSES);
    expect(screen.queryByRole('button', { name: 'Buy' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buy' })).toHaveAttribute('href', '/buy');
    expect(screen.getByRole('link', { name: 'Rent' })).toHaveAttribute('href', '/rent');
  });

  it('marks the trigger active on pages under it', () => {
    renderMenu('ready', purposes, '/rent/flat');
    expect(screen.getByRole('button', { name: 'Rent' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('button', { name: 'Buy' })).not.toHaveAttribute('data-active');
  });

  it('marks the current plain link active', () => {
    renderMenu('ready', purposes, '/properties');
    expect(screen.getByRole('link', { name: 'Properties' })).toHaveAttribute('aria-current', 'page');
  });
});
