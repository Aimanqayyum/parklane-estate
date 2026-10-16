import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/parklane-logo.png';
import MegaMenu, { type NavLinkItem } from '@/components/common/MegaMenu';
import MobileMenuSection from '@/components/common/MobileMenuSection';
import { useListingMenu } from '@/hooks/useListingMenu';
import { isListingPath, navPurposes } from '@/lib/navMenu';

// Order: Home, Buy, Rent, Properties, About Us, Services, FAQ, Contact.
// Buy and Rent come from the listing menu and sit between these two groups.
const linksBeforePurposes: NavLinkItem[] = [{ name: 'Home', path: '/' }];
const linksAfterPurposes: NavLinkItem[] = [
  { name: 'Properties', path: '/properties' },
  { name: 'About Us', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Contact', path: '/contact' },
];

// Pages that have dark hero sections (listing pages under /buy and /rent are added below)
const darkHeroPages = ['/', '/properties', '/about', '/services', '/faq', '/contact'];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { menu, isLoading, isError } = useListingMenu();
  const { state, purposes } = navPurposes(menu, { isLoading, isError });

  const isActive = (path: string) => location.pathname === path;

  // Check if current page has a dark hero section
  const hasDarkHero =
    darkHeroPages.includes(location.pathname) || isListingPath(location.pathname, purposes);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine if we should use light text (when over dark background)
  const useLightText = hasDarkHero && !isScrolled;

  const mobileLinkClass = (path: string) =>
    `px-8 py-4 min-h-[44px] text-base font-medium transition-all duration-300 opacity-0 animate-fade-up ${
      isActive(path)
        ? 'text-foreground bg-muted/50 border-l-2 border-gold'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
    }`;

  // Stagger the mobile entries: Home, the Buy / Rent group, then the rest.
  const mobileStyle = (index: number) => ({
    animationDelay: `${index * 100}ms`,
    animationFillMode: 'forwards' as const,
  });

  const mobileLink = (link: NavLinkItem, index: number) => (
    <Link
      key={link.path}
      to={link.path}
      onClick={closeMenu}
      className={mobileLinkClass(link.path)}
      style={mobileStyle(index)}
    >
      {link.name}
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4 md:pt-6">
      <div
        className={`
          mx-auto max-w-6xl rounded-full transition-all duration-500 ease-out
          ${isScrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-lg border border-border/50'
            : 'bg-transparent'
          }
        `}
      >
        <div className="flex items-center justify-between h-20 md:h-24 px-6 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <img
              src={logo}
              alt="Park Lane Estate"
              className={`h-20 md:h-24 w-auto transition-all duration-300 ${
                useLightText ? 'brightness-0 invert' : ''
              }`}
            />
          </Link>

          {/* Desktop Navigation (from lg: eight items do not fit the pill below it) */}
          <MegaMenu
            before={linksBeforePurposes}
            after={linksAfterPurposes}
            purposes={purposes}
            state={state}
            pathname={location.pathname}
            useLightText={useLightText}
          />

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`lg:hidden p-2 transition-colors press ${
              useLightText ? 'text-white hover:text-gold' : 'text-foreground hover:text-gold'
            }`}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile Navigation Slide Panel */}
      <nav
        aria-label="Mobile"
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-background shadow-2xl z-50 lg:hidden transform transition-transform duration-500 ease-out overflow-y-auto ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <img src={logo} alt="Park Lane Estate" className="h-20 w-auto" />
          <button
            onClick={closeMenu}
            className="p-2 text-foreground hover:text-gold transition-colors press"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col py-6">
          {linksBeforePurposes.map((link, index) => mobileLink(link, index))}

          <div
            className="opacity-0 animate-fade-up"
            style={mobileStyle(linksBeforePurposes.length)}
          >
            <MobileMenuSection
              purposes={purposes}
              state={state}
              pathname={location.pathname}
              onNavigate={closeMenu}
            />
          </div>

          {linksAfterPurposes.map((link, index) =>
            mobileLink(link, linksBeforePurposes.length + 1 + index)
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
