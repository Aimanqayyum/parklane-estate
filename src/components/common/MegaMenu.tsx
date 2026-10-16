import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import CategoryIcon from '@/components/common/CategoryIcon';
import { buildListingPath } from '@/lib/listingMenu';
import { isUnderPurpose, type NavPurpose, type NavState } from '@/lib/navMenu';
import { cn } from '@/lib/utils';

export interface NavLinkItem {
  name: string;
  path: string;
}

interface MegaMenuProps {
  /** Plain links before / after the Buy and Rent entries. */
  before: NavLinkItem[];
  after: NavLinkItem[];
  purposes: NavPurpose[];
  state: NavState;
  pathname: string;
  /** Light text over a dark hero, dark text otherwise. */
  useLightText: boolean;
}

const Underline = () => <span className="block h-0.5 w-full bg-gold mt-0.5 rounded-full" />;

const MegaMenu = ({ before, after, purposes, state, pathname, useLightText }: MegaMenuProps) => {
  const textClass = (active: boolean) =>
    active
      ? useLightText
        ? 'text-white'
        : 'text-foreground'
      : useLightText
        ? 'text-white/70 hover:text-white'
        : 'text-muted-foreground hover:text-foreground';

  const itemClass =
    'text-sm font-medium tracking-wide transition-colors duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  const plainLink = (item: NavLinkItem, active: boolean) => (
    <NavigationMenu.Item key={item.path}>
      <NavigationMenu.Link asChild active={active}>
        <Link to={item.path} className={cn(itemClass, 'block', textClass(active))}>
          {item.name}
          {active && <Underline />}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );

  return (
    // Hover opens after ~120ms; Radix closes ~150ms after the pointer leaves.
    <NavigationMenu.Root
      delayDuration={120}
      skipDelayDuration={300}
      aria-label="Main"
      className="relative hidden lg:block"
    >
      <NavigationMenu.List className="flex items-center gap-6 xl:gap-8 list-none m-0 p-0">
        {before.map((item) => plainLink(item, pathname === item.path))}

        {purposes.map((purpose) => {
          const path = buildListingPath(purpose.urlSegment);
          const active = isUnderPurpose(pathname, purpose.urlSegment);

          // Menu could not be loaded: plain link, no dropdown.
          if (state === 'fallback') {
            return plainLink({ name: purpose.navLabel, path }, active);
          }

          return (
            <NavigationMenu.Item key={purpose.slug} className="relative">
              <NavigationMenu.Trigger
                data-active={active ? 'true' : undefined}
                className={cn(itemClass, 'group flex flex-col items-start', textClass(active))}
              >
                <span className="inline-flex items-center gap-1">
                  {purpose.navLabel}
                  <ChevronDown
                    className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                  />
                </span>
                {active && <Underline />}
              </NavigationMenu.Trigger>

              <NavigationMenu.Content className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
                <PurposePanel purpose={purpose} path={path} loading={state === 'loading'} />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          );
        })}

        {after.map((item) => plainLink(item, pathname === item.path))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};

interface PurposePanelProps {
  purpose: NavPurpose;
  path: string;
  loading: boolean;
}

// Always a light surface so it stays readable over the dark hero.
const PurposePanel = ({ purpose, path, loading }: PurposePanelProps) => {
  const forWhat = purpose.label.toLowerCase();

  return (
    <div className="w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background text-foreground shadow-2xl p-5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95">
      <div className="flex items-start justify-between gap-4 pb-4 mb-3 border-b border-border">
        <div>
          <p className="font-serif text-lg leading-tight">{purpose.navLabel}</p>
          <p className="text-sm text-muted-foreground">Properties {forWhat} in Karachi</p>
        </div>
        <NavigationMenu.Link asChild>
          <Link
            to={path}
            className="text-sm font-medium text-foreground hover:text-gold transition-colors whitespace-nowrap"
          >
            All {forWhat} <span aria-hidden="true">→</span>
          </Link>
        </NavigationMenu.Link>
      </div>

      {loading ? (
        <ul className="grid grid-cols-2 gap-1" aria-busy="true" aria-label="Loading categories">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-2 py-2">
              <span className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              <span className="h-4 w-20 rounded bg-muted animate-pulse" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-1 list-none m-0 p-0">
          {purpose.categories.map((category) => (
            <li key={category.slug}>
              <NavigationMenu.Link asChild>
                <Link
                  to={buildListingPath(purpose.urlSegment, category.slug)}
                  // Empty categories stay visible (the menu is stable) but dimmed.
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                    category.count === 0 && 'opacity-60'
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-gold/20 group-focus-visible:bg-gold/20">
                    <CategoryIcon name={category.icon} className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.count} {category.count === 1 ? 'listing' : 'listings'}
                    </span>
                  </span>
                </Link>
              </NavigationMenu.Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MegaMenu;
