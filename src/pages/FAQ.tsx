 import faqHero from '@/assets/heroes/faq-hero.jpg';
 import { Link } from 'react-router-dom';
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from '@/components/ui/accordion';
 import { Button } from '@/components/ui/button';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import SEO from '@/components/common/SEO';
 import PageHero from '@/components/common/PageHero';
 
 const FAQ = () => {
   const faqCategories = {
     buying: {
       title: 'Buying',
       questions: [
         {
           q: 'What documents do I need to buy a property in Pakistan?',
           a: 'You will need a valid CNIC (Computerized National Identity Card), proof of income or bank statements, and in case of overseas Pakistanis, a valid passport and NICOP. We assist with all documentation requirements.',
         },
         {
           q: 'How do I verify the legal status of a property?',
           a: 'We conduct thorough due diligence including title verification, ownership history, encumbrance certificates, and NOCs from relevant authorities. Our legal team ensures all properties are properly vetted.',
         },
         {
           q: 'What are the typical costs involved in buying a property?',
           a: 'Besides the property price, expect to pay stamp duty (1-2%), registration fees, agent commission (1-2%), and legal fees. We provide a detailed cost breakdown before you make any commitment.',
         },
         {
           q: 'Can overseas Pakistanis buy property in Pakistan?',
           a: 'Yes, overseas Pakistanis can purchase property in Pakistan. The process involves remittance through proper banking channels and some additional documentation. We specialize in helping overseas clients.',
         },
         {
           q: 'How long does the buying process typically take?',
           a: 'The process usually takes 2-4 weeks from agreement to registration, depending on documentation readiness and bank procedures. We work to expedite this as much as possible.',
         },
       ],
     },
     selling: {
       title: 'Selling',
       questions: [
         {
           q: 'How do you determine my property\'s value?',
           a: 'We conduct a comprehensive market analysis considering location, property condition, recent sales in the area, and current market trends. We provide a free, no-obligation property valuation.',
         },
         {
           q: 'What commission do you charge for selling?',
           a: 'Our commission is competitive and varies based on the property type and value. We discuss all fees upfront with complete transparency. There are no hidden charges.',
         },
         {
           q: 'How do you market my property?',
           a: 'We use a multi-channel approach including professional photography, online listings on major portals, social media marketing, our extensive buyer network, and targeted advertising.',
         },
         {
           q: 'How long does it typically take to sell a property?',
           a: 'This depends on property type, location, pricing, and market conditions. Well-priced properties in prime locations typically sell within 1-3 months. We provide regular updates throughout.',
         },
         {
           q: 'Do I need to be present for viewings?',
           a: 'No, our agents handle all viewings professionally. We coordinate convenient times and provide you with feedback after each viewing. You only need to be involved in final negotiations.',
         },
       ],
     },
     about: {
       title: 'About Us',
       questions: [
         {
           q: 'How long has Park Lane Estate been in business?',
           a: 'Park Lane Estate was founded in 1989, giving us over 35 years of experience in Karachi\'s real estate market. We have successfully completed thousands of transactions.',
         },
         {
           q: 'Which areas do you cover?',
           a: 'We specialize in Karachi\'s premium locations including DHA (all phases), Clifton, Bath Island, PECHS, and Gulshan-e-Iqbal. We also handle properties in other areas upon request.',
         },
         {
           q: 'Are your agents licensed and trained?',
           a: 'Yes, all our agents undergo rigorous training and are well-versed in property laws, market dynamics, and customer service. Many have 10+ years of experience.',
         },
         {
           q: 'What types of properties do you deal with?',
           a: 'We handle residential properties (apartments, bungalows, townhouses), commercial properties (offices, shops, warehouses), and plots. Both sale and rental.',
         },
         {
           q: 'How can I contact Park Lane Estate?',
           a: 'You can reach us through our website contact form, WhatsApp, phone, or visit our office. We\'re available 6 days a week and respond to all inquiries within 24 hours.',
         },
       ],
     },
   };
 
   return (
     <div className="min-h-screen bg-background">
       <SEO
         title="Frequently Asked Questions"
         description="Find answers to common questions about buying, selling, and renting properties in Karachi with Park Lane Estate."
       />
 
       {/* Hero */}
       <PageHero
         title="Frequently Asked Questions"
         subtitle="Find answers to common questions about buying, selling, and renting properties"
         backgroundImage={faqHero}
       />
 
       {/* FAQ Content */}
      <section className="section-luxury">
         <div className="container-luxury">
           <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="buying" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-12">
                 {Object.entries(faqCategories).map(([key, category]) => (
                   <TabsTrigger key={key} value={key}>
                     {category.title}
                   </TabsTrigger>
                 ))}
               </TabsList>
 
               {Object.entries(faqCategories).map(([key, category]) => (
                 <TabsContent key={key} value={key}>
                   <Accordion type="single" collapsible className="w-full">
                     {category.questions.map((faq, index) => (
                       <AccordionItem key={index} value={`item-${index}`}>
                         <AccordionTrigger className="text-left">
                           {faq.q}
                         </AccordionTrigger>
                         <AccordionContent className="text-muted-foreground">
                           {faq.a}
                         </AccordionContent>
                       </AccordionItem>
                     ))}
                   </Accordion>
                 </TabsContent>
               ))}
             </Tabs>
           </div>
         </div>
       </section>
 
       {/* Still Have Questions */}
      <section className="section-luxury-sm bg-muted">
         <div className="container-luxury text-center">
          <h2 className="text-foreground mb-6">
             Still Have Questions?
           </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
             Can't find what you're looking for? Our team is here to help with any 
             questions about properties or our services.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button size="lg" asChild>
               <Link to="/contact">Contact Us</Link>
             </Button>
             <Button size="lg" variant="outline" asChild>
               <a href="https://wa.me/92XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                 WhatsApp Us
               </a>
             </Button>
           </div>
         </div>
       </section>
     </div>
   );
 };
 
 export default FAQ;