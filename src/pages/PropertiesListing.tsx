import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import propertiesHero from '@/assets/heroes/properties-hero.jpg';
import { SlidersHorizontal, Map, ArrowUpDown, ChevronDown } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import PropertyFilters, { PropertyFiltersState } from '@/components/properties/PropertyFilters';
import PropertyGrid from '@/components/properties/PropertyGrid';
import ListingHeader from '@/components/properties/ListingHeader';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEO from '@/components/common/SEO';
import NotFound from '@/pages/NotFound';
import { useListingMenu } from '@/hooks/useListingMenu';
import { allCategories, listingHeading, listingSeo, resolveRoute } from '@/lib/listingMenu';
import { cn } from '@/lib/utils';
import type { ListingMenu, MenuCategory, MenuPurpose, PropertyListItem } from '@/types/property';

type SortOption = 'featured' | 'newest' | 'price_asc' | 'price_desc';

const ITEMS_PER_PAGE = 12;

// Used only if the menu could not be loaded, so the slider still has a range.
const FALLBACK_PRICE_MAX = 500000000;
const FALLBACK_PRICE_STEP = 10000000;

const defaultFilters: PropertyFiltersState = {
  locations: [],
  propertyType: 'All',
  priceMin: '',
  priceMax: '',
  bedrooms: 'Any',
  projectName: 'Any',
};

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

interface ListingContentProps {
  menu: ListingMenu;
  menuLoading: boolean;
  /** null on /properties (all purposes). */
  purpose: MenuPurpose | null;
  /** null on /properties and on purpose-only pages such as /buy. */
  category: MenuCategory | null;
}

const ListingContent = ({ menu, menuLoading, purpose, category }: ListingContentProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Initialize filters from URL params. On Buy / Rent pages the category comes
  // from the route, so `type` is only read on /properties (lower-cased: the
  // old links used 'Bungalow').
  const [filters, setFilters] = useState<PropertyFiltersState>(() => {
    const locationParam = searchParams.get('location');
    return {
      locations: locationParam ? [locationParam] : [],
      propertyType: purpose ? 'All' : (searchParams.get('type') || 'All').toLowerCase().replace(/^all$/, 'All'),
      priceMin: searchParams.get('priceMin') || '',
      priceMax: searchParams.get('priceMax') || '',
      bedrooms: searchParams.get('bedrooms') || 'Any',
      projectName: searchParams.get('project') || 'Any',
    };
  });

  // The category being filtered on: from the route, or (on /properties) a
  // `type` that matches a known category. Unknown values are ignored.
  const typeSlug = category
    ? category.slug
    : allCategories(menu).some((c) => c.slug === filters.propertyType)
      ? filters.propertyType
      : null;

  // Price slider range comes from the purpose; /properties mixes purposes, so use the widest.
  const rangeSource =
    purpose ??
    menu.reduce<MenuPurpose | null>(
      (best, p) => (!best || p.priceSliderMax > best.priceSliderMax ? p : best),
      null
    );
  const priceMax = rangeSource?.priceSliderMax ?? FALLBACK_PRICE_MAX;
  const priceStep = rangeSource?.priceSliderStep ?? FALLBACK_PRICE_STEP;

  // Update URL when filters change
  const updateURLParams = useCallback(
    (newFilters: PropertyFiltersState) => {
      const params = new URLSearchParams();

      if (newFilters.locations.length === 1) {
        params.set('location', newFilters.locations[0]);
      }
      if (!purpose && newFilters.propertyType !== 'All') {
        params.set('type', newFilters.propertyType);
      }
      if (newFilters.priceMin) {
        params.set('priceMin', newFilters.priceMin);
      }
      if (newFilters.priceMax) {
        params.set('priceMax', newFilters.priceMax);
      }
      if (newFilters.bedrooms !== 'Any') {
        params.set('bedrooms', newFilters.bedrooms);
      }
      if (newFilters.projectName !== 'Any') {
        params.set('project', newFilters.projectName);
      }

      setSearchParams(params, { replace: true });
    },
    [setSearchParams, purpose]
  );

  const handleFilterChange = (newFilters: PropertyFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURLParams(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  // On /properties, a `?type=` has to be checked against the menu before querying.
  const waitingForMenu = menuLoading && !purpose && filters.propertyType !== 'All';

  // Fetch properties
  useEffect(() => {
    if (waitingForMenu) return;

    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query
        let query = supabase
          .from('properties')
          .select(
            'id, slug, title, project_name, price, location, purpose, category, bedrooms, bathrooms, area_sqft, images, status, featured',
            { count: 'exact' }
          )
          .eq('status', 'Available');

        // Route: purpose and category
        if (purpose) {
          query = query.eq('purpose', purpose.slug);
        }
        if (typeSlug) {
          query = query.eq('category', typeSlug);
        }

        // Apply filters
        if (filters.locations.length > 0) {
          query = query.in('location', filters.locations);
        }
        if (filters.priceMin) {
          query = query.gte('price', parseFloat(filters.priceMin));
        }
        if (filters.priceMax) {
          query = query.lte('price', parseFloat(filters.priceMax));
        }
        if (filters.bedrooms !== 'Any') {
          const bedroomValue = filters.bedrooms === '5+' ? 5 : parseInt(filters.bedrooms);
          if (filters.bedrooms === '5+') {
            query = query.gte('bedrooms', bedroomValue);
          } else {
            query = query.eq('bedrooms', bedroomValue);
          }
        }
        if (filters.projectName !== 'Any') {
          query = query.eq('project_name', filters.projectName);
        }

        // Apply sorting
        switch (sortBy) {
          case 'featured':
            query = query
              .order('featured', { ascending: false })
              .order('created_at', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        }

        // Apply pagination
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error: fetchError, count } = await query;

        if (fetchError) throw fetchError;

        setProperties((data as PropertyListItem[]) || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters, currentPage, sortBy, purpose, typeSlug, waitingForMenu]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const activeFilterCount =
    (filters.locations.length > 0 ? 1 : 0) +
    (!purpose && typeSlug ? 1 : 0) +
    (filters.priceMin || filters.priceMax ? 1 : 0) +
    (filters.bedrooms !== 'Any' ? 1 : 0) +
    (filters.projectName !== 'Any' ? 1 : 0);

  const seo = listingSeo(purpose, category);
  const noun = category ? category.labelPlural.toLowerCase() : 'properties';
  const forWhat = purpose ? ` ${purpose.label.toLowerCase()}` : '';

  // Moving between categories keeps every filter; switching Buy | Rent drops the price range.
  const chipSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const toggleParams = new URLSearchParams(searchParams);
  toggleParams.delete('priceMin');
  toggleParams.delete('priceMax');
  const toggleSearch = toggleParams.toString() ? `?${toggleParams.toString()}` : '';

  const sortDropdown = (
    <div className="hidden md:block relative">
      <button
        onClick={() => setShowSortDropdown(!showSortDropdown)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="text-sm">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', showSortDropdown && 'rotate-180')}
        />
      </button>

      {showSortDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value as SortOption);
                setShowSortDropdown(false);
              }}
              className={cn(
                'w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors',
                sortBy === option.value && 'bg-primary/10 text-primary font-medium'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seo.title}
        description={seo.description}
        url={`${window.location.origin}${seo.path}`}
      />

      {/* Header */}
      <section className="relative pt-32 pb-8 md:pt-36 md:pb-10 border-b border-border">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={propertiesHero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 container-luxury">
          <ListingHeader
            heading={listingHeading(purpose, category)}
            subtitle={loading ? 'Loading...' : `${totalCount} ${noun}${forWhat} in Karachi`}
            menu={menu}
            purpose={purpose}
            category={category}
            chipSearch={chipSearch}
            toggleSearch={toggleSearch}
            actions={sortDropdown}
          />
        </div>
      </section>

      {/* Main Content - Split Layout */}
      <div className="container-luxury py-8 md:py-12">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <PropertyFilters
            filters={{ ...filters, propertyType: typeSlug ?? 'All' }}
            onFilterChange={handleFilterChange}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            menu={menu}
            showTypeFilter={!purpose}
            priceMax={priceMax}
            priceStep={priceStep}
          />

          {/* Properties Grid */}
          <div className="flex-1 min-w-0">
            {/* Results Info - Mobile */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <p className="text-sm text-muted-foreground">
                {showingFrom}-{showingTo} of {totalCount}
              </p>

              {/* Mobile Sort */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as SortOption);
                          setShowSortDropdown(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors',
                          sortBy === option.value && 'bg-primary/10 text-primary font-medium'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results Info - Desktop */}
            <p className="hidden lg:block text-sm text-muted-foreground mb-6">
              Showing {showingFrom}-{showingTo} of {totalCount} properties
            </p>

            {error ? (
              <div className="text-center py-16">
                <p className="text-destructive mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-secondary">
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <PropertyGrid
                  properties={properties}
                  loading={loading}
                  onClearFilters={handleClearFilters}
                  hasActiveFilters={activeFilterCount > 0}
                  purpose={purpose}
                  category={category}
                />

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Pills */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <div className="flex gap-3 p-2 rounded-full bg-card/95 backdrop-blur-xl shadow-2xl border border-border">
          <button
            onClick={() => setFiltersOpen(true)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-colors',
              activeFilterCount > 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-foreground text-primary text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            onClick={() => {
              // Future: Toggle map view
              console.log('Map view coming soon');
            }}
          >
            <Map className="w-4 h-4" />
            Map
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Serves /properties (all), /:purposeSegment (/buy, /rent) and
 * /:purposeSegment/:categorySlug (/buy/flat). The segments are resolved
 * against the menu data; anything that does not resolve is a 404.
 */
const PropertiesListing = () => {
  const { purposeSegment, categorySlug } = useParams<{
    purposeSegment: string;
    categorySlug: string;
  }>();
  const { menu, isLoading, isError, refetch } = useListingMenu();

  // /properties: no route params, works even if the menu is still loading or failed.
  if (!purposeSegment) {
    return <ListingContent key="all" menu={menu} menuLoading={isLoading} purpose={null} category={null} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-destructive mb-4">Failed to load properties.</p>
        <button onClick={() => refetch()} className="btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  const route = resolveRoute(menu, purposeSegment, categorySlug);
  if (!route) {
    return (
      <>
        <SEO title="404 - Page Not Found" description="The page you are looking for does not exist." />
        <NotFound />
      </>
    );
  }

  return (
    <ListingContent
      key={`${route.purpose.slug}/${route.category?.slug ?? ''}`}
      menu={menu}
      menuLoading={false}
      purpose={route.purpose}
      category={route.category}
    />
  );
};

export default PropertiesListing;
