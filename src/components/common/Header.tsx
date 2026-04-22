import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/parklane-logo.png';
 
 const navLinks = [
   { name: 'Home', path: '/' },
   { name: 'Properties', path: '/properties' },
   { name: 'About Us', path: '/about' },
   { name: 'Services', path: '/services' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Contact', path: '/contact' },
 ];
 
 // Pages that have dark hero sections
const darkHeroPages = ['/', '/properties', '/about', '/services', '/faq', '/contact'];
 
 const Header = () => {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
   const location = useLocation();
 
   const isActive = (path: string) => location.pathname === path;
 
  // Check if current page has a dark hero section
  const hasDarkHero = darkHeroPages.includes(location.pathname);
 
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
 
           {/* Desktop Navigation */}
           <nav className="hidden md:flex items-center space-x-8">
             {navLinks.map((link) => (
               <Link
                 key={link.path}
                 to={link.path}
                className={`text-sm font-medium tracking-wide transition-all duration-300 ${
                   isActive(link.path)
                    ? (useLightText ? 'text-white' : 'text-foreground')
                    : (useLightText ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground')
                 }`}
               >
                 {link.name}
                {isActive(link.path) && (
                  <span className="block h-0.5 w-full bg-gold mt-0.5 rounded-full" />
                )}
               </Link>
             ))}
           </nav>
 
           {/* Mobile Menu Button */}
           <button
             onClick={toggleMenu}
            className={`md:hidden p-2 transition-colors press ${
              useLightText ? 'text-white hover:text-gold' : 'text-foreground hover:text-gold'
            }`}
             aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
           >
             {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
         </div>
       </div>
 
       {/* Mobile Navigation Overlay */}
       <div
        className={`fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-500 ${
           isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
         }`}
         onClick={closeMenu}
       />
 
       {/* Mobile Navigation Slide Panel */}
       <nav
        className={`fixed top-0 right-0 h-full w-80 bg-background shadow-2xl z-50 md:hidden transform transition-transform duration-500 ease-out ${
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
          {navLinks.map((link, index) => (
             <Link
               key={link.path}
               to={link.path}
               onClick={closeMenu}
              className={`px-8 py-4 text-base font-medium transition-all duration-300 opacity-0 animate-fade-up ${
                 isActive(link.path)
                  ? 'text-foreground bg-muted/50 border-l-2 border-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
               }`}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
             >
               {link.name}
             </Link>
           ))}
         </div>
       </nav>
     </header>
   );
 };
 
 export default Header;