 import { Loader2 } from 'lucide-react';
 
 interface LoadingSpinnerProps {
   size?: number;
   showText?: boolean;
   text?: string;
   className?: string;
 }
 
 const LoadingSpinner = ({
   size = 48,
   showText = true,
   text = 'Loading...',
   className = '',
 }: LoadingSpinnerProps) => {
   return (
     <div className={`flex flex-col items-center justify-center ${className}`}>
       <Loader2
         size={size}
         className="animate-spin text-primary"
       />
       {showText && (
         <p className="mt-4 text-muted-foreground text-sm">{text}</p>
       )}
     </div>
   );
 };
 
 export default LoadingSpinner;