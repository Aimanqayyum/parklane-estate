import { Link } from 'react-router-dom';
import CategoryIcon from '@/components/common/CategoryIcon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { buildListingPath } from '@/lib/listingMenu';
import { isUnderPurpose, type NavPurpose, type NavState } from '@/lib/navMenu';
import { cn } from '@/lib/utils';

interface MobileMenuSectionProps {
  purposes: NavPurpose[];
  state: NavState;
  pathname: string;
  /** Called when any link is chosen, so the slide-out panel can close. */
  onNavigate: () => void;
}

const rowBase = 'flex items-center min-h-[44px] px-8 py-3 text-base font-medium transition-colors';

/** Buy and Rent accordions for the slide-out panel (one open at a time). */
const MobileMenuSection = ({ purposes, state, pathname, onNavigate }: MobileMenuSectionProps) => {
  // Menu could not be loaded: plain links, no accordions.
  if (state === 'fallback') {
    return (
      <>
        {purposes.map((purpose) => {
          const active = isUnderPurpose(pathname, purpose.urlSegment);
          return (
            <Link
              key={purpose.slug}
              to={buildListingPath(purpose.urlSegment)}
              onClick={onNavigate}
              className={cn(
                rowBase,
                'py-4',
                active
                  ? 'text-foreground bg-muted/50 border-l-2 border-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              {purpose.navLabel}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <Accordion type="single" collapsible>
      {purposes.map((purpose) => {
        const active = isUnderPurpose(pathname, purpose.urlSegment);
        const forWhat = purpose.label.toLowerCase();

        return (
          <AccordionItem key={purpose.slug} value={purpose.slug} className="border-b-0">
            <AccordionTrigger
              className={cn(
                'min-h-[44px] px-8 py-4 text-base hover:no-underline',
                active
                  ? 'text-foreground bg-muted/50 border-l-2 border-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              {purpose.navLabel}
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <Link
                to={buildListingPath(purpose.urlSegment)}
                onClick={onNavigate}
                className={cn(rowBase, 'pl-12 text-foreground hover:bg-muted/30')}
              >
                All {forWhat}
              </Link>

              {state === 'loading' ? (
                <div className="px-12 py-2 space-y-3" aria-busy="true" aria-label="Loading categories">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-5 w-32 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                purpose.categories.map((category) => (
                  <Link
                    key={category.slug}
                    to={buildListingPath(purpose.urlSegment, category.slug)}
                    onClick={onNavigate}
                    className={cn(
                      rowBase,
                      'pl-12 gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/30',
                      category.count === 0 && 'opacity-60'
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      <CategoryIcon name={category.icon} className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{category.label}</span>
                    <span className="text-xs">{category.count}</span>
                  </Link>
                ))
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default MobileMenuSection;
