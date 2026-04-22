 import { Home, RotateCcw } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 interface EmptyStateProps {
   onReset: () => void;
 }
 
 const EmptyState = ({ onReset }: EmptyStateProps) => {
   return (
     <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
       {/* Illustration */}
       <div className="relative mb-8">
         <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
           <Home className="w-16 h-16 text-muted-foreground/50" strokeWidth={1} />
         </div>
         {/* Decorative circles */}
         <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold/20" />
         <div className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-primary/10" />
       </div>
 
       <h3 className="font-serif text-2xl mb-3">No Properties Found</h3>
       
       <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
         We couldn't find any properties matching your criteria. 
         Try adjusting your filters or explore all available listings.
       </p>
 
       <Button
         onClick={onReset}
         className="rounded-full px-8 gap-2"
       >
         <RotateCcw className="w-4 h-4" />
         Reset Filters
       </Button>
     </div>
   );
 };
 
 export default EmptyState;