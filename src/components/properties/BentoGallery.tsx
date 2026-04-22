import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface BentoGalleryProps {
  images: string[] | null;
}

const BentoGallery = ({ images }: BentoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const imageList = images && images.length > 0 ? images : [];
  const hasImages = imageList.length > 0;
  const displayImages = imageList.slice(0, 5);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  }, [imageList.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  }, [imageList.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToPrevious, goToNext]);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isLightboxOpen]);

  // Touch swipe for mobile carousel
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

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  if (!hasImages) {
    return (
      <div className="aspect-video bg-muted rounded-3xl flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Swipeable Carousel */}
      <div className="md:hidden relative">
        <div
          className="aspect-[4/3] relative overflow-hidden rounded-2xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => openLightbox(currentIndex)}
        >
          <img
            src={imageList[currentIndex]}
            alt={`Property image ${currentIndex + 1}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {/* Counter Badge */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {currentIndex + 1} / {imageList.length}
          </div>
        </div>
      </div>

      {/* Desktop Bento Grid */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[500px] lg:h-[600px]">
        {/* Main Large Image (60% width - spans 2.5 cols, 2 rows) */}
        <div
          className="col-span-2 row-span-2 relative overflow-hidden rounded-3xl cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={displayImages[0]}
            alt="Property main image"
            loading="eager"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              prefersReducedMotion ? '' : 'group-hover:scale-105'
            }`}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Top Right Small Images */}
        {displayImages.slice(1, 3).map((image, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => openLightbox(idx + 1)}
          >
            <img
              src={image}
              alt={`Property image ${idx + 2}`}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                prefersReducedMotion ? '' : 'group-hover:scale-105'
              }`}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ))}

        {/* Bottom Right Small Images */}
        {displayImages.slice(3, 5).map((image, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => openLightbox(idx + 3)}
          >
            <img
              src={image}
              alt={`Property image ${idx + 4}`}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                prefersReducedMotion ? '' : 'group-hover:scale-105'
              }`}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            
            {/* Show more photos button on last image */}
            {idx === 1 && imageList.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  +{imageList.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Fill empty slots if less than 5 images */}
        {displayImages.length < 5 &&
          Array.from({ length: 5 - displayImages.length }).map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-muted rounded-2xl" />
          ))}
      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors press"
            aria-label="Close lightbox"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          {/* Navigation */}
          {imageList.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors press"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} strokeWidth={1.5} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors press"
                aria-label="Next image"
              >
                <ChevronRight size={28} strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Main Image */}
          <img
            src={imageList[currentIndex]}
            alt={`Property image ${currentIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] object-contain"
          />

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-medium">
            {currentIndex + 1} / {imageList.length}
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto p-2">
            {imageList.map((image, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default BentoGallery;