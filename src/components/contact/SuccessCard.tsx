 import { CheckCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 interface SuccessCardProps {
   onReset: () => void;
 }
 
 const SuccessCard = ({ onReset }: SuccessCardProps) => {
   return (
     <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
       {/* Animated Checkmark */}
       <div className="relative mb-8">
         <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center animate-scale-in">
           <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={1.5} />
         </div>
         {/* Ripple effect */}
         <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/20 animate-ping" />
       </div>
 
       <h3 className="font-serif text-2xl md:text-3xl mb-4">
         Thank You
       </h3>
       
       <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
         Your message has been received. An agent will contact you via 
         <span className="text-green-600 font-medium"> WhatsApp </span> 
         shortly.
       </p>
 
       <Button
         variant="outline"
         onClick={onReset}
         className="rounded-full px-8"
       >
         Send Another Message
       </Button>
     </div>
   );
 };
 
 export default SuccessCard;