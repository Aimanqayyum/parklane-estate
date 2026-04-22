 import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 
 const ContactInfo = () => {
  const phoneNumber = '+92 333 3978181';
    const phoneLink = 'tel:+923333978181';
    const whatsappNumber = '+923333978181';
   const email = 'contact@parklaneestate.com';
 
   const generateWhatsAppLink = () => {
     const message = encodeURIComponent('Hi, I would like to inquire about your real estate services.');
     return `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`;
   };
 
   return (
     <Card className="shadow-lg">
       <CardContent className="p-6 space-y-6">
         <h3 className="text-xl font-semibold text-foreground">Get In Touch</h3>
 
         <div className="space-y-4">
           {/* Office Address */}
           <div className="flex items-start gap-4">
             <div className="p-2 bg-primary/10 rounded-lg">
               <MapPin className="h-5 w-5 text-primary" />
             </div>
             <div>
               <h4 className="font-medium text-foreground">Office Address</h4>
               <p className="text-muted-foreground">Sana Arcade BC-14, Block 5 Clifton, Karachi (Near KGS)</p>
             </div>
           </div>
 
           {/* Phone Number */}
           <a
             href={phoneLink}
             className="flex items-start gap-4 group hover:opacity-80 transition-opacity"
           >
             <div className="p-2 bg-primary/10 rounded-lg">
               <Phone className="h-5 w-5 text-primary" />
             </div>
             <div>
               <h4 className="font-medium text-foreground">Phone</h4>
               <p className="text-muted-foreground group-hover:text-primary transition-colors">
                 {phoneNumber}
               </p>
             </div>
           </a>
 
           {/* Email */}
           <a
             href={`mailto:${email}`}
             className="flex items-start gap-4 group hover:opacity-80 transition-opacity"
           >
             <div className="p-2 bg-primary/10 rounded-lg">
               <Mail className="h-5 w-5 text-primary" />
             </div>
             <div>
               <h4 className="font-medium text-foreground">Email</h4>
               <p className="text-muted-foreground group-hover:text-primary transition-colors">
                 {email}
               </p>
             </div>
           </a>
 
           {/* WhatsApp */}
           <div className="flex items-start gap-4">
             <div className="p-2 bg-[#25D366]/10 rounded-lg">
               <MessageCircle className="h-5 w-5 text-[#25D366]" />
             </div>
             <div className="flex-1">
               <h4 className="font-medium text-foreground">WhatsApp</h4>
               <p className="text-muted-foreground mb-2">{phoneNumber}</p>
               <Button
                 asChild
                 size="sm"
                 className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
               >
                 <a
                   href={generateWhatsAppLink()}
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   <MessageCircle className="mr-2 h-4 w-4" />
                   Chat on WhatsApp
                 </a>
               </Button>
             </div>
           </div>
 
           {/* Office Hours */}
           <div className="flex items-start gap-4">
             <div className="p-2 bg-primary/10 rounded-lg">
               <Clock className="h-5 w-5 text-primary" />
             </div>
             <div>
               <h4 className="font-medium text-foreground">Office Hours</h4>
               <p className="text-muted-foreground">Monday - Saturday</p>
               <p className="text-muted-foreground">9:00 AM - 6:00 PM</p>
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 };
 
 export default ContactInfo;