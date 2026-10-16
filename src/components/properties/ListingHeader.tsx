import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildListingPath, togglePurposePath } from '@/lib/listingMenu';
import type { ListingMenu, MenuCategory, MenuPurpose } from '@/types/property';

interface ListingHeaderProps {
  heading: string;
  subtitle: string;
  menu: ListingMenu;
  purpose: MenuPurpose | null;
  category: MenuCategory | null;
  /** Query string (with leading '?', or '') kept when moving between categories. */
  chipSearch: string;
  /** Query string kept when switching Buy | Rent (price filters are dropped). */
  toggleSearch: string;
  /** Right-hand slot, e.g. the sort dropdown. */
  actions?: ReactNode;
}

const ListingHeader = ({
  heading,
  subtitle,
  menu,
  purpose,
  category,
  chipSearch,
  toggleSearch,
  actions,
}: ListingHeaderProps) => {
  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-white/70 mb-4">
        <Link to="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight size={14} aria-hidden />
        {purpose ? (
          <>
            {category ? (
              <Link
                to={buildListingPath(purpose.urlSegment) + chipSearch}
                className="hover:text-white transition-colors"
              >
                {purpose.navLabel}
              </Link>
            ) : (
              <span aria-current="page" className="text-white">
                {purpose.navLabel}
              </span>
            )}
            {category && (
              <>
                <ChevronRight size={14} aria-hidden />
                <span aria-current="page" className="text-white">
                  {category.labelPlural}
                </span>
              </>
            )}
          </>
        ) : (
          <span aria-current="page" className="text-white">
            Properties
          </span>
        )}
      </nav>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif mb-2 text-white">{heading}</h1>
          <p className="text-white/80">{subtitle}</p>
        </div>
        {actions}
      </div>

      {purpose && (
        <div className="mt-6 space-y-4">
          {/* Buy | Rent toggle */}
          <div className="inline-flex rounded-full bg-white/10 p-1 backdrop-blur-sm" role="group" aria-label="Listing type">
            {menu.map((p) => {
              const active = p.slug === purpose.slug;
              return (
                <Link
                  key={p.slug}
                  to={togglePurposePath(p, category?.slug ?? null) + toggleSearch}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-medium transition-colors',
                    active ? 'bg-white text-foreground' : 'text-white hover:bg-white/10'
                  )}
                >
                  {p.navLabel}
                </Link>
              );
            })}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Property type">
            {[{ slug: '', label: 'All' }, ...purpose.categories].map((c) => {
              const active = (category?.slug ?? '') === c.slug;
              return (
                <Link
                  key={c.slug || 'all'}
                  to={buildListingPath(purpose.urlSegment, c.slug || undefined) + chipSearch}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  )}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingHeader;
