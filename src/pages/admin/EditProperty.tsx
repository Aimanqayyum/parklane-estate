 import { useState, useEffect } from 'react';
 import { useNavigate, useParams, Link } from 'react-router-dom';
 import { supabase } from '@/utils/supabase';
 import PropertyForm, { PropertyFormData, ExistingImage } from '@/components/admin/PropertyForm';
 import { generateSlug } from '@/utils/slugify';
 import { toast } from '@/hooks/use-toast';
 import LoadingSpinner from '@/components/common/LoadingSpinner';
 import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
 } from '@/components/ui/breadcrumb';
 import { AlertCircle } from 'lucide-react';
 
 interface Property {
   id: string;
   slug: string;
   title: string;
   project_name: string | null;
   description: string;
   price: number;
   location: string;
   property_type: string;
   bedrooms: number | null;
   bathrooms: number | null;
   area_sqft: number | null;
   images: string[];
   video_url: string | null;
   latitude: number | null;
   longitude: number | null;
   status: string;
   featured: boolean;
 }
 
 const EditProperty = () => {
   const { slug } = useParams<{ slug: string }>();
   const navigate = useNavigate();
   const [property, setProperty] = useState<Property | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
   useEffect(() => {
     const fetchProperty = async () => {
       if (!slug) return;
 
       try {
         const { data, error } = await supabase
           .from('properties')
           .select('*')
           .eq('slug', slug)
           .maybeSingle();
 
         if (error) throw error;
         if (!data) {
           setError('Property not found');
           return;
         }
 
         setProperty(data);
       } catch (err) {
         console.error('Error fetching property:', err);
         setError('Failed to load property');
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchProperty();
   }, [slug]);
 
   const generateUniqueSlug = async (title: string, currentSlug: string): Promise<string> => {
     const newSlug = generateSlug(title);
     
     // If slug hasn't changed, return current
     if (newSlug === currentSlug) return currentSlug;
 
     let baseSlug = newSlug;
     let finalSlug = newSlug;
     let counter = 2;
 
     while (true) {
       const { data } = await supabase
         .from('properties')
         .select('id')
         .eq('slug', finalSlug)
         .neq('id', property?.id)
         .maybeSingle();
 
       if (!data) break;
 
       finalSlug = `${baseSlug}-${counter}`;
       counter++;
     }
 
     return finalSlug;
   };
 
   const uploadImages = async (images: ExistingImage[]): Promise<string[]> => {
     if (!property) return [];
 
     const uploadedUrls: string[] = [];
 
     for (const image of images) {
       if (image.isNew && image.file) {
         const fileExt = image.file.name.split('.').pop();
         const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
         const filePath = `properties/${property.id}/${fileName}`;
 
         const { error: uploadError } = await supabase.storage
           .from('property-images')
           .upload(filePath, image.file);
 
         if (uploadError) {
           console.error('Upload error:', uploadError);
           continue;
         }
 
         const { data: urlData } = supabase.storage
           .from('property-images')
           .getPublicUrl(filePath);
 
         uploadedUrls.push(urlData.publicUrl);
       } else {
         uploadedUrls.push(image.url);
       }
     }
 
     return uploadedUrls;
   };
 
   const handleSubmit = async (formData: PropertyFormData, images: ExistingImage[]) => {
     if (!property) return;
 
     setIsSubmitting(true);
 
     try {
       // Generate unique slug if title changed
       const newSlug = await generateUniqueSlug(formData.title, property.slug);
 
       // Upload new images
       const imageUrls = await uploadImages(images);
 
       // Update property
       const { error } = await supabase
         .from('properties')
         .update({
           slug: newSlug,
           title: formData.title.trim(),
           project_name: formData.projectName.trim() || null,
           description: formData.description.trim(),
           price: parseFloat(formData.price),
           location: formData.location,
           property_type: formData.propertyType,
           bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
           bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
           area_sqft: formData.areaSqft ? parseInt(formData.areaSqft) : null,
           images: imageUrls,
           video_url: formData.videoUrl.trim() || null,
           latitude: formData.latitude ? parseFloat(formData.latitude) : null,
           longitude: formData.longitude ? parseFloat(formData.longitude) : null,
           status: formData.status,
           featured: formData.featured,
         })
         .eq('id', property.id);
 
       if (error) throw error;
 
       toast({
         title: 'Success!',
         description: 'Property updated successfully.',
       });
 
       navigate('/admin/properties');
     } catch (error) {
       console.error('Error updating property:', error);
       toast({
         title: 'Error',
         description: 'Failed to update property. Please try again.',
         variant: 'destructive',
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <LoadingSpinner text="Loading property..." />
       </div>
     );
   }
 
   if (error || !property) {
     return (
       <div className="flex flex-col items-center justify-center h-64 text-center">
         <AlertCircle className="h-12 w-12 text-destructive mb-4" />
         <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
         <p className="text-muted-foreground mb-4">
           The property you're looking for doesn't exist or has been deleted.
         </p>
         <Link to="/admin/properties" className="text-primary hover:underline">
           Back to Properties
         </Link>
       </div>
     );
   }
 
   const initialData: PropertyFormData & { images?: string[] } = {
     title: property.title,
     projectName: property.project_name || '',
     description: property.description,
     price: property.price.toString(),
     location: property.location,
     propertyType: property.property_type,
     bedrooms: property.bedrooms?.toString() || '',
     bathrooms: property.bathrooms?.toString() || '',
     areaSqft: property.area_sqft?.toString() || '',
     status: property.status,
     featured: property.featured,
     videoUrl: property.video_url || '',
     latitude: property.latitude?.toString() || '',
     longitude: property.longitude?.toString() || '',
     images: property.images || [],
   };
 
   return (
     <div className="space-y-6">
       <Breadcrumb>
         <BreadcrumbList>
           <BreadcrumbItem>
             <BreadcrumbLink asChild>
               <Link to="/admin/dashboard">Admin</Link>
             </BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator />
           <BreadcrumbItem>
             <BreadcrumbLink asChild>
               <Link to="/admin/properties">Properties</Link>
             </BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator />
           <BreadcrumbItem>
             <BreadcrumbPage>Edit</BreadcrumbPage>
           </BreadcrumbItem>
         </BreadcrumbList>
       </Breadcrumb>
 
       <div>
         <h1 className="text-3xl font-bold text-foreground">Edit Property</h1>
         <p className="text-muted-foreground">Update the property details</p>
       </div>
 
       <PropertyForm
         mode="edit"
         initialData={initialData}
         onSubmit={handleSubmit}
         isSubmitting={isSubmitting}
       />
     </div>
   );
 };
 
 export default EditProperty;