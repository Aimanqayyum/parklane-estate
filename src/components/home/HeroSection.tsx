import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';

// Import hero images
import hero1 from '@/assets/hero/hero-1.jpg';
import hero2 from '@/assets/hero/hero-2.jpg';
import hero3 from '@/assets/hero/hero-3.jpg';
import hero4 from '@/assets/hero/hero-4.jpg';
import hero5 from '@/assets/hero/hero-5.jpg';

const heroImages = [hero1, hero2, hero3, hero4, hero5];

const locations = [
  { value: '', label: 'All Locations' },
  { value: 'Clifton Block 5', label: 'Clifton Block 5' },
  { value: 'Clifton Block 8', label: 'Clifton Block 8' },
  { value: 'DHA Phase 6', label: 'DHA Phase 6' },
  { value: 'DHA Phase 8', label: 'DHA Phase 8' },
  { value: 'Saddar', label: 'Saddar' },
];

const SLIDE_DURATION = 6000; // 6 seconds per slide

const HeroSection = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Auto-advance slides
  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
      setIsTransitioning(false);
    }, 1000); // Match fade-out duration
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = selectedLocation ? `?location=${encodeURIComponent(selectedLocation)}` : '';
    navigate(`/properties${params}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic Background Slider */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center ${
              index === currentIndex ? 'animate-ken-burns' : ''
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        </div>
      ))}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-[1]" />

      {/* Content Layer - Always on top */}
      <div className="relative z-10 container-luxury text-center px-6 pt-20">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-white mb-8 leading-[1.1] opacity-0 animate-fade-up">
          Trusted Deals, Better Living
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-white/70 mb-16 max-w-2xl mx-auto font-light tracking-wide opacity-0 animate-fade-up animate-delay-200">
          35+ Years of Excellence in Karachi's Premium Real Estate
        </p>

        {/* Floating Capsule Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-0 max-w-2xl mx-auto opacity-0 animate-fade-up animate-delay-300"
        >
          <div className="relative flex-1 group">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full h-16 md:h-18 pl-8 pr-12 
                         sm:rounded-l-full sm:rounded-r-none rounded-full sm:rounded-none sm:first:rounded-l-full
                         bg-white/95 backdrop-blur-sm text-foreground 
                         border-0 focus:ring-0 focus:outline-none
                         appearance-none cursor-pointer
                         text-base font-medium tracking-wide
                         transition-all duration-300"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
            <ChevronDown 
              className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
              size={18} 
            />
          </div>

          <button
            type="submit"
            className="h-16 md:h-18 px-10 
                       bg-gold text-gold-foreground 
                       sm:rounded-r-full sm:rounded-l-none rounded-full mt-3 sm:mt-0
                       font-medium text-base tracking-wide
                       flex items-center justify-center gap-3 
                       hover:bg-gold/90 active:scale-[0.98]
                       transition-all duration-300"
          >
            <Search size={20} strokeWidth={2.5} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Trust Indicators */}
        <div className="mt-20 md:mt-28 flex flex-wrap justify-center gap-12 md:gap-20 opacity-0 animate-fade-up animate-delay-500">
          <div className="text-center">
            <span className="block text-4xl md:text-5xl font-serif font-medium text-white">35+</span>
            <span className="text-sm text-white/50 uppercase tracking-widest mt-2 block">Years</span>
          </div>
          <div className="text-center">
            <span className="block text-4xl md:text-5xl font-serif font-medium text-white">500+</span>
            <span className="text-sm text-white/50 uppercase tracking-widest mt-2 block">Sold</span>
          </div>
          <div className="text-center">
            <span className="block text-4xl md:text-5xl font-serif font-medium text-white">100%</span>
            <span className="text-sm text-white/50 uppercase tracking-widest mt-2 block">Verified</span>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, 500);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;