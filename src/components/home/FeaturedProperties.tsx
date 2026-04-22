 import { useEffect, useState } from 'react';
 import { Link } from 'react-router-dom';
 import { ArrowRight } from 'lucide-react';
 import { supabase } from '@/utils/supabase';
 import PropertyCard from '@/components/properties/PropertyCard';
 import LoadingSpinner from '@/components/common/LoadingSpinner';
import ScrollReveal from '@/components/common/ScrollReveal';
import StaggerReveal from '@/components/common/StaggerReveal';
 
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
 
 const FeaturedProperties = () => {
   const [properties, setProperties] = useState<Property[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
   useEffect(() => {
     const fetchFeaturedProperties = async () => {
       try {
         setLoading(true);
         const { data, error: fetchError } = await supabase
           .from('properties')
           .select('id, slug, title, project_name, price, location, property_type, bedrooms, bathrooms, area_sqft, images, status, featured')
           .eq('status', 'Available')
           .eq('featured', true)
           .limit(6);
 
         if (fetchError) throw fetchError;
         setProperties(data || []);
       } catch (err) {
         console.error('Error fetching featured properties:', err);
         setError(err instanceof Error ? err.message : 'Failed to load properties');
       } finally {
         setLoading(false);
       }
     };
 
     fetchFeaturedProperties();
   }, []);
 
   return (
    <ScrollReveal className="section-luxury bg-background">
      <div className="container-luxury">
         {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-foreground mb-6">
             Featured Properties
           </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             Explore our handpicked luxury properties in Karachi's most prestigious locations
           </p>
        </ScrollReveal>
 
         {/* Loading State */}
         {loading && (
           <div className="py-16">
             <LoadingSpinner text="Loading featured properties..." />
           </div>
         )}
 
         {/* Error State */}
         {error && (
           <div className="text-center py-16">
             <p className="text-semantic-error mb-4">{error}</p>
             <button
               onClick={() => window.location.reload()}
               className="btn-secondary"
             >
               Try Again
             </button>
           </div>
         )}
 
         {/* Empty State */}
         {!loading && !error && properties.length === 0 && (
           <div className="text-center py-16 bg-muted rounded-lg">
             <p className="text-muted-foreground mb-4">
               No featured properties available at the moment.
             </p>
             <Link to="/properties" className="btn-primary inline-flex items-center gap-2">
               Browse All Properties
               <ArrowRight size={18} />
             </Link>
           </div>
         )}
 
         {/* Properties Grid */}
         {!loading && !error && properties.length > 0 && (
           <>
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={100}>
               {properties.map((property) => (
                 <PropertyCard key={property.id} property={property} />
               ))}
            </StaggerReveal>
 
             {/* View All Button */}
            <ScrollReveal className="text-center mt-16" delay={300}>
               <Link
                 to="/properties"
                className="btn-ghost inline-flex items-center gap-3"
               >
                 View All Properties
                 <ArrowRight size={18} />
               </Link>
            </ScrollReveal>
           </>
         )}
       </div>
    </ScrollReveal>
   );
 };
 
 export default FeaturedProperties;