 import PropertyCard from './PropertyCard';
 import PropertyCardSkeleton from './PropertyCardSkeleton';
 import EmptyState from './EmptyState';
 import type { MenuCategory, MenuPurpose, PropertyListItem } from '@/types/property';
 
 interface PropertyGridProps {
   properties: PropertyListItem[];
   loading: boolean;
   onClearFilters?: () => void;
   hasActiveFilters?: boolean;
   purpose?: MenuPurpose | null;
   category?: MenuCategory | null;
 }
 
 const PropertyGrid = ({
   properties,
   loading,
   onClearFilters,
   hasActiveFilters,
   purpose,
   category,
 }: PropertyGridProps) => {
   // Shimmer skeleton loading
   if (loading) {
     return (
       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
         {Array.from({ length: 6 }).map((_, i) => (
           <PropertyCardSkeleton key={i} />
         ))}
       </div>
     );
   }
 
   // Empty state
   if (properties.length === 0) {
     return (
       <EmptyState
         onReset={onClearFilters || (() => {})}
         hasActiveFilters={hasActiveFilters}
         purpose={purpose}
         category={category}
       />
     );
   }
 
   return (
     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
       {properties.map((property) => (
         <PropertyCard key={property.id} property={property} />
       ))}
     </div>
   );
 };
 
 export default PropertyGrid;