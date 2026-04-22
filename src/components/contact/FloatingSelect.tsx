 import { useState } from 'react';
 import { cn } from '@/lib/utils';
 import { ChevronDown } from 'lucide-react';
 
 interface Option {
   value: string;
   label: string;
 }
 
 interface FloatingSelectProps {
   label: string;
   value: string;
   onChange: (value: string) => void;
   options: Option[];
   error?: string;
   className?: string;
 }
 
 const FloatingSelect = ({
   label,
   value,
   onChange,
   options,
   error,
   className,
 }: FloatingSelectProps) => {
   const [isFocused, setIsFocused] = useState(false);
   const hasValue = value && value.length > 0;
 
   return (
     <div className="relative">
       <select
         value={value}
         onChange={(e) => onChange(e.target.value)}
         onFocus={() => setIsFocused(true)}
         onBlur={() => setIsFocused(false)}
         className={cn(
           "peer w-full px-4 pt-6 pb-2 pr-10 rounded-xl border bg-background text-foreground appearance-none cursor-pointer",
           "transition-all duration-300 ease-out",
           "focus:outline-none focus:ring-0",
           isFocused
             ? "border-gold shadow-[0_0_0_3px_hsl(var(--gold)/0.15)]"
             : "border-border hover:border-muted-foreground/30",
           error && "border-destructive focus:border-destructive shadow-[0_0_0_3px_hsl(var(--destructive)/0.15)]",
           !hasValue && "text-muted-foreground",
           className
         )}
       >
         <option value="" disabled>Select an option</option>
         {options.map((option) => (
           <option key={option.value} value={option.value}>
             {option.label}
           </option>
         ))}
       </select>
       <label
         className={cn(
           "absolute left-4 transition-all duration-200 ease-out pointer-events-none",
           "text-muted-foreground",
            "top-2 text-xs font-medium",
           isFocused && "text-gold",
           error && "text-destructive"
         )}
       >
         {label}
       </label>
       <ChevronDown 
         className={cn(
           "absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors",
           isFocused ? "text-gold" : "text-muted-foreground"
         )} 
       />
       {error && (
         <p className="mt-1.5 text-xs text-destructive">{error}</p>
       )}
     </div>
   );
 };
 
 export default FloatingSelect;