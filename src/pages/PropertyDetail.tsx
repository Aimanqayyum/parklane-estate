import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Bed, Bath, Maximize, Home, Phone, MessageCircle, 
  Copy, Check, Share2, Building, ChevronRight, BadgeCheck, Calendar 
} from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { formatPrice, formatArea } from '@/utils/formatPrice';
import BentoGallery from '@/components/properties/BentoGallery';
import PropertyCard from '@/components/properties/PropertyCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ScrollReveal from '@/components/common/ScrollReveal';
import StaggerReveal from '@/components/common/StaggerReveal';
import SEO from '@/components/common/SEO';

interface Property {
  id: string;
  slug: string;
  title: string;
  project_name: string | null;
  description: string | null;
  price: number;
  location: string;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  images: string[] | null;
  video_url: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

interface RelatedProperty {
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

const PHONE_NUMBER = '923333978181';

const PropertyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<RelatedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Property not found');
          return;
        }

        setProperty(data);

        try {
          await supabase.rpc('increment_view_count', { property_id: data.id });
        } catch (e) {
          console.error('Failed to increment view count:', e);
        }

        const { data: related } = await supabase
          .from('properties')
          .select('id, slug, title, project_name, price, location, property_type, bedrooms, bathrooms, area_sqft, images, status, featured')
          .eq('status', 'Available')
          .neq('id', data.id)
          .or(`location.eq.${data.location},project_name.eq.${data.project_name || 'null'}`)
          .limit(4);

        setRelatedProperties((related as RelatedProperty[]) || []);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getWhatsAppUrl = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
  };

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading property..." />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The property you're looking for doesn't exist or has been removed."}
          </p>
          <Link to="/properties" className="btn-primary">
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const isUnavailable = property.status === 'Sold' || property.status === 'Rented';

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <SEO
        title={property.title}
        description={property.description?.substring(0, 150) || `${property.property_type} in ${property.location}`}
        image={property.images?.[0] || undefined}
        type="article"
      />
      
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4 pt-28 md:pt-32">
        <div className="container-luxury">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/properties" className="hover:text-foreground transition-colors">Properties</Link>
            <ChevronRight size={14} />
            <span className="text-foreground truncate max-w-[200px]">{property.title}</span>
          </nav>
        </div>
      </div>

      {/* Bento Grid Hero */}
      <div className="container-luxury py-6 md:py-10">
        <ScrollReveal>
          <BentoGallery images={property.images} />
        </ScrollReveal>
      </div>

      {/* Main Content */}
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column - Scrollable Content */}
          <div className="lg:col-span-7 space-y-12">
            {/* Mobile Title Section */}
            <ScrollReveal className="lg:hidden">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-sm font-medium">
                  <BadgeCheck size={16} />
                  Verified Property
                </div>
                <h1 className="text-3xl font-serif font-medium text-foreground leading-tight">
                  {property.title}
                </h1>
                <p className="text-4xl font-serif font-medium text-foreground">
                  {formatPrice(property.price)}
                </p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={18} strokeWidth={1.5} />
                  <span>{property.location}</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Specs Row */}
            <ScrollReveal delay={100}>
              <div className="flex flex-wrap gap-6 py-6 border-y border-border">
                <div className="flex items-center gap-3">
                  <Home size={20} strokeWidth={1.5} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Type</p>
                    <p className="font-medium text-foreground">{property.property_type}</p>
                  </div>
                </div>
                {property.bedrooms && (
                  <div className="flex items-center gap-3">
                    <Bed size={20} strokeWidth={1.5} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Beds</p>
                      <p className="font-medium text-foreground">{property.bedrooms}</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-3">
                    <Bath size={20} strokeWidth={1.5} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Baths</p>
                      <p className="font-medium text-foreground">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.area_sqft && (
                  <div className="flex items-center gap-3">
                    <Maximize size={20} strokeWidth={1.5} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Area</p>
                      <p className="font-medium text-foreground">{formatArea(property.area_sqft)}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Description */}
            {property.description && (
              <ScrollReveal delay={200}>
                <div>
                  <h2 className="text-2xl font-serif font-medium text-foreground mb-6">About This Property</h2>
                  <div className="prose prose-gray max-w-none">
                    {property.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground leading-relaxed mb-4 text-lg">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Video Section */}
            {property.video_url && (
              <ScrollReveal delay={300}>
                <div>
                  <h2 className="text-2xl font-serif font-medium text-foreground mb-6">Property Video</h2>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                    <iframe
                      src={getVideoEmbedUrl(property.video_url)}
                      title="Property Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Map Section */}
            {property.latitude && property.longitude && (
              <ScrollReveal delay={400}>
                <div>
                  <h2 className="text-2xl font-serif font-medium text-foreground mb-6 flex items-center gap-3">
                    <MapPin size={24} strokeWidth={1.5} />
                    Location
                  </h2>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-muted grayscale hover:grayscale-0 transition-all duration-500">
                    <iframe
                      src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                      title="Property Location"
                      className="w-full h-full border-0"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    * Approximate location shown for privacy
                  </p>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Right Column - Sticky Contact Card (Desktop) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <ScrollReveal delay={100}>
                <div className="bg-card border border-border rounded-3xl p-8 shadow-lg">
                  {isUnavailable && (
                    <span className={`inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium ${
                      property.status === 'Sold' 
                        ? 'bg-rose-500/10 text-rose-600' 
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {property.status}
                    </span>
                  )}

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-sm font-medium mb-4">
                    <BadgeCheck size={16} />
                    Verified Property
                  </div>

                  <h1 className="text-3xl font-serif font-medium text-foreground mb-3 leading-tight">
                    {property.title}
                  </h1>

                  {property.project_name && (
                    <p className="text-muted-foreground mb-4 flex items-center gap-2">
                      <Building size={18} strokeWidth={1.5} />
                      {property.project_name}
                    </p>
                  )}

                  <p className="text-4xl font-serif font-medium text-foreground mb-4">
                    {formatPrice(property.price)}
                  </p>

                  <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <MapPin size={18} strokeWidth={1.5} />
                    <span>{property.location}</span>
                  </div>

                  {property.updated_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <Calendar size={14} strokeWidth={1.5} />
                      <span>Updated {new Date(property.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <a
                      href={getWhatsAppUrl(`Hi, I'm interested in ${property.title} - ${window.location.href}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-full transition-all duration-300 press"
                    >
                      <MessageCircle size={20} fill="currentColor" strokeWidth={0} />
                      WhatsApp Agent
                    </a>
                    <a
                      href={`tel:+${PHONE_NUMBER}`}
                      className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full transition-all duration-300 press"
                    >
                      <Phone size={20} strokeWidth={1.5} />
                      Call Agent
                    </a>
                  </div>

                  <div className="border-t border-border mt-8 pt-6">
                    <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                      <Share2 size={16} strokeWidth={1.5} />
                      Share this property
                    </p>
                    <div className="flex gap-3">
                      <a
                        href={getWhatsAppUrl(`Check out this property: ${property.title} - ${window.location.href}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-full transition-all duration-300 press"
                      >
                        <MessageCircle size={16} fill="currentColor" strokeWidth={0} />
                        WhatsApp
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border hover:bg-muted text-sm rounded-full transition-all duration-300 press"
                      >
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <ScrollReveal className="mt-24">
            <h2 className="text-3xl font-serif font-medium text-foreground mb-10">
              Similar Properties
            </h2>
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={100}>
              {relatedProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </StaggerReveal>
          </ScrollReveal>
        )}
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 px-4 py-4">
          <div className="flex gap-3">
            <a
              href={getWhatsAppUrl(`Hi, I'm interested in ${property.title} - ${window.location.href}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-full transition-all duration-300 press"
            >
              <MessageCircle size={20} fill="currentColor" strokeWidth={0} />
              WhatsApp
            </a>
            <a
              href={`tel:+${PHONE_NUMBER}`}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full transition-all duration-300 press"
            >
              <Phone size={20} strokeWidth={1.5} />
              Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
