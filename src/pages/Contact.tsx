 import ContactForm from '@/components/contact/ContactForm';
 import SEO from '@/components/common/SEO';
 import contactHero from '@/assets/heroes/contact-hero.jpg';
 import { Phone, Mail, MapPin, Clock } from 'lucide-react';
 
 // Social icons
 const SocialLinks = () => (
   <div className="flex items-center gap-4">
     <a
       href="https://facebook.com"
       target="_blank"
       rel="noopener noreferrer"
       className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
       aria-label="Facebook"
     >
       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
       </svg>
     </a>
     <a
       href="https://instagram.com"
       target="_blank"
       rel="noopener noreferrer"
       className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
       aria-label="Instagram"
     >
       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
         <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
       </svg>
     </a>
     <a
       href="https://linkedin.com"
       target="_blank"
       rel="noopener noreferrer"
       className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
       aria-label="LinkedIn"
     >
       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
         <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
       </svg>
     </a>
   </div>
 );
 
 const Contact = () => {
   return (
     <div className="min-h-screen bg-background">
       <SEO
         title="Contact Us"
         description="Get in touch with Park Lane Estate for property inquiries, buying, selling, or investment advisory. Contact our team today."
       />
 
       {/* Background Image with Overlay */}
       <div className="fixed inset-0 z-0">
         <div
            className="absolute inset-0"
          >
            <img
              src={contactHero}
              alt=""
              className="w-full h-full object-cover"
         />
          </div>
         <div className="absolute inset-0 bg-foreground/60" />
       </div>
 
       {/* Main Content */}
       <div className="relative z-10 min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
           {/* Header */}
           <div className="text-center mb-12 animate-fade-in">
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4">
               Get in Touch
             </h1>
             <p className="text-lg text-white/70 max-w-2xl mx-auto">
               Experience concierge-level service. Our team is ready to assist you 
               with your real estate journey in Karachi.
             </p>
           </div>
 
           {/* Split Screen Container */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
             {/* Left Side - Dark/Info */}
             <div className="bg-foreground text-background p-8 md:p-12 lg:p-14 order-1 lg:order-1 animate-slide-in-left">
               <div className="h-full flex flex-col">
                 {/* Contact Info */}
                 <div className="mb-10">
                   <h2 className="font-serif text-2xl md:text-3xl mb-6 text-background">
                     The Invitation
                   </h2>
                   <p className="text-background/70 mb-8 leading-relaxed">
                     Whether you're looking to buy your dream home, sell your property, 
                     or explore investment opportunities in Karachi's prime locations — 
                     we're here to make it happen.
                   </p>
                 </div>
 
                 {/* Contact Details */}
                 <div className="space-y-6 mb-10">
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                       <Phone className="w-5 h-5" strokeWidth={1.5} />
                     </div>
                     <div>
                       <p className="text-sm text-background/50 mb-1">Call Us</p>
                       <a href="tel:+923001234567" className="text-lg hover:text-gold transition-colors">
                         +92 300 123 4567
                       </a>
                     </div>
                   </div>
 
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                       <Mail className="w-5 h-5" strokeWidth={1.5} />
                     </div>
                     <div>
                       <p className="text-sm text-background/50 mb-1">Email Us</p>
                       <a href="mailto:info@parklaneestate.pk" className="text-lg hover:text-gold transition-colors">
                         info@parklaneestate.pk
                       </a>
                     </div>
                   </div>
 
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                       <MapPin className="w-5 h-5" strokeWidth={1.5} />
                     </div>
                     <div>
                       <p className="text-sm text-background/50 mb-1">Visit Us</p>
                       <p className="text-lg">Clifton Block 5, Karachi</p>
                     </div>
                   </div>
 
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                       <Clock className="w-5 h-5" strokeWidth={1.5} />
                     </div>
                     <div>
                       <p className="text-sm text-background/50 mb-1">Working Hours</p>
                       <p className="text-lg">Mon – Sat: 10am – 7pm</p>
                     </div>
                   </div>
                 </div>
 
                 {/* Social Links */}
                 <div className="mb-10">
                   <p className="text-sm text-background/50 mb-4">Follow Us</p>
                   <SocialLinks />
                 </div>
 
                 {/* Map - Grayscale Styled */}
                 <div className="mt-auto">
                   <p className="text-sm text-background/50 mb-4">Our Location</p>
                   <div className="rounded-2xl overflow-hidden h-[200px] lg:h-[240px]">
                     <iframe
                       src="https://www.google.com/maps?q=24.8138,67.0300&z=15&output=embed"
                       width="100%"
                       height="100%"
                       style={{ 
                         border: 0, 
                         filter: 'grayscale(100%) contrast(1.1)',
                       }}
                       allowFullScreen
                       loading="lazy"
                       referrerPolicy="no-referrer-when-downgrade"
                       title="Park Lane Estate - Clifton Block 5"
                     />
                   </div>
                 </div>
               </div>
             </div>
 
             {/* Right Side - Light/Form */}
             <div className="bg-card/95 backdrop-blur-xl p-8 md:p-12 lg:p-14 order-2 lg:order-2 animate-slide-in-right">
               <div className="max-w-md mx-auto lg:max-w-none">
                 <h2 className="font-serif text-2xl md:text-3xl mb-2">
                   Send Us a Message
                 </h2>
                 <p className="text-muted-foreground mb-8">
                   Fill out the form below and we'll respond within 24 hours.
                 </p>
 
                 <ContactForm />
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 export default Contact;