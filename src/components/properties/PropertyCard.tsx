 import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { Bed, Bath, Maximize, Heart, Check, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
 import { formatPrice, formatArea } from '@/utils/formatPrice';
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
 
 interface PropertyCardProps {
   property: Property;
 }
 
 const PropertyCard = ({ property }: PropertyCardProps) => {
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [isSaved, setIsSaved] = useState(false);
 
   const {
     slug,
     title,
     project_name,
     price,
     bedrooms,
     bathrooms,
     area_sqft,
     images,
     status,
   } = property;
 
   const imageList = images && images.length > 0 ? images.slice(0, 3) : ['/placeholder.svg'];
   const isUnavailable = status === 'Sold' || status === 'Rented';
 
   const handlePrevImage = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
     setCurrentImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
   };
 
   const handleNextImage = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
     setCurrentImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
   };
 
   const handleSave = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
     setIsSaved(!isSaved);
   };
 
   const handleWhatsApp = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
     const message = encodeURIComponent(`Hi, I'm interested in ${project_name || title} - ${formatPrice(price)}`);
     window.open(`https://wa.me/923333978181?text=${message}`, '_blank');
   };
 
   return (
     <Link
       to={`/properties/${slug}`}
       className="group block bg-card rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
     >
       {/* Image Container */}
       <div className="relative aspect-[4/3] overflow-hidden">
         {/* Image Carousel */}
         <div className="relative w-full h-full">
           {imageList.map((img, idx) => (
             <img
               key={idx}
               src={img}
               alt={`${title} - ${idx + 1}`}
               loading="lazy"
               className={cn(
                 "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                 idx === currentImageIndex ? "opacity-100" : "opacity-0"
               )}
             />
           ))}
         </div>
 
         {/* Gradient Overlay for Price */}
         <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
 
         {/* Top Left - Verified Badge */}
         <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
           <Check className="w-3 h-3" />
           Verified
         </div>
 
         {/* Top Right - Save Heart */}
         <button
           onClick={handleSave}
           className={cn(
             "absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
             isSaved
               ? "bg-red-500 text-white"
               : "bg-white/90 text-foreground hover:bg-white hover:scale-110"
           )}
         >
           <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
         </button>
 
         {/* Carousel Navigation - Desktop Only */}
         {imageList.length > 1 && (
           <>
             <button
               onClick={handlePrevImage}
               className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
             >
               <ChevronLeft className="w-4 h-4 text-foreground" />
             </button>
             <button
               onClick={handleNextImage}
               className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
             >
               <ChevronRight className="w-4 h-4 text-foreground" />
             </button>
           </>
         )}
 
         {/* Carousel Dots */}
         {imageList.length > 1 && (
           <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
             {imageList.map((_, idx) => (
               <div
                 key={idx}
                 className={cn(
                   "w-1.5 h-1.5 rounded-full transition-all",
                   idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                 )}
               />
             ))}
           </div>
         )}
 
         {/* Bottom - Price Overlay */}
         <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
           <p className="text-2xl md:text-3xl font-serif font-medium text-white">
             {formatPrice(price)}
           </p>
 
           {/* WhatsApp Quick Action - Mobile always visible, Desktop on hover */}
           <button
             onClick={handleWhatsApp}
             className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white
                        md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300
                        hover:bg-green-600 active:scale-95"
           >
             <MessageCircle className="w-5 h-5" fill="currentColor" strokeWidth={0} />
           </button>
         </div>
 
         {/* Status Overlay */}
         {isUnavailable && (
           <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm flex items-center justify-center">
             <span className="bg-background text-foreground px-6 py-2 font-serif font-medium text-lg rounded-full">
               {status}
             </span>
           </div>
         )}
       </div>
 
       {/* Content */}
       <div className="p-5">
         {/* Title */}
         <h3 className="text-lg font-serif font-medium text-foreground truncate mb-1 group-hover:text-gold transition-colors duration-300">
           {title}
         </h3>
 
         {/* Project Name */}
         {project_name && (
           <p className="text-sm text-muted-foreground truncate mb-3">{project_name}</p>
         )}
 
         {/* Specs Row */}
         <div className="flex items-center gap-4 text-sm text-muted-foreground">
           {bedrooms && (
             <div className="flex items-center gap-1.5">
               <Bed size={15} strokeWidth={1.5} className="text-gold" />
               <span>{bedrooms}</span>
             </div>
           )}
           {bathrooms && (
             <div className="flex items-center gap-1.5">
               <Bath size={15} strokeWidth={1.5} className="text-gold" />
               <span>{bathrooms}</span>
             </div>
           )}
           {area_sqft && (
             <div className="flex items-center gap-1.5">
               <Maximize size={15} strokeWidth={1.5} className="text-gold" />
               <span>{formatArea(area_sqft)}</span>
             </div>
           )}
         </div>
       </div>
     </Link>
   );
 };
 
 export default PropertyCard;