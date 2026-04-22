 import { useEffect, useState } from 'react';
 import { supabase } from '@/utils/supabase';
 
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
   status: string;
   featured: boolean;
 }
 
 const SupabaseTest = () => {
   const [properties, setProperties] = useState<Property[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
 
   useEffect(() => {
     const fetchProperties = async () => {
       try {
         setLoading(true);
         setError(null);
         
         const { data, error: fetchError } = await supabase
           .from('properties')
           .select('id, slug, title, project_name, price, location, property_type, bedrooms, bathrooms, area_sqft, status, featured')
           .limit(10);
 
         if (fetchError) {
           throw fetchError;
         }
 
         setProperties(data || []);
         setConnectionStatus('connected');
       } catch (err) {
         console.error('Supabase fetch error:', err);
         setError(err instanceof Error ? err.message : 'Failed to fetch properties');
         setConnectionStatus('failed');
       } finally {
         setLoading(false);
       }
     };
 
     fetchProperties();
   }, []);
 
   const formatPrice = (price: number) => {
     if (price >= 10000000) {
       return `PKR ${(price / 10000000).toFixed(2)} Crore`;
     } else if (price >= 100000) {
       return `PKR ${(price / 100000).toFixed(2)} Lac`;
     }
     return `PKR ${price.toLocaleString()}`;
   };
 
   return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto">        
         {/* Connection Status */}
         <div className="mb-6 p-4 rounded-lg border">
           <div className="flex items-center gap-2">
             <span className="font-medium">Connection Status:</span>
             {connectionStatus === 'checking' && (
              <span className="text-semantic-warning">⏳ Checking...</span>
             )}
             {connectionStatus === 'connected' && (
              <span className="text-semantic-success">✅ Connected to Supabase</span>
             )}
             {connectionStatus === 'failed' && (
              <span className="text-semantic-error">❌ Connection Failed</span>
             )}
           </div>
         </div>
 
         {/* Loading State */}
         {loading && (
           <div className="text-center py-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
             <p className="mt-4 text-muted-foreground">Fetching properties...</p>
           </div>
         )}
 
         {/* Error State */}
         {error && (
          <div className="bg-semantic-error/10 border border-semantic-error/20 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-semantic-error">Error</h3>
            <p className="text-semantic-error/80">{error}</p>
            <p className="text-sm text-semantic-error/60 mt-2">
               Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.
             </p>
           </div>
         )}
 
         {/* Properties List */}
         {!loading && !error && (
           <div>
             <h3 className="text-lg font-semibold mb-4">
               Properties Found: {properties.length}
             </h3>
             
             {properties.length === 0 ? (
               <div className="text-center py-8 border rounded-lg bg-muted/20">
                 <p className="text-muted-foreground">
                   No properties found in the database yet.
                 </p>
                 <p className="text-sm text-muted-foreground mt-2">
                   Connection is working! Add some properties to see them here.
                 </p>
               </div>
             ) : (
               <div className="grid gap-4">
                 {properties.map((property) => (
                   <div
                     key={property.id}
                     className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                   >
                     <div className="flex justify-between items-start">
                       <div>
                         <h4 className="font-semibold text-foreground">{property.title}</h4>
                         <p className="text-sm text-muted-foreground">
                           {property.project_name && `${property.project_name} • `}
                           {property.location}
                         </p>
                       </div>
                       <span className={`px-2 py-1 rounded text-xs font-medium ${
                         property.status === 'Available' 
                          ? 'bg-semantic-success/10 text-semantic-success' 
                           : property.status === 'Sold'
                          ? 'bg-semantic-error/10 text-semantic-error'
                          : 'bg-semantic-warning/10 text-semantic-warning'
                       }`}>
                         {property.status}
                       </span>
                     </div>
                     <div className="mt-3 flex flex-wrap gap-4 text-sm">
                       <span className="font-semibold text-primary">
                         {formatPrice(property.price)}
                       </span>
                       <span>{property.property_type}</span>
                       {property.bedrooms && <span>{property.bedrooms} Beds</span>}
                       {property.bathrooms && <span>{property.bathrooms} Baths</span>}
                       {property.area_sqft && <span>{property.area_sqft} sq.ft</span>}
                       {property.featured && (
                        <span className="text-semantic-warning">⭐ Featured</span>
                       )}
                     </div>
                     <p className="text-xs text-muted-foreground mt-2">
                       Slug: {property.slug}
                     </p>
                   </div>
                 ))}
               </div>
             )}
           </div>
         )}
       </div>
     </div>
   );
 };
 
 export default SupabaseTest;