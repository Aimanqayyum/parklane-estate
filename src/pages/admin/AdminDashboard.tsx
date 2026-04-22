 import { useState, useEffect } from 'react';
 import { Link } from 'react-router-dom';
 import { supabase } from '@/utils/supabase';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import { Building2, CheckCircle, Star, Eye, Plus, ExternalLink, Pencil } from 'lucide-react';
 import LoadingSpinner from '@/components/common/LoadingSpinner';
 import { formatPrice } from '@/utils/formatPrice';
 
 interface RecentProperty {
   slug: string;
   title: string;
   price: number;
   location: string;
   created_at: string;
 }
 
 interface DashboardMetrics {
   totalProperties: number;
   availableProperties: number;
   featuredProperties: number;
   totalViews: number;
 }
 
 const AdminDashboard = () => {
   const [metrics, setMetrics] = useState<DashboardMetrics>({
     totalProperties: 0,
     availableProperties: 0,
     featuredProperties: 0,
     totalViews: 0,
   });
   const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchDashboardData = async () => {
       try {
         // Fetch all metrics in parallel
         const [totalResult, availableResult, featuredResult, viewsResult, recentResult] =
           await Promise.all([
             supabase.from('properties').select('*', { count: 'exact', head: true }),
             supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
             supabase.from('properties').select('*', { count: 'exact', head: true }).eq('featured', true),
             supabase.from('properties').select('view_count'),
             supabase.from('properties').select('slug, title, price, location, created_at').order('created_at', { ascending: false }).limit(5),
           ]);
 
         const totalViews = viewsResult.data?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
 
         setMetrics({
           totalProperties: totalResult.count || 0,
           availableProperties: availableResult.count || 0,
           featuredProperties: featuredResult.count || 0,
           totalViews,
         });
 
         setRecentProperties(recentResult.data || []);
       } catch (error) {
         console.error('Error fetching dashboard data:', error);
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchDashboardData();
   }, []);
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <LoadingSpinner text="Loading dashboard..." />
       </div>
     );
   }
 
   const metricCards = [
     { title: 'Total Properties', value: metrics.totalProperties, icon: Building2, color: 'text-blue-600' },
     { title: 'Available', value: metrics.availableProperties, icon: CheckCircle, color: 'text-green-600' },
     { title: 'Featured', value: metrics.featuredProperties, icon: Star, color: 'text-yellow-600' },
     { title: 'Total Views', value: metrics.totalViews, icon: Eye, color: 'text-purple-600' },
   ];
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
           <p className="text-muted-foreground">Welcome to your admin panel</p>
         </div>
         <Button asChild>
           <Link to="/admin/properties/add">
             <Plus className="h-4 w-4 mr-2" />
             Add New Property
           </Link>
         </Button>
       </div>
 
       {/* Metrics Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {metricCards.map((card) => (
           <Card key={card.title}>
             <CardContent className="pt-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                   <p className="text-3xl font-bold text-foreground">{card.value}</p>
                 </div>
                 <div className={`p-3 rounded-full bg-muted ${card.color}`}>
                   <card.icon className="h-6 w-6" />
                 </div>
               </div>
             </CardContent>
           </Card>
         ))}
       </div>
 
       {/* Recent Properties */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle>Recent Properties</CardTitle>
           <Button variant="outline" size="sm" asChild>
             <Link to="/admin/properties">View All</Link>
           </Button>
         </CardHeader>
         <CardContent>
           {recentProperties.length === 0 ? (
             <div className="text-center py-8">
               <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
               <p className="text-muted-foreground">No properties yet. Add your first property!</p>
               <Button asChild className="mt-4">
                 <Link to="/admin/properties/add">
                   <Plus className="h-4 w-4 mr-2" />
                   Add Property
                 </Link>
               </Button>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Title</TableHead>
                     <TableHead>Price</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Created</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {recentProperties.map((property) => (
                     <TableRow key={property.slug}>
                       <TableCell className="font-medium">{property.title}</TableCell>
                       <TableCell>{formatPrice(property.price)}</TableCell>
                       <TableCell>{property.location}</TableCell>
                       <TableCell>
                         {new Date(property.created_at).toLocaleDateString()}
                       </TableCell>
                       <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" asChild>
                             <Link to={`/admin/properties/edit/${property.slug}`}>
                               <Pencil className="h-4 w-4" />
                             </Link>
                           </Button>
                           <Button variant="ghost" size="icon" asChild>
                             <Link to={`/properties/${property.slug}`} target="_blank">
                               <ExternalLink className="h-4 w-4" />
                             </Link>
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default AdminDashboard;