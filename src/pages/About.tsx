 import { Link } from 'react-router-dom';
 import aboutHero from '@/assets/heroes/about-hero.jpg';
 import { Building2, Award, Users, Target, Heart, CheckCircle } from 'lucide-react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import SEO from '@/components/common/SEO';
 import PageHero from '@/components/common/PageHero';
 
 const About = () => {
   const milestones = [
     { year: '1989', title: 'Founded', description: 'Park Lane Estate established in Karachi' },
     { year: '2000', title: 'Expansion', description: 'Expanded operations to DHA and Clifton' },
     { year: '2010', title: '1000+ Sales', description: 'Reached milestone of 1000 successful transactions' },
     { year: '2024', title: '35 Years', description: 'Celebrating 35 years of excellence' },
   ];
 
   const values = [
     {
       icon: Target,
       title: 'Integrity',
       description: 'We conduct business with honesty and transparency in every transaction.',
     },
     {
       icon: Users,
       title: 'Client Focus',
       description: 'Your satisfaction is our priority. We listen, understand, and deliver.',
     },
     {
       icon: Award,
       title: 'Excellence',
       description: 'We strive for excellence in every aspect of our service.',
     },
     {
       icon: Heart,
       title: 'Trust',
       description: 'Building lasting relationships based on trust and reliability.',
     },
   ];
 
   const stats = [
     { value: '35+', label: 'Years of Experience' },
     { value: '2000+', label: 'Properties Sold' },
     { value: '500+', label: 'Happy Families' },
     { value: '15+', label: 'Expert Agents' },
   ];
 
   return (
     <div className="min-h-screen bg-background">
       <SEO
         title="About Us"
         description="Learn about Park Lane Estate - 35+ years of excellence in Karachi's premium real estate market. Discover our story, values, and commitment to clients."
       />
 
       {/* Hero Section */}
       <PageHero
         title="About Park Lane Estate"
         subtitle="35+ years of excellence in Karachi's premium real estate market"
         backgroundImage={aboutHero}
       />
 
       {/* Stats */}
      <section className="py-16 md:py-20 bg-muted">
         <div className="container-luxury">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {stats.map((stat) => (
               <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-serif font-medium text-foreground">{stat.value}</p>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
               </div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Our Story */}
      <section className="section-luxury">
         <div className="container-luxury">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div>
              <h2 className="text-foreground mb-8">
                 Our Story
               </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                 <p>
                   Founded in 1989, Park Lane Estate has grown from a small family business 
                   to one of Karachi's most trusted real estate agencies. Our journey began 
                   with a simple mission: to help families find their dream homes.
                 </p>
                 <p>
                   Over three decades, we have built lasting relationships with thousands of 
                   clients, guiding them through every step of buying, selling, and investing 
                   in properties across Karachi's most prestigious locations.
                 </p>
                 <p>
                   Today, we continue to uphold the values that made us successful – integrity, 
                   professionalism, and an unwavering commitment to our clients' satisfaction.
                 </p>
               </div>
             </div>
            <div className="bg-muted rounded-3xl aspect-video flex items-center justify-center">
               <Building2 className="h-24 w-24 text-muted-foreground/50" />
               {/* Placeholder for team/office photo */}
             </div>
           </div>
         </div>
       </section>
 
       {/* Mission */}
      <section className="section-luxury-sm bg-muted">
         <div className="container-luxury">
           <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-foreground mb-8">
               Our Mission
             </h2>
             <p className="text-xl text-muted-foreground leading-relaxed">
               To provide exceptional real estate services that exceed expectations, 
               helping our clients make informed decisions and achieve their property 
               goals with confidence and peace of mind.
             </p>
           </div>
         </div>
       </section>
 
       {/* Values */}
      <section className="section-luxury">
         <div className="container-luxury">
          <h2 className="text-foreground text-center mb-16">
             Our Values
           </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {values.map((value) => (
              <Card key={value.title} className="text-center rounded-2xl border-0 shadow-none hover:shadow-xl transition-all duration-500">
                 <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 mb-6">
                    <value.icon className="h-7 w-7 text-gold" />
                   </div>
                  <h3 className="text-lg font-serif font-medium text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
       </section>
 
       {/* Timeline */}
      <section className="section-luxury-sm bg-muted">
         <div className="container-luxury">
          <h2 className="text-foreground text-center mb-16">
             Our Journey
           </h2>
           <div className="max-w-3xl mx-auto">
             <div className="space-y-8">
               {milestones.map((milestone, index) => (
                 <div key={milestone.year} className="flex gap-6">
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                       {milestone.year.slice(-2)}
                     </div>
                     {index < milestones.length - 1 && (
                       <div className="w-0.5 flex-1 bg-border mt-2" />
                     )}
                   </div>
                   <div className="flex-1 pb-8">
                     <p className="text-sm text-muted-foreground">{milestone.year}</p>
                     <h3 className="text-lg font-semibold text-foreground">{milestone.title}</h3>
                     <p className="text-muted-foreground">{milestone.description}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </section>
 
       {/* Why Choose Us */}
      <section className="section-luxury">
         <div className="container-luxury">
           <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-muted rounded-3xl aspect-square flex items-center justify-center">
               <Award className="h-24 w-24 text-muted-foreground/50" />
               {/* Placeholder for image */}
             </div>
             <div>
              <h2 className="text-foreground mb-8">
                 Why Choose Park Lane Estate?
               </h2>
              <ul className="space-y-5">
                 {[
                   '35+ years of industry experience',
                   'Deep knowledge of Karachi\'s real estate market',
                   'Personalized service tailored to your needs',
                   'Transparent and honest dealings',
                   'Extensive network of properties and buyers',
                   'Professional guidance at every step',
                 ].map((item) => (
                   <li key={item} className="flex items-start gap-3">
                     <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                     <span className="text-muted-foreground">{item}</span>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
         </div>
       </section>
 
       {/* CTA */}
      <section className="section-luxury-sm bg-primary text-primary-foreground">
        <div className="container-luxury text-center">
          <h2 className="text-primary-foreground mb-6">
             Ready to Find Your Dream Property?
           </h2>
          <p className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
             Let our experienced team help you navigate Karachi's real estate market.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button size="lg" variant="secondary" asChild>
               <Link to="/properties">Browse Properties</Link>
             </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
               <Link to="/contact">Contact Us</Link>
             </Button>
           </div>
         </div>
       </section>
     </div>
   );
 };
 
 export default About;