 import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import ScrollReveal from '@/components/common/ScrollReveal';
import logo from '@/assets/parklane-logo.png';
 
 const quickLinks = [
   { name: 'Properties', path: '/properties' },
   { name: 'About Us', path: '/about' },
   { name: 'Services', path: '/services' },
  { name: 'FAQ', path: '/faq' },
   { name: 'Contact', path: '/contact' },
 ];
 
 const Footer = () => {
   const currentYear = new Date().getFullYear();
 
   return (
    <footer className="bg-foreground text-background mt-auto">
      {/* Main Footer Content */}
      <ScrollReveal className="container-luxury py-24 md:py-32 lg:py-40">
        {/* Large Headline */}
        <div className="mb-20 md:mb-28">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-background/90 leading-[1.1] max-w-4xl">
            Let's find your 
            <span className="text-gold"> perfect</span> space.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {/* Column 1: Brand */}
           <div>
            <img src={logo} alt="Park Lane Estate" className="h-24 w-auto mb-6 brightness-0 invert" />
            <p className="text-background/40 text-sm leading-relaxed mb-6">
              35+ years of excellence in Karachi's premium real estate. 
              Specializing in luxury properties in Clifton and DHA areas.
             </p>
            <p className="text-gold font-serif italic text-sm">
              "Trusted Deals, Better Living"
            </p>
           </div>
 
           {/* Column 2: Quick Links */}
           <div>
            <h3 className="text-xs uppercase tracking-widest text-background/40 mb-6">
              Navigation
             </h3>
            <ul className="space-y-4">
               {quickLinks.map((link) => (
                 <li key={link.path}>
                   <Link
                     to={link.path}
                    className="text-background/70 hover:text-gold transition-colors duration-300 text-sm flex items-center gap-2 group"
                   >
                     {link.name}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </Link>
                 </li>
               ))}
             </ul>
           </div>
 
           {/* Column 3: Contact Info */}
           <div>
            <h3 className="text-xs uppercase tracking-widest text-background/40 mb-6">
              Contact
             </h3>
            <ul className="space-y-5">
               <li className="flex items-start gap-3">
                <Phone size={16} className="text-gold mt-0.5 flex-shrink-0" />
               <a href="tel:+923333978181" className="text-background/70 hover:text-gold transition-colors text-sm">
                   +92 333 3978181
                </a>
               </li>
               <li className="flex items-start gap-3">
                <Mail size={16} className="text-gold mt-0.5 flex-shrink-0" />
                <a href="mailto:contact@parklaneestate.com" className="text-background/70 hover:text-gold transition-colors text-sm">
                   contact@parklaneestate.com
                </a>
               </li>
               <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-background/70 text-sm">
                   Sana Arcade BC-14, Block 5 Clifton, Karachi (Near KGS)
                 </span>
               </li>
             </ul>
           </div>

          {/* Column 4: CTA */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-background/40 mb-6">
              Get Started
            </h3>
            <p className="text-background/50 text-sm mb-6 leading-relaxed">
              Ready to find your dream property? Let's talk.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-background/20 text-background/80 text-sm hover:bg-background hover:text-foreground transition-all duration-300 press"
            >
              Contact Us
              <ArrowUpRight size={14} />
            </Link>
          </div>
         </div>
      </ScrollReveal>
 
      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-luxury py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/30 text-xs tracking-wide">
             © {currentYear} Park Lane Estate. All rights reserved.
           </p>
          <Link 
            to="/admin" 
            className="text-background/20 hover:text-background/50 text-xs transition-colors"
          >
            Admin
          </Link>
         </div>
       </div>
     </footer>
   );
 };
 
 export default Footer;