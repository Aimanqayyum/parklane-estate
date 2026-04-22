 import { useEffect, useState, useCallback } from 'react';
 import { useSearchParams } from 'react-router-dom';
 import propertiesHero from '@/assets/heroes/properties-hero.jpg';
 import { SlidersHorizontal, Map, ArrowUpDown, ChevronDown } from 'lucide-react';
 import { supabase } from '@/utils/supabase';
 import PropertyFilters, { PropertyFiltersState } from '@/components/properties/PropertyFilters';
 import PropertyGrid from '@/components/properties/PropertyGrid';
 import Pagination from '@/components/common/Pagination';
 import SEO from '@/components/common/SEO';
 import { cn } from '@/lib/utils';
 
 interface Property {
   id: string;
   slug: string;
   title: string;
   project_name: string | null;
   price: number;
   location: string;
   property_type: string;
   bedrooms: number | null;
   bathrooms: number | null;
   area_sqft: number | null;
   images: string[] | null;
   status: string;
   featured: boolean;
 }
 
 type SortOption = 'featured' | 'newest' | 'price_asc' | 'price_desc';
 
 const ITEMS_PER_PAGE = 12;
 
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
 
 const PropertiesListing = () => {
   const [searchParams, setSearchParams] = useSearchParams();
   const [properties, setProperties] = useState<Property[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [totalCount, setTotalCount] = useState(0);
   const [currentPage, setCurrentPage] = useState(1);
   const [sortBy, setSortBy] = useState<SortOption>('featured');
   const [filtersOpen, setFiltersOpen] = useState(false);
   const [showSortDropdown, setShowSortDropdown] = useState(false);
 
   // Initialize filters from URL params
   const [filters, setFilters] = useState<PropertyFiltersState>(() => {
     const locationParam = searchParams.get('location');
     return {
       locations: locationParam ? [locationParam] : [],
       propertyType: searchParams.get('type') || 'All',
       priceMin: searchParams.get('priceMin') || '',
       priceMax: searchParams.get('priceMax') || '',
       bedrooms: searchParams.get('bedrooms') || 'Any',
       projectName: searchParams.get('project') || 'Any',
     };
   });
 
   // Update URL when filters change
   const updateURLParams = useCallback(
     (newFilters: PropertyFiltersState) => {
       const params = new URLSearchParams();
 
       if (newFilters.locations.length === 1) {
         params.set('location', newFilters.locations[0]);
       }
       if (newFilters.propertyType !== 'All') {
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
     [setSearchParams]
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
 
   // Fetch properties
   useEffect(() => {
     const fetchProperties = async () => {
       try {
         setLoading(true);
         setError(null);
 
         // Build query
         let query = supabase
           .from('properties')
           .select(
             'id, slug, title, project_name, price, location, property_type, bedrooms, bathrooms, area_sqft, images, status, featured',
             { count: 'exact' }
           )
           .eq('status', 'Available');
 
         // Apply filters
         if (filters.locations.length > 0) {
           query = query.in('location', filters.locations);
         }
         if (filters.propertyType !== 'All') {
           query = query.eq('property_type', filters.propertyType);
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
 
         setProperties(data || []);
         setTotalCount(count || 0);
       } catch (err) {
         console.error('Error fetching properties:', err);
         setError(err instanceof Error ? err.message : 'Failed to load properties');
       } finally {
         setLoading(false);
       }
     };
 
     fetchProperties();
   }, [filters, currentPage, sortBy]);
 
   const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
   const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
   const showingTo = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);
 
   const activeFilterCount =
     (filters.locations.length > 0 ? 1 : 0) +
     (filters.propertyType !== 'All' ? 1 : 0) +
     (filters.priceMin || filters.priceMax ? 1 : 0) +
     (filters.bedrooms !== 'Any' ? 1 : 0) +
     (filters.projectName !== 'Any' ? 1 : 0);
 
   return (
     <div className="min-h-screen bg-background">
       <SEO
         title="Properties for Sale & Rent"
         description="Browse luxury apartments, bungalows, offices, and plots for sale and rent in Karachi's premium locations - DHA, Clifton, and more."
       />
 
       {/* Minimal Header */}
        <section className="relative pt-32 pb-8 md:pt-36 md:pb-10 border-b border-border">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={propertiesHero}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
 
          <div className="relative z-10 container-luxury">
           <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
             <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-2 text-white">Properties</h1>
                <p className="text-white/80">
                 {loading
                   ? 'Loading...'
                   : `${totalCount} properties in Karachi`}
               </p>
             </div>
 
             {/* Sort Dropdown - Desktop */}
             <div className="hidden md:block relative">
               <button
                 onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
               >
                  <ArrowUpDown className="w-4 h-4" />
                 <span className="text-sm">
                   {sortOptions.find((o) => o.value === sortBy)?.label}
                 </span>
                 <ChevronDown
                   className={cn(
                      'w-4 h-4 transition-transform',
                     showSortDropdown && 'rotate-180'
                   )}
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
           </div>
          </div>
        </section>
 
       {/* Main Content - Split Layout */}
       <div className="container-luxury py-8 md:py-12">
         <div className="flex gap-8">
           {/* Filters Sidebar - Desktop */}
           <PropertyFilters
             filters={filters}
             onFilterChange={handleFilterChange}
             isOpen={filtersOpen}
             onClose={() => setFiltersOpen(false)}
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
 
 export default PropertiesListing;