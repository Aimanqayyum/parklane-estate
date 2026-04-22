 import { Link } from 'react-router-dom';
 import servicesHero from '@/assets/heroes/services-hero.jpg';
 import { Home, Building, Key, TrendingUp, FileText, Search, Users, Shield, ArrowRight } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import SEO from '@/components/common/SEO';
 import PageHero from '@/components/common/PageHero';
 
 const Services = () => {
   const mainServices = [
     {
       icon: Home,
       title: 'Buying Assistance',
       description: 'Find your dream property with expert guidance through every step of the buying process.',
       features: [
         'Personalized property search based on your requirements',
         'Market analysis and fair price evaluation',
         'Property inspection and due diligence',
         'Negotiation and deal closure support',
         'Legal documentation assistance',
       ],
     },
     {
       icon: Building,
       title: 'Selling Services',
       description: 'Maximize your property value with our comprehensive selling solutions.',
       features: [
         'Free property valuation',
         'Professional photography and marketing',
         'Listing on premium platforms',
         'Buyer screening and qualification',
         'Negotiation and closing assistance',
       ],
     },
     {
       icon: Key,
       title: 'Rent & Leasing',
       description: 'Whether you\'re a tenant or landlord, we make renting simple and secure.',
       features: [
         'Tenant screening and verification',
         'Rental agreement preparation',
         'Property management services',
         'Rent collection assistance',
         'Maintenance coordination',
       ],
     },
     {
       icon: TrendingUp,
       title: 'Investment Advisory',
       description: 'Make informed investment decisions with our market insights and expertise.',
       features: [
         'Market trend analysis',
         'ROI projections and calculations',
         'Portfolio diversification advice',
         'Off-plan investment opportunities',
         'Commercial property investments',
       ],
     },
   ];
 
   const additionalServices = [
     {
       icon: FileText,
       title: 'Legal Documentation',
       description: 'Complete assistance with all property-related legal paperwork and verification.',
     },
     {
       icon: Search,
       title: 'Property Verification',
       description: 'Thorough verification of property titles, ownership, and legal status.',
     },
     {
       icon: Users,
       title: 'Relocation Support',
       description: 'Comprehensive relocation services for families and businesses.',
     },
     {
       icon: Shield,
       title: 'Property Insurance',
       description: 'Guidance on property insurance options to protect your investment.',
     },
   ];
 
   return (
     <div className="min-h-screen bg-background">
       <SEO
         title="Our Services"
         description="Explore Park Lane Estate's real estate services - buying assistance, selling, rent & leasing, and investment advisory in Karachi."
       />
 
       {/* Hero */}
       <PageHero
         title="Our Services"
         subtitle="Comprehensive real estate solutions tailored to your needs"
         backgroundImage={servicesHero}
       />
 
       {/* Main Services */}
      <section className="section-luxury">
         <div className="container-luxury">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-6">
               What We Offer
             </h2>
             <p className="text-muted-foreground max-w-2xl mx-auto">
               From finding your dream home to maximizing your property investments, 
               we provide end-to-end real estate services.
             </p>
           </div>
 
          <div className="grid md:grid-cols-2 gap-10">
             {mainServices.map((service) => (
              <Card key={service.title} className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                 <CardHeader className="bg-muted/50">
                   <div className="flex items-start gap-4">
                    <div className="p-3 bg-gold/10 rounded-xl">
                      <service.icon className="h-6 w-6 text-gold" />
                     </div>
                     <div>
                      <CardTitle className="text-xl font-serif">{service.title}</CardTitle>
                       <CardDescription className="mt-1">{service.description}</CardDescription>
                     </div>
                   </div>
                 </CardHeader>
                <CardContent className="pt-8">
                  <ul className="space-y-4">
                     {service.features.map((feature) => (
                       <li key={feature} className="flex items-start gap-3">
                        <ArrowRight className="h-4 w-4 text-gold mt-1 flex-shrink-0" />
                         <span className="text-muted-foreground text-sm">{feature}</span>
                       </li>
                     ))}
                   </ul>
                  <Button className="w-full mt-8" asChild>
                     <Link to="/contact">Get Started</Link>
                   </Button>
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
       </section>
 
       {/* Additional Services */}
      <section className="section-luxury-sm bg-muted">
         <div className="container-luxury">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-6">
               Additional Services
             </h2>
             <p className="text-muted-foreground max-w-2xl mx-auto">
               We go beyond basic real estate services to provide complete support
             </p>
           </div>
 
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {additionalServices.map((service) => (
              <Card key={service.title} className="text-center rounded-2xl border-0 shadow-none hover:shadow-xl transition-all duration-500">
                <CardContent className="pt-8 pb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 mb-6">
                    <service.icon className="h-7 w-7 text-gold" />
                   </div>
                  <h3 className="text-lg font-serif font-medium text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
       </section>
 
       {/* Process */}
      <section className="section-luxury">
         <div className="container-luxury">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-6">
               How We Work
             </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
               A simple, transparent process designed for your convenience
             </p>
           </div>
 
           <div className="grid md:grid-cols-4 gap-8">
             {[
               { step: '01', title: 'Consultation', description: 'Share your requirements and goals with our experts' },
               { step: '02', title: 'Search & Match', description: 'We find properties that match your criteria' },
               { step: '03', title: 'Visit & Evaluate', description: 'Tour selected properties with our guidance' },
               { step: '04', title: 'Close the Deal', description: 'We handle negotiations and paperwork' },
             ].map((item) => (
               <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground text-2xl font-serif font-medium mb-6">
                   {item.step}
                 </div>
                <h3 className="text-lg font-serif font-medium text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
               </div>
             ))}
           </div>
         </div>
       </section>
 
       {/* CTA */}
      <section className="section-luxury-sm bg-primary text-primary-foreground">
         <div className="container-luxury text-center">
          <h2 className="text-primary-foreground mb-6">
             Ready to Get Started?
           </h2>
          <p className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
             Contact us today for a free consultation and let us help you with your real estate needs.
           </p>
           <Button size="lg" variant="secondary" asChild>
             <Link to="/contact">Contact Us Today</Link>
           </Button>
         </div>
       </section>
     </div>
   );
 };
 
 export default Services;