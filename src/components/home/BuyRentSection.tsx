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

// Card backgrounds, by menu position (Buy, Rent); further purposes reuse them in turn.
const cardImages = [buyImage, rentImage];

const countText = (count: number) => `${count} ${count === 1 ? 'property' : 'properties'} available`;

interface PurposeCardProps {
  purpose: NavPurpose;
  image: string;
  loading: boolean;
  /** False when the menu could not be loaded: no counts or category links. */
  detailed: boolean;
}

const PurposeCard = ({ purpose, image, loading, detailed }: PurposeCardProps) => {
  const path = buildListingPath(purpose.urlSegment);
  const forWhat = purpose.label.toLowerCase();

  return (
    <article className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-foreground text-white shadow-lg">
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />

      <div className="relative z-10 flex flex-col gap-6 p-7 md:p-9">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-white/70">
            {purpose.label}
          </p>
          <h3 className="mb-3 font-serif text-4xl font-medium leading-tight md:text-5xl">
            {purpose.navLabel}
          </h3>
          <p className="max-w-sm text-white/80">
            Properties {forWhat} in Karachi's most prestigious locations.
          </p>
          {detailed && !loading && (
            <p className="mt-3 text-sm font-medium text-gold">{countText(purpose.totalCount)}</p>
          )}
        </div>

        {/* Quick links: straight to a category */}
        {detailed && (
          <ul className="flex flex-wrap gap-2 list-none m-0 p-0" aria-label={`${purpose.navLabel} by property type`}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="h-9 w-24 rounded-full bg-white/15 animate-pulse" aria-hidden="true" />
                ))
              : purpose.categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      to={buildListingPath(purpose.urlSegment, category.slug)}
                      className={cn(
                        'inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white hover:text-foreground focus-visible:bg-white focus-visible:text-foreground focus-visible:outline-none',
                        category.count === 0 && 'opacity-60'
                      )}
                    >
                      <CategoryIcon name={category.icon} className="h-4 w-4" />
                      {category.label}
                      <span className="text-xs opacity-70">{category.count}</span>
                    </Link>
                  </li>
                ))}
          </ul>
        )}

        <div>
          <Link
            to={path}
            className="inline-flex min-h-[48px] items-center gap-3 rounded-full bg-gold px-8 text-base font-medium text-gold-foreground transition-all duration-300 hover:bg-gold/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Browse all {forWhat}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
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
