 import { useState, useEffect, useMemo } from 'react';
 import { Link } from 'react-router-dom';
 import { supabase } from '@/utils/supabase';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Checkbox } from '@/components/ui/checkbox';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from '@/components/ui/alert-dialog';
 import { Badge } from '@/components/ui/badge';
 import { Card, CardContent } from '@/components/ui/card';
 import { Plus, Search, Pencil, Trash2, ExternalLink, Building2 } from 'lucide-react';
 import LoadingSpinner from '@/components/common/LoadingSpinner';
 import Pagination from '@/components/common/Pagination';
 import { formatPrice } from '@/utils/formatPrice';
 import { toast } from '@/hooks/use-toast';
 
 interface Property {
   id: string;
   slug: string;
   title: string;
   project_name: string | null;
   price: number;
   location: string;
   status: string;
   featured: boolean;
   images: string[];
   created_at: string;
 }
 
 const ITEMS_PER_PAGE = 20;
 
 const PropertyList = () => {
   const [properties, setProperties] = useState<Property[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
   const [currentPage, setCurrentPage] = useState(1);
  const [_deletingId, setDeletingId] = useState<string | null>(null);
 
   const fetchProperties = async () => {
     try {
       const { data, error } = await supabase
         .from('properties')
         .select('id, slug, title, project_name, price, location, status, featured, images, created_at')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       setProperties(data || []);
     } catch (error) {
       console.error('Error fetching properties:', error);
       toast({
         title: 'Error',
         description: 'Failed to load properties',
         variant: 'destructive',
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   useEffect(() => {
     fetchProperties();
   }, []);
 
   const filteredProperties = useMemo(() => {
     let result = properties;
 
     // Filter by search query
     if (searchQuery.trim()) {
       const query = searchQuery.toLowerCase();
       result = result.filter(
         (p) =>
           p.title.toLowerCase().includes(query) ||
           p.project_name?.toLowerCase().includes(query) ||
           p.location.toLowerCase().includes(query)
       );
     }
 
     // Filter by status
     if (statusFilter !== 'all') {
       result = result.filter((p) => p.status === statusFilter);
     }
 
     return result;
   }, [properties, searchQuery, statusFilter]);
 
   const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
   const paginatedProperties = filteredProperties.slice(
     (currentPage - 1) * ITEMS_PER_PAGE,
     currentPage * ITEMS_PER_PAGE
   );
 
   const handleToggleFeatured = async (id: string, currentValue: boolean) => {
     try {
       const { error } = await supabase
         .from('properties')
         .update({ featured: !currentValue })
         .eq('id', id);
 
       if (error) throw error;
 
       setProperties((prev) =>
         prev.map((p) => (p.id === id ? { ...p, featured: !currentValue } : p))
       );
 
       toast({
         title: 'Success',
         description: `Property ${!currentValue ? 'featured' : 'unfeatured'}`,
       });
     } catch (error) {
       console.error('Error toggling featured:', error);
       toast({
         title: 'Error',
         description: 'Failed to update property',
         variant: 'destructive',
       });
     }
   };
 
   const handleDelete = async (id: string) => {
     setDeletingId(id);
     try {
       // Delete images from storage
       const property = properties.find((p) => p.id === id);
       if (property?.images?.length) {
         const paths = property.images
           .map((url) => {
             const match = url.match(/property-images\/(.+)$/);
             return match ? match[1] : null;
           })
           .filter(Boolean);
 
         if (paths.length > 0) {
           await supabase.storage.from('property-images').remove(paths as string[]);
         }
       }
 
       // Delete property
       const { error } = await supabase.from('properties').delete().eq('id', id);
 
       if (error) throw error;
 
       setProperties((prev) => prev.filter((p) => p.id !== id));
 
       toast({
         title: 'Success',
         description: 'Property deleted successfully',
       });
     } catch (error) {
       console.error('Error deleting property:', error);
       toast({
         title: 'Error',
         description: 'Failed to delete property',
         variant: 'destructive',
       });
     } finally {
       setDeletingId(null);
     }
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'Available':
        return <Badge variant="outline" className="border-primary/50 text-primary">Available</Badge>;
       case 'Sold':
        return <Badge variant="destructive">Sold</Badge>;
       case 'Rented':
        return <Badge variant="secondary">Rented</Badge>;
       default:
         return <Badge variant="secondary">{status}</Badge>;
     }
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <LoadingSpinner text="Loading properties..." />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="text-3xl font-bold text-foreground">Properties</h1>
           <p className="text-muted-foreground">
             Manage your property listings ({filteredProperties.length} total)
           </p>
         </div>
         <Button asChild>
           <Link to="/admin/properties/add">
             <Plus className="h-4 w-4 mr-2" />
             Add New Property
           </Link>
         </Button>
       </div>
 
       {/* Filters */}
       <Card>
         <CardContent className="pt-6">
           <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Search by title, project, or location..."
                 value={searchQuery}
                 onChange={(e) => {
                   setSearchQuery(e.target.value);
                   setCurrentPage(1);
                 }}
                 className="pl-10"
               />
             </div>
             <Select
               value={statusFilter}
               onValueChange={(value) => {
                 setStatusFilter(value);
                 setCurrentPage(1);
               }}
             >
               <SelectTrigger className="w-full sm:w-[180px]">
                 <SelectValue placeholder="Filter by status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Statuses</SelectItem>
                 <SelectItem value="Available">Available</SelectItem>
                 <SelectItem value="Sold">Sold</SelectItem>
                 <SelectItem value="Rented">Rented</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </CardContent>
       </Card>
 
       {/* Properties Table */}
       {paginatedProperties.length === 0 ? (
         <Card>
           <CardContent className="py-12 text-center">
             <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
             <p className="text-muted-foreground mb-4">
               {searchQuery || statusFilter !== 'all'
                 ? 'No properties match your filters'
                 : 'No properties found. Add your first property!'}
             </p>
             {!searchQuery && statusFilter === 'all' && (
               <Button asChild>
                 <Link to="/admin/properties/add">
                   <Plus className="h-4 w-4 mr-2" />
                   Add Property
                 </Link>
               </Button>
             )}
           </CardContent>
         </Card>
       ) : (
         <Card>
           <CardContent className="p-0">
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-[80px]">Image</TableHead>
                     <TableHead>Title</TableHead>
                     <TableHead>Price</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-center">Featured</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {paginatedProperties.map((property) => (
                     <TableRow key={property.id}>
                       <TableCell>
                         {property.images?.[0] ? (
                           <img
                             src={property.images[0]}
                             alt={property.title}
                             className="w-16 h-16 object-cover rounded"
                           />
                         ) : (
                           <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                             <Building2 className="h-6 w-6 text-muted-foreground" />
                           </div>
                         )}
                       </TableCell>
                       <TableCell>
                         <div>
                           <p className="font-medium">{property.title}</p>
                           {property.project_name && (
                             <p className="text-sm text-muted-foreground">
                               {property.project_name}
                             </p>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>{formatPrice(property.price)}</TableCell>
                       <TableCell>{property.location}</TableCell>
                       <TableCell>{getStatusBadge(property.status)}</TableCell>
                       <TableCell className="text-center">
                         <Checkbox
                           checked={property.featured}
                           onCheckedChange={() =>
                             handleToggleFeatured(property.id, property.featured)
                           }
                         />
                       </TableCell>
                       <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-1">
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
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="text-destructive hover:text-destructive"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   Are you sure you want to delete "{property.title}"? This
                                   action cannot be undone.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction
                                   onClick={() => handleDelete(property.id)}
                                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                 >
                                   Delete
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Pagination */}
       {totalPages > 1 && (
         <div className="flex justify-center">
           <Pagination
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
           />
         </div>
       )}
     </div>
   );
 };
 
 export default PropertyList;