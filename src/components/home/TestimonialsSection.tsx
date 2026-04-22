 import { Quote } from 'lucide-react';
import ScrollReveal from '@/components/common/ScrollReveal';
import StaggerReveal from '@/components/common/StaggerReveal';
 
 const testimonials = [
   {
     quote: "Park Lane Estate helped us find our dream home in DHA. Professional service from start to finish!",
     name: "Ahmed Khan",
     role: "Property Buyer",
   },
   {
     quote: "Sold my apartment in Clifton within 2 weeks. Highly recommended for serious sellers.",
     name: "Fatima Ali",
     role: "Property Seller",
   },
   {
     quote: "Trustworthy and transparent. The best real estate consultancy in Karachi.",
     name: "Hassan Raza",
     role: "Property Investor",
   },
 ];
 
 const TestimonialsSection = () => {
   return (
    <ScrollReveal className="section-luxury bg-background">
       <div className="container-luxury">
         {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-foreground mb-6">
             What Our Clients Say
           </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             Trusted by hundreds of satisfied clients across Karachi
           </p>
        </ScrollReveal>
 
         {/* Testimonials Grid */}
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={100}>
           {testimonials.map((testimonial, index) => (
             <div
               key={index}
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-500"
             >
               {/* Quote Icon */}
              <Quote size={32} className="text-gold/30 mb-6" />
 
               {/* Quote Text */}
              <p className="text-lg text-foreground mb-8 leading-relaxed">
                 "{testimonial.quote}"
               </p>
 
               {/* Author */}
               <div>
                <p className="font-serif font-medium text-foreground">
                   {testimonial.name}
                 </p>
                <p className="text-sm text-muted-foreground mt-1">
                   {testimonial.role}
                 </p>
               </div>
             </div>
           ))}
        </StaggerReveal>
       </div>
    </ScrollReveal>
   );
 };
 
 export default TestimonialsSection;