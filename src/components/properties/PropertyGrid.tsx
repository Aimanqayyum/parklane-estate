 import PropertyCard from './PropertyCard';
 import PropertyCardSkeleton from './PropertyCardSkeleton';
 import EmptyState from './EmptyState';
 
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
 
 interface PropertyGridProps {
   properties: Property[];
   loading: boolean;
   onClearFilters?: () => void;
 }
 
 const PropertyGrid = ({ properties, loading, onClearFilters }: PropertyGridProps) => {
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
     return <EmptyState onReset={onClearFilters || (() => {})} />;
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