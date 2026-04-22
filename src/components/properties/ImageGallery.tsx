 import { useState, useEffect, useCallback } from 'react';
 import { X, ChevronLeft, ChevronRight } from 'lucide-react';
 
 interface ImageGalleryProps {
   images: string[] | null;
 }
 
 const ImageGallery = ({ images }: ImageGalleryProps) => {
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isFullscreen, setIsFullscreen] = useState(false);
   const [touchStart, setTouchStart] = useState<number | null>(null);
 
   const imageList = images && images.length > 0 ? images : [];
   const hasImages = imageList.length > 0;
 
   const goToPrevious = useCallback(() => {
     setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
   }, [imageList.length]);
 
   const goToNext = useCallback(() => {
     setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
   }, [imageList.length]);
 
   // Handle keyboard navigation in fullscreen
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (!isFullscreen) return;
       if (e.key === 'Escape') setIsFullscreen(false);
       if (e.key === 'ArrowLeft') goToPrevious();
       if (e.key === 'ArrowRight') goToNext();
     };
 
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [isFullscreen, goToPrevious, goToNext]);
 
   // Handle touch swipe
   const handleTouchStart = (e: React.TouchEvent) => {
     setTouchStart(e.touches[0].clientX);
   };
 
   const handleTouchEnd = (e: React.TouchEvent) => {
     if (touchStart === null) return;
     const touchEnd = e.changedTouches[0].clientX;
     const diff = touchStart - touchEnd;
 
     if (Math.abs(diff) > 50) {
       if (diff > 0) goToNext();
       else goToPrevious();
     }
     setTouchStart(null);
   };
 
   if (!hasImages) {
     return (
       <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
         <p className="text-muted-foreground">No images available</p>
       </div>
     );
   }
 
   return (
     <>
       {/* Main Gallery */}
       <div className="space-y-3">
         {/* Primary Image */}
         <div
           className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer"
           onClick={() => setIsFullscreen(true)}
           onTouchStart={handleTouchStart}
           onTouchEnd={handleTouchEnd}
         >
           <img
             src={imageList[currentIndex]}
             alt={`Property image ${currentIndex + 1}`}
             loading="lazy"
             className="w-full h-full object-cover"
           />
 
           {/* Image Counter */}
           <div className="absolute bottom-3 right-3 bg-primary-black/70 text-neutral-white px-3 py-1 rounded-full text-sm">
             {currentIndex + 1} / {imageList.length}
           </div>
 
           {/* Navigation Arrows (Desktop) */}
           {imageList.length > 1 && (
             <>
               <button
                 onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                 className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-neutral-white/90 rounded-full items-center justify-center hover:bg-neutral-white transition-colors"
                 aria-label="Previous image"
               >
                 <ChevronLeft size={24} />
               </button>
               <button
                 onClick={(e) => { e.stopPropagation(); goToNext(); }}
                 className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-neutral-white/90 rounded-full items-center justify-center hover:bg-neutral-white transition-colors"
                 aria-label="Next image"
               >
                 <ChevronRight size={24} />
               </button>
             </>
           )}
         </div>
 
         {/* Thumbnail Strip */}
         {imageList.length > 1 && (
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {imageList.map((image, index) => (
               <button
                 key={index}
                 onClick={() => setCurrentIndex(index)}
                 className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                   index === currentIndex
                     ? 'border-primary'
                     : 'border-transparent hover:border-border'
                 }`}
               >
                 <img
                   src={image}
                   alt={`Thumbnail ${index + 1}`}
                   loading="lazy"
                   className="w-full h-full object-cover"
                 />
               </button>
             ))}
           </div>
         )}
       </div>
 
       {/* Fullscreen Modal (Desktop Only) */}
       {isFullscreen && (
         <div
           className="hidden md:flex fixed inset-0 z-50 bg-primary-black/95 items-center justify-center"
           onClick={() => setIsFullscreen(false)}
         >
           {/* Close Button */}
           <button
             onClick={() => setIsFullscreen(false)}
             className="absolute top-4 right-4 w-12 h-12 bg-neutral-white/20 hover:bg-neutral-white/30 rounded-full flex items-center justify-center text-neutral-white transition-colors"
             aria-label="Close fullscreen"
           >
             <X size={28} />
           </button>
 
           {/* Navigation Arrows */}
           {imageList.length > 1 && (
             <>
               <button
                 onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                 className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-white/20 hover:bg-neutral-white/30 rounded-full flex items-center justify-center text-neutral-white transition-colors"
                 aria-label="Previous image"
               >
                 <ChevronLeft size={32} />
               </button>
               <button
                 onClick={(e) => { e.stopPropagation(); goToNext(); }}
                 className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-white/20 hover:bg-neutral-white/30 rounded-full flex items-center justify-center text-neutral-white transition-colors"
                 aria-label="Next image"
               >
                 <ChevronRight size={32} />
               </button>
             </>
           )}
 
           {/* Fullscreen Image */}
           <img
             src={imageList[currentIndex]}
             alt={`Property image ${currentIndex + 1}`}
             onClick={(e) => e.stopPropagation()}
             className="max-w-[90vw] max-h-[90vh] object-contain"
           />
 
           {/* Image Counter */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-white/20 text-neutral-white px-4 py-2 rounded-full">
             {currentIndex + 1} / {imageList.length}
           </div>
         </div>
       )}
     </>
   );
 };
 
 export default ImageGallery;