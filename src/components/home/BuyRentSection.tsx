import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CategoryIcon from '@/components/common/CategoryIcon';
import ScrollReveal from '@/components/common/ScrollReveal';
import StaggerReveal from '@/components/common/StaggerReveal';
import { useListingMenu } from '@/hooks/useListingMenu';
import { buildListingPath } from '@/lib/listingMenu';
import { navPurposes, type NavPurpose } from '@/lib/navMenu';
import { cn } from '@/lib/utils';
import buyImage from '@/assets/hero/hero-2.jpg';
import rentImage from '@/assets/hero/hero-4.jpg';

// Card photos, by menu position (Buy, Rent); further purposes reuse them in turn.
const cardImages = [buyImage, rentImage];

const countText = (count: number) => `${count} ${count === 1 ? 'property' : 'properties'} available`;

interface PurposeCardProps {
  purpose: NavPurpose;
  image: string;
  loading: boolean;
  /** False when the menu could not be loaded: no counts or category links. */
  detailed: boolean;
}

/*
 * All text sits on solid theme surfaces (card / background / foreground), never
 * on the photo, so it stays readable whatever the picture looks like. The colour
 * pairs used here are checked against WCAG AA in BuyRentSection.contrast.test.ts.
 */
const PurposeCard = ({ purpose, image, loading, detailed }: PurposeCardProps) => {
  const path = buildListingPath(purpose.urlSegment);
  const forWhat = purpose.label.toLowerCase();

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Photo: clickable for mouse and touch; the text link below is the accessible one. */}
      <Link to={path} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-background">
          {purpose.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-6 p-7 md:p-8">
        <div>
          <h3 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
            {purpose.navLabel}
          </h3>
          <p className="mt-2 text-base text-muted-foreground">
            Properties {forWhat} in Karachi's most prestigious locations.
          </p>
          {detailed && !loading && (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
              {countText(purpose.totalCount)}
            </p>
          )}
        </div>

        {/* Quick links: straight to a category */}
        {detailed && (
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={`${purpose.navLabel} by property type`}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="h-10 w-24 animate-pulse rounded-full bg-muted" aria-hidden="true" />
                ))
              : purpose.categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      to={buildListingPath(purpose.urlSegment, category.slug)}
                      className={cn(
                        'inline-flex min-h-[40px] items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:border-foreground focus-visible:bg-foreground focus-visible:text-background focus-visible:outline-none',
                        category.count === 0 && 'opacity-60'
                      )}
                    >
                      <CategoryIcon name={category.icon} className="h-4 w-4" />
                      {category.label}
                      <span className="text-xs tabular-nums opacity-80">{category.count}</span>
                    </Link>
                  </li>
                ))}
          </ul>
        )}

        <Link
          to={path}
          className="mt-auto inline-flex min-h-[52px] w-full items-center justify-between gap-3 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/85 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto sm:justify-center"
        >
          Browse all {forWhat}
          <ArrowRight
            size={18}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
};

/** Home page: the two main ways in (Buy / Rent), between the hero and Featured Properties. */
const BuyRentSection = () => {
  const { menu, isLoading, isError } = useListingMenu();
  const { state, purposes } = navPurposes(menu, { isLoading, isError });

  // The database has no active purposes: nothing to offer.
  if (purposes.length === 0) return null;

  return (
    <section className="bg-background py-16 md:py-24" aria-labelledby="buy-rent-heading">
      <div className="container-luxury">
        <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 id="buy-rent-heading" className="mb-5 text-foreground">
            Find Your Next Property
          </h2>
          <p className="text-lg text-muted-foreground">
            Looking to buy or to rent? Start with what you need and go straight to the right listings.
          </p>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8" staggerDelay={150}>
          {purposes.map((purpose, index) => (
            <PurposeCard
              key={purpose.slug}
              purpose={purpose}
              image={cardImages[index % cardImages.length]}
              loading={state === 'loading'}
              detailed={state !== 'fallback'}
            />
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
};

export default BuyRentSection;
