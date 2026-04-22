 import { useState } from 'react';
 import { useNavigate, Link } from 'react-router-dom';
 import { supabase } from '@/utils/supabase';
 import PropertyForm, { PropertyFormData, ExistingImage } from '@/components/admin/PropertyForm';
 import { generateSlug } from '@/utils/slugify';
 import { toast } from '@/hooks/use-toast';
 import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
 } from '@/components/ui/breadcrumb';
 
 const AddProperty = () => {
   const navigate = useNavigate();
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const generateUniqueSlug = async (title: string): Promise<string> => {
     let baseSlug = generateSlug(title);
     let slug = baseSlug;
     let counter = 2;
 
     while (true) {
       const { data } = await supabase
         .from('properties')
         .select('id')
         .eq('slug', slug)
         .maybeSingle();
 
       if (!data) break;
 
       slug = `${baseSlug}-${counter}`;
       counter++;
     }
 
     return slug;
   };
 
   const uploadImages = async (images: ExistingImage[], propertyId: string): Promise<string[]> => {
     const uploadedUrls: string[] = [];
 
     for (const image of images) {
       if (image.isNew && image.file) {
         const fileExt = image.file.name.split('.').pop();
         const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
         const filePath = `properties/${propertyId}/${fileName}`;
 
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
     setIsSubmitting(true);
 
     try {
       // Generate unique slug
       const slug = await generateUniqueSlug(formData.title);
 
       // Create property first to get ID
       const propertyId = crypto.randomUUID();
 
       // Upload images
       const imageUrls = await uploadImages(images, propertyId);
 
       // Insert property
       const { error } = await supabase.from('properties').insert({
         id: propertyId,
         slug,
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
       });
 
       if (error) throw error;
 
       toast({
         title: 'Success!',
         description: 'Property added successfully.',
       });
 
       navigate('/admin/properties');
     } catch (error) {
       console.error('Error adding property:', error);
       toast({
         title: 'Error',
         description: 'Failed to add property. Please try again.',
         variant: 'destructive',
       });
     } finally {
       setIsSubmitting(false);
     }
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
             <BreadcrumbPage>Add New</BreadcrumbPage>
           </BreadcrumbItem>
         </BreadcrumbList>
       </Breadcrumb>
 
       <div>
         <h1 className="text-3xl font-bold text-foreground">Add New Property</h1>
         <p className="text-muted-foreground">Fill in the details to list a new property</p>
       </div>
 
       <PropertyForm mode="add" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
     </div>
   );
 };
 
 export default AddProperty;