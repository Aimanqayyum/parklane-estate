import { Link } from 'react-router-dom';
import { Home, RotateCcw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { whatsappUrl } from '@/utils/whatsapp';
import type { MenuCategory, MenuPurpose } from '@/types/property';

interface EmptyStateProps {
  onReset: () => void;
  /** True when search filters (not just the route) are narrowing the results. */
  hasActiveFilters?: boolean;
  purpose?: MenuPurpose | null;
  category?: MenuCategory | null;
}

const EmptyState = ({ onReset, hasActiveFilters = false, purpose = null, category = null }: EmptyStateProps) => {
  const what = category ? category.labelPlural.toLowerCase() : 'properties';
  const forWhat = purpose ? ` ${purpose.label.toLowerCase()}` : '';

  const title = hasActiveFilters ? 'No Properties Match' : `No ${category ? category.labelPlural : 'Properties'} Right Now`;
  const message = hasActiveFilters
    ? `We couldn't find any ${what}${forWhat} matching your filters. Try adjusting or clearing them.`
    : `We don't have any ${what}${forWhat} listed at the moment. Tell us what you're looking for and we'll let you know when something comes up.`;

  const whatsappMessage = `Hi, I'm looking for ${what}${forWhat} in Karachi.`;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
          <Home className="w-16 h-16 text-muted-foreground/50" strokeWidth={1} />
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold/20" />
        <div className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-primary/10" />
      </div>

      <h3 className="font-serif text-2xl mb-3">{title}</h3>

      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">{message}</p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {hasActiveFilters && (
          <Button onClick={onReset} className="rounded-full px-8 gap-2">
            <RotateCcw className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
        <Button asChild variant={hasActiveFilters ? 'outline' : 'default'} className="rounded-full px-8 gap-2">
          <a href={whatsappUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" />
            Ask us on WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-8">
          <Link to="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
