 const PropertyCardSkeleton = () => {
   return (
     <div className="bg-card rounded-3xl overflow-hidden">
       {/* Image Skeleton */}
       <div className="relative aspect-[4/3] bg-muted animate-pulse">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
       </div>
 
       {/* Content Skeleton */}
       <div className="p-6">
         {/* Location */}
         <div className="h-3 w-24 bg-muted rounded animate-pulse mb-4" />
 
         {/* Title */}
         <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
         <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-4" />
 
         {/* Specs */}
         <div className="flex gap-4 mb-6 pt-4 border-t border-border/50">
           <div className="h-4 w-16 bg-muted rounded animate-pulse" />
           <div className="h-4 w-16 bg-muted rounded animate-pulse" />
           <div className="h-4 w-20 bg-muted rounded animate-pulse" />
         </div>
 
         {/* Price */}
         <div className="h-8 w-32 bg-muted rounded animate-pulse" />
       </div>
     </div>
   );
 };
 
 export default PropertyCardSkeleton;