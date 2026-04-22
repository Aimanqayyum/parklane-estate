 import { Award, ShieldCheck, Users, Handshake } from 'lucide-react';
import ScrollReveal from '@/components/common/ScrollReveal';
import StaggerReveal from '@/components/common/StaggerReveal';
 
 const features = [
   {
     icon: Award,
     title: '35+ Years of Excellence',
     description: 'Three decades of trusted real estate services in Karachi\'s premium locations.',
   },
   {
     icon: ShieldCheck,
     title: 'Verified Property Deals',
     description: 'Every property listing is personally verified by our expert team.',
   },
   {
     icon: Users,
     title: 'Professional Expert Team',
     description: 'Experienced consultants dedicated to finding your perfect property.',
   },
   {
     icon: Handshake,
     title: 'Strong Client Relationships',
     description: 'Building lasting relationships through transparent and honest dealings.',
   },
 ];
 
 const WhyChooseUs = () => {
   return (
    <ScrollReveal className="section-luxury bg-secondary">
       <div className="container-luxury">
         {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-foreground mb-6">
             Why Choose Park Lane Estate?
           </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             We've built our reputation on trust, quality, and exceptional service
           </p>
        </ScrollReveal>
 
         {/* Features Grid */}
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-8" staggerDelay={100}>
           {features.map((feature, index) => {
             const Icon = feature.icon;
             return (
               <div
                 key={index}
                className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-500"
               >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center">
                    <Icon size={24} className="text-gold" />
                   </div>
                   <div>
                    <h3 className="text-xl font-serif font-medium text-foreground mb-3">
                       {feature.title}
                     </h3>
                    <p className="text-muted-foreground leading-relaxed">
                       {feature.description}
                     </p>
                   </div>
                 </div>
               </div>
             );
           })}
        </StaggerReveal>
       </div>
    </ScrollReveal>
   );
 };
 
 export default WhyChooseUs;