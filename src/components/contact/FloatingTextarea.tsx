 import { useState, forwardRef } from 'react';
 import { cn } from '@/lib/utils';
 
 interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
   label: string;
   error?: string;
 }
 
 const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
   ({ label, error, className, ...props }, ref) => {
     const [isFocused, setIsFocused] = useState(false);
     const hasValue = props.value && String(props.value).length > 0;
 
     return (
       <div className="relative">
         <textarea
           ref={ref}
           {...props}
           className={cn(
             "peer w-full px-4 pt-6 pb-2 rounded-xl border bg-background text-foreground min-h-[140px] resize-none",
             "transition-all duration-300 ease-out",
             "placeholder-transparent",
             "focus:outline-none focus:ring-0",
             isFocused
               ? "border-gold shadow-[0_0_0_3px_hsl(var(--gold)/0.15)]"
               : "border-border hover:border-muted-foreground/30",
             error && "border-destructive focus:border-destructive shadow-[0_0_0_3px_hsl(var(--destructive)/0.15)]",
             className
           )}
           placeholder={label}
           onFocus={(e) => {
             setIsFocused(true);
             props.onFocus?.(e);
           }}
           onBlur={(e) => {
             setIsFocused(false);
             props.onBlur?.(e);
           }}
         />
         <label
           className={cn(
             "absolute left-4 transition-all duration-200 ease-out pointer-events-none",
             "text-muted-foreground",
             (isFocused || hasValue)
               ? "top-2 text-xs font-medium"
               : "top-4 text-sm",
             isFocused && "text-gold",
             error && "text-destructive"
           )}
         >
           {label}
         </label>
         {error && (
           <p className="mt-1.5 text-xs text-destructive">{error}</p>
         )}
       </div>
     );
   }
 );
 
 FloatingTextarea.displayName = 'FloatingTextarea';
 
 export default FloatingTextarea;