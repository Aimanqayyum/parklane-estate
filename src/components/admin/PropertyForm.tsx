 import { useState, useEffect, useRef } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { supabase } from '@/utils/supabase';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Checkbox } from '@/components/ui/checkbox';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Loader2, Upload, X, GripVertical, AlertCircle } from 'lucide-react';
 
 export interface PropertyFormData {
   title: string;
   projectName: string;
   description: string;
   price: string;
   location: string;
   propertyType: string;
   bedrooms: string;
   bathrooms: string;
   areaSqft: string;
   status: string;
   featured: boolean;
   videoUrl: string;
   latitude: string;
   longitude: string;
 }
 
 export interface ExistingImage {
   url: string;
   isNew?: boolean;
   file?: File;
 }
 
 interface PropertyFormProps {
   mode: 'add' | 'edit';
   initialData?: PropertyFormData & { images?: string[] };
   onSubmit: (data: PropertyFormData, images: ExistingImage[]) => Promise<void>;
   isSubmitting?: boolean;
 }
 
 const LOCATIONS = [
   'Clifton Block 5',
   'Clifton Block 8',
   'DHA Phase 1',
   'DHA Phase 2',
   'DHA Phase 3',
   'DHA Phase 4',
   'DHA Phase 5',
   'DHA Phase 6',
   'DHA Phase 7',
   'DHA Phase 8',
   'Saddar',
 ];
 
 const PROPERTY_TYPES = ['Apartment', 'Bungalow', 'Office', 'Shop', 'Plot'];
 const STATUS_OPTIONS = ['Available', 'Sold', 'Rented'];
 
 const PropertyForm = ({ mode, initialData, onSubmit, isSubmitting = false }: PropertyFormProps) => {
   const navigate = useNavigate();
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const [formData, setFormData] = useState<PropertyFormData>({
     title: '',
     projectName: '',
     description: '',
     price: '',
     location: '',
     propertyType: '',
     bedrooms: '',
     bathrooms: '',
     areaSqft: '',
     status: 'Available',
     featured: false,
     videoUrl: '',
     latitude: '',
     longitude: '',
   });
 
   const [images, setImages] = useState<ExistingImage[]>([]);
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [touched, setTouched] = useState<Record<string, boolean>>({});
 
   useEffect(() => {
     if (initialData) {
       setFormData({
         title: initialData.title || '',
         projectName: initialData.projectName || '',
         description: initialData.description || '',
         price: initialData.price || '',
         location: initialData.location || '',
         propertyType: initialData.propertyType || '',
         bedrooms: initialData.bedrooms || '',
         bathrooms: initialData.bathrooms || '',
         areaSqft: initialData.areaSqft || '',
         status: initialData.status || 'Available',
         featured: initialData.featured || false,
         videoUrl: initialData.videoUrl || '',
         latitude: initialData.latitude || '',
         longitude: initialData.longitude || '',
       });
 
       if (initialData.images) {
         setImages(initialData.images.map((url) => ({ url, isNew: false })));
       }
     }
   }, [initialData]);
 
   const validateField = (name: string, value: string): string | undefined => {
     switch (name) {
       case 'title':
         if (!value.trim()) return 'Title is required';
         if (value.trim().length < 5) return 'Title must be at least 5 characters';
         return undefined;
       case 'description':
         if (!value.trim()) return 'Description is required';
         if (value.trim().length < 20) return 'Description must be at least 20 characters';
         return undefined;
       case 'price':
         if (!value.trim()) return 'Price is required';
         if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) return 'Please enter a valid price';
         return undefined;
       case 'location':
         if (!value) return 'Location is required';
         return undefined;
       case 'propertyType':
         if (!value) return 'Property type is required';
         return undefined;
       case 'status':
         if (!value) return 'Status is required';
         return undefined;
       case 'videoUrl':
         if (value && !value.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/)) {
           return 'Please enter a valid YouTube or Vimeo URL';
         }
         return undefined;
       default:
         return undefined;
     }
   };
 
   const handleBlur = (name: string) => {
     setTouched((prev) => ({ ...prev, [name]: true }));
     const error = validateField(name, formData[name as keyof PropertyFormData] as string);
     setErrors((prev) => ({ ...prev, [name]: error || '' }));
   };
 
   const handleChange = (name: string, value: string | boolean) => {
     setFormData((prev) => ({ ...prev, [name]: value }));
     if (touched[name] && typeof value === 'string') {
       const error = validateField(name, value);
       setErrors((prev) => ({ ...prev, [name]: error || '' }));
     }
   };
 
   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (!files) return;
 
     const newImages: ExistingImage[] = [];
     const maxSize = 5 * 1024 * 1024; // 5MB
 
     Array.from(files).forEach((file) => {
       if (images.length + newImages.length >= 10) {
         return;
       }
       if (file.size > maxSize) {
         setErrors((prev) => ({ ...prev, images: `${file.name} is larger than 5MB` }));
         return;
       }
       if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
         setErrors((prev) => ({ ...prev, images: `${file.name} is not a valid image type` }));
         return;
       }
 
       newImages.push({
         url: URL.createObjectURL(file),
         isNew: true,
         file,
       });
     });
 
     if (newImages.length > 0) {
       setImages((prev) => [...prev, ...newImages]);
       setErrors((prev) => ({ ...prev, images: '' }));
     }
 
     // Reset file input
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   const removeImage = (index: number) => {
     setImages((prev) => prev.filter((_, i) => i !== index));
   };
 
   const validateForm = (): boolean => {
     const newErrors: Record<string, string> = {};
     const requiredFields = ['title', 'description', 'price', 'location', 'propertyType', 'status'];
 
     requiredFields.forEach((field) => {
       const error = validateField(field, formData[field as keyof PropertyFormData] as string);
       if (error) newErrors[field] = error;
     });
 
     if (formData.videoUrl) {
       const videoError = validateField('videoUrl', formData.videoUrl);
       if (videoError) newErrors.videoUrl = videoError;
     }
 
     setErrors(newErrors);
     setTouched(
       requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
     );
 
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (!validateForm()) return;
 
     await onSubmit(formData, images);
   };
 
   return (
     <form onSubmit={handleSubmit} className="space-y-6">
       {/* Basic Info */}
       <Card>
         <CardHeader>
           <CardTitle>Basic Information</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="title">Title *</Label>
               <Input
                 id="title"
                 value={formData.title}
                 onChange={(e) => handleChange('title', e.target.value)}
                 onBlur={() => handleBlur('title')}
                 placeholder="e.g., 3 Bedroom Luxury Apartment in DHA"
                 className={errors.title ? 'border-destructive' : ''}
               />
               {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="projectName">Project Name</Label>
               <Input
                 id="projectName"
                 value={formData.projectName}
                 onChange={(e) => handleChange('projectName', e.target.value)}
                 placeholder="e.g., Creek Vista"
               />
             </div>
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="description">Description *</Label>
             <Textarea
               id="description"
               rows={6}
               value={formData.description}
               onChange={(e) => handleChange('description', e.target.value)}
               onBlur={() => handleBlur('description')}
               placeholder="Describe the property in detail..."
               className={errors.description ? 'border-destructive' : ''}
             />
             {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
           </div>
         </CardContent>
       </Card>
 
       {/* Property Details */}
       <Card>
         <CardHeader>
           <CardTitle>Property Details</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
               <Label htmlFor="price">Price (PKR) *</Label>
               <Input
                 id="price"
                 type="number"
                 value={formData.price}
                 onChange={(e) => handleChange('price', e.target.value)}
                 onBlur={() => handleBlur('price')}
                 placeholder="e.g., 50000000"
                 className={errors.price ? 'border-destructive' : ''}
               />
               {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="location">Location *</Label>
               <Select
                 value={formData.location}
                 onValueChange={(value) => handleChange('location', value)}
               >
                 <SelectTrigger className={errors.location ? 'border-destructive' : ''}>
                   <SelectValue placeholder="Select location" />
                 </SelectTrigger>
                 <SelectContent>
                   {LOCATIONS.map((loc) => (
                     <SelectItem key={loc} value={loc}>
                       {loc}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="propertyType">Property Type *</Label>
               <Select
                 value={formData.propertyType}
                 onValueChange={(value) => handleChange('propertyType', value)}
               >
                 <SelectTrigger className={errors.propertyType ? 'border-destructive' : ''}>
                   <SelectValue placeholder="Select type" />
                 </SelectTrigger>
                 <SelectContent>
                   {PROPERTY_TYPES.map((type) => (
                     <SelectItem key={type} value={type}>
                       {type}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {errors.propertyType && <p className="text-sm text-destructive">{errors.propertyType}</p>}
             </div>
           </div>
 
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="space-y-2">
               <Label htmlFor="bedrooms">Bedrooms</Label>
               <Input
                 id="bedrooms"
                 type="number"
                 min="0"
                 max="10"
                 value={formData.bedrooms}
                 onChange={(e) => handleChange('bedrooms', e.target.value)}
                 placeholder="e.g., 3"
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="bathrooms">Bathrooms</Label>
               <Input
                 id="bathrooms"
                 type="number"
                 min="0"
                 max="10"
                 value={formData.bathrooms}
                 onChange={(e) => handleChange('bathrooms', e.target.value)}
                 placeholder="e.g., 2"
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="areaSqft">Area (sqft)</Label>
               <Input
                 id="areaSqft"
                 type="number"
                 value={formData.areaSqft}
                 onChange={(e) => handleChange('areaSqft', e.target.value)}
                 placeholder="e.g., 1800"
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="status">Status *</Label>
               <Select
                 value={formData.status}
                 onValueChange={(value) => handleChange('status', value)}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select status" />
                 </SelectTrigger>
                 <SelectContent>
                   {STATUS_OPTIONS.map((status) => (
                     <SelectItem key={status} value={status}>
                       {status}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
 
           <div className="flex items-center space-x-2">
             <Checkbox
               id="featured"
               checked={formData.featured}
               onCheckedChange={(checked) => handleChange('featured', checked as boolean)}
             />
             <Label htmlFor="featured" className="cursor-pointer">
               Featured Property (shown on homepage)
             </Label>
           </div>
         </CardContent>
       </Card>
 
       {/* Images */}
       <Card>
         <CardHeader>
           <CardTitle>Images</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex flex-wrap gap-4">
             {images.map((image, index) => (
               <div key={index} className="relative group">
                 <img
                   src={image.url}
                   alt={`Property ${index + 1}`}
                   className="w-32 h-32 object-cover rounded-lg border"
                 />
                 <button
                   type="button"
                   onClick={() => removeImage(index)}
                   className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <X className="h-4 w-4" />
                 </button>
                 {index === 0 && (
                   <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                     Primary
                   </span>
                 )}
               </div>
             ))}
 
             {images.length < 10 && (
               <button
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="w-32 h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
               >
                 <Upload className="h-8 w-8 mb-2" />
                 <span className="text-xs">Upload</span>
               </button>
             )}
           </div>
 
           <input
             ref={fileInputRef}
             type="file"
             accept="image/jpeg,image/png,image/webp"
             multiple
             onChange={handleImageUpload}
             className="hidden"
           />
 
           {errors.images && (
             <div className="flex items-center gap-2 text-sm text-destructive">
               <AlertCircle className="h-4 w-4" />
               {errors.images}
             </div>
           )}
 
           <p className="text-sm text-muted-foreground">
             Upload up to 10 images. Max 5MB each. First image will be the primary image.
           </p>
         </CardContent>
       </Card>
 
       {/* Video & Location */}
       <Card>
         <CardHeader>
           <CardTitle>Video & Location</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
             <Input
               id="videoUrl"
               value={formData.videoUrl}
               onChange={(e) => handleChange('videoUrl', e.target.value)}
               onBlur={() => handleBlur('videoUrl')}
               placeholder="https://www.youtube.com/watch?v=..."
               className={errors.videoUrl ? 'border-destructive' : ''}
             />
             {errors.videoUrl && <p className="text-sm text-destructive">{errors.videoUrl}</p>}
           </div>
 
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="latitude">Latitude</Label>
               <Input
                 id="latitude"
                 type="number"
                 step="any"
                 value={formData.latitude}
                 onChange={(e) => handleChange('latitude', e.target.value)}
                 placeholder="e.g., 24.8607"
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="longitude">Longitude</Label>
               <Input
                 id="longitude"
                 type="number"
                 step="any"
                 value={formData.longitude}
                 onChange={(e) => handleChange('longitude', e.target.value)}
                 placeholder="e.g., 67.0011"
               />
             </div>
           </div>
           <p className="text-sm text-muted-foreground">
             Add coordinates to display the property on a map.
           </p>
         </CardContent>
       </Card>
 
       {/* Actions */}
       <div className="flex items-center gap-4">
         <Button type="submit" size="lg" disabled={isSubmitting}>
           {isSubmitting ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               {mode === 'add' ? 'Adding...' : 'Updating...'}
             </>
           ) : mode === 'add' ? (
             'Add Property'
           ) : (
             'Update Property'
           )}
         </Button>
         <Button type="button" variant="outline" onClick={() => navigate('/admin/properties')}>
           Cancel
         </Button>
       </div>
     </form>
   );
 };
 
 export default PropertyForm;