 import { cn } from '@/lib/utils';
 
 interface PageHeroProps {
   title: string;
   subtitle?: string;
   backgroundImage: string;
   className?: string;
 }
 
 const PageHero = ({ title, subtitle, backgroundImage, className }: PageHeroProps) => {
   return (
     <section className={cn("relative pt-32 pb-16 md:pt-36 md:pb-20", className)}>
       {/* Background Image */}
       <div className="absolute inset-0 z-0">
         <img
           src={backgroundImage}
           alt=""
           className="w-full h-full object-cover"
         />
         {/* Dark Gradient Overlay */}
         <div className="absolute inset-0 bg-black/50" />
       </div>
 
       {/* Content */}
       <div className="relative z-10 container-luxury text-center">
         <h1 className="mb-6 text-white animate-fade-in">
           {title}
         </h1>
         {subtitle && (
           <p className="text-xl text-white/80 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
             {subtitle}
           </p>
         )}
       </div>
     </section>
   );
 };
 
 export default PageHero;