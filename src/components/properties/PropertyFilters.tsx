 import { useState, useEffect } from 'react';
 import { X, Search, ChevronDown, RotateCcw } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { supabase } from '@/utils/supabase';
 import { Slider } from '@/components/ui/slider';
 import { Button } from '@/components/ui/button';
 
 export interface PropertyFiltersState {
   locations: string[];
   propertyType: string;
   priceMin: string;
   priceMax: string;
   bedrooms: string;
   projectName: string;
 }
 
 interface PropertyFiltersProps {
   filters: PropertyFiltersState;
   onFilterChange: (filters: PropertyFiltersState) => void;
   isOpen: boolean;
   onClose: () => void;
 }
 
 const locationOptions = [
   'Clifton Block 5',
   'Clifton Block 8',
   'DHA Phase 1',
   'DHA Phase 2',
   'DHA Phase 4',
   'DHA Phase 5',
   'DHA Phase 6',
   'DHA Phase 7',
   'DHA Phase 8',
   'Saddar',
 ];
 
 const propertyTypeOptions = ['All', 'Apartment', 'Bungalow', 'Office', 'Shop', 'Plot'];
 const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];
 
 // Price range in Crore (10 million PKR)
 const PRICE_MIN = 0;
 const PRICE_MAX = 500000000; // 50 Crore
 const PRICE_STEP = 10000000; // 1 Crore
 
 const formatPriceLabel = (value: number) => {
   if (value >= 10000000) {
     return `${(value / 10000000).toFixed(1)} Cr`;
   }
   if (value >= 100000) {
     return `${(value / 100000).toFixed(0)} Lac`;
   }
   return '0';
 };
 
 const PropertyFilters = ({ filters, onFilterChange, isOpen, onClose }: PropertyFiltersProps) => {
   const [projects, setProjects] = useState<string[]>([]);
   const [projectSearch, setProjectSearch] = useState('');
   const [showProjectDropdown, setShowProjectDropdown] = useState(false);
 
   // Price slider state
   const priceRange = [
     filters.priceMin ? parseInt(filters.priceMin) : PRICE_MIN,
     filters.priceMax ? parseInt(filters.priceMax) : PRICE_MAX,
   ];
 
   // Fetch projects from database
   useEffect(() => {
     const fetchProjects = async () => {
       const { data } = await supabase
         .from('properties')
         .select('project_name')
         .not('project_name', 'is', null)
         .order('project_name');
 
       if (data) {
         const uniqueProjects = [...new Set(data.map((p) => p.project_name).filter(Boolean))] as string[];
         setProjects(uniqueProjects);
       }
     };
     fetchProjects();
   }, []);
 
   const handleLocationChange = (location: string) => {
     const newLocations = filters.locations.includes(location)
       ? filters.locations.filter((l) => l !== location)
       : [...filters.locations, location];
     onFilterChange({ ...filters, locations: newLocations });
   };
 
   const handlePriceChange = (values: number[]) => {
     onFilterChange({
       ...filters,
       priceMin: values[0] > PRICE_MIN ? values[0].toString() : '',
       priceMax: values[1] < PRICE_MAX ? values[1].toString() : '',
     });
   };
 
   const handleClearAll = () => {
     onFilterChange({
       locations: [],
       propertyType: 'All',
       priceMin: '',
       priceMax: '',
       bedrooms: 'Any',
       projectName: 'Any',
     });
   };
 
   const hasActiveFilters =
     filters.locations.length > 0 ||
     filters.propertyType !== 'All' ||
     filters.priceMin ||
     filters.priceMax ||
     filters.bedrooms !== 'Any' ||
     filters.projectName !== 'Any';
 
   const filteredProjects = projects.filter((p) =>
     p.toLowerCase().includes(projectSearch.toLowerCase())
   );
 
   const FilterContent = () => (
     <div className="space-y-8">
       {/* Property Type Pills */}
       <div>
         <h4 className="text-sm font-medium text-foreground mb-3">Property Type</h4>
         <div className="flex flex-wrap gap-2">
           {propertyTypeOptions.map((type) => (
             <button
               key={type}
               onClick={() => onFilterChange({ ...filters, propertyType: type })}
               className={cn(
                 "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                 filters.propertyType === type
                   ? "bg-primary text-primary-foreground"
                   : "bg-muted text-muted-foreground hover:bg-muted/80"
               )}
             >
               {type}
             </button>
           ))}
         </div>
       </div>
 
       {/* Price Range Slider */}
       <div>
         <div className="flex items-center justify-between mb-3">
           <h4 className="text-sm font-medium text-foreground">Price Range</h4>
           <span className="text-xs text-muted-foreground">
             {formatPriceLabel(priceRange[0])} - {formatPriceLabel(priceRange[1])}
           </span>
         </div>
         <Slider
           value={priceRange}
           min={PRICE_MIN}
           max={PRICE_MAX}
           step={PRICE_STEP}
           onValueChange={handlePriceChange}
           className="py-4"
         />
         <div className="flex justify-between text-xs text-muted-foreground mt-1">
           <span>0</span>
           <span>50 Cr</span>
         </div>
       </div>
 
       {/* Bedrooms Pills */}
       <div>
         <h4 className="text-sm font-medium text-foreground mb-3">Bedrooms</h4>
         <div className="flex flex-wrap gap-2">
           {bedroomOptions.map((option) => (
             <button
               key={option}
               onClick={() => onFilterChange({ ...filters, bedrooms: option })}
               className={cn(
                 "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                 filters.bedrooms === option
                   ? "bg-primary text-primary-foreground"
                   : "bg-muted text-muted-foreground hover:bg-muted/80"
               )}
             >
               {option === 'Any' ? 'Any' : option === '5+' ? '5+' : option}
             </button>
           ))}
         </div>
       </div>
 
       {/* Project Searchable Dropdown */}
       <div>
         <h4 className="text-sm font-medium text-foreground mb-3">Project / Building</h4>
         <div className="relative">
           <button
             onClick={() => setShowProjectDropdown(!showProjectDropdown)}
             className="w-full px-4 py-3 rounded-xl border border-border bg-background text-left flex items-center justify-between hover:border-muted-foreground/30 transition-colors"
           >
             <span className={cn(
               "text-sm",
               filters.projectName === 'Any' ? "text-muted-foreground" : "text-foreground"
             )}>
               {filters.projectName === 'Any' ? 'All Projects' : filters.projectName}
             </span>
             <ChevronDown className={cn(
               "w-4 h-4 text-muted-foreground transition-transform",
               showProjectDropdown && "rotate-180"
             )} />
           </button>
 
           {showProjectDropdown && (
             <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
               {/* Search Input */}
               <div className="p-2 border-b border-border">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input
                     type="text"
                     placeholder="Search projects..."
                     value={projectSearch}
                     onChange={(e) => setProjectSearch(e.target.value)}
                     className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                   />
                 </div>
               </div>
 
               {/* Options */}
               <div className="max-h-48 overflow-y-auto">
                 <button
                   onClick={() => {
                     onFilterChange({ ...filters, projectName: 'Any' });
                     setShowProjectDropdown(false);
                     setProjectSearch('');
                   }}
                   className={cn(
                     "w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors",
                     filters.projectName === 'Any' && "bg-primary/10 text-primary font-medium"
                   )}
                 >
                   All Projects
                 </button>
                 {filteredProjects.map((project) => (
                   <button
                     key={project}
                     onClick={() => {
                       onFilterChange({ ...filters, projectName: project });
                       setShowProjectDropdown(false);
                       setProjectSearch('');
                     }}
                     className={cn(
                       "w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors",
                       filters.projectName === project && "bg-primary/10 text-primary font-medium"
                     )}
                   >
                     {project}
                   </button>
                 ))}
               </div>
             </div>
           )}
         </div>
       </div>
 
       {/* Location Multi-Select */}
       <div>
         <h4 className="text-sm font-medium text-foreground mb-3">Location</h4>
         <div className="flex flex-wrap gap-2">
           {locationOptions.map((location) => (
             <button
               key={location}
               onClick={() => handleLocationChange(location)}
               className={cn(
                 "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                 filters.locations.includes(location)
                   ? "bg-primary text-primary-foreground border-primary"
                   : "bg-background text-muted-foreground border-border hover:border-muted-foreground/50"
               )}
             >
               {location}
             </button>
           ))}
         </div>
       </div>
 
       {/* Clear All Button */}
       {hasActiveFilters && (
         <Button
           variant="ghost"
           onClick={handleClearAll}
           className="w-full gap-2 text-muted-foreground hover:text-foreground"
         >
           <RotateCcw className="w-4 h-4" />
           Clear All Filters
         </Button>
       )}
     </div>
   );
 
   return (
     <>
       {/* Desktop Sidebar */}
       <aside className="hidden lg:block w-72 flex-shrink-0">
         <div className="sticky top-28 bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-lg font-serif font-medium text-foreground mb-6">
             Refine Search
           </h3>
           <FilterContent />
         </div>
       </aside>
 
       {/* Mobile Bottom Sheet Overlay */}
       <div
         className={cn(
           "fixed inset-0 bg-foreground/50 z-40 lg:hidden transition-opacity duration-300",
           isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
         )}
         onClick={onClose}
       />
 
       {/* Mobile Bottom Sheet */}
       <aside
         className={cn(
           "fixed bottom-0 left-0 right-0 bg-card z-50 lg:hidden rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[85vh] overflow-hidden",
           isOpen ? "translate-y-0" : "translate-y-full"
         )}
       >
         {/* Handle */}
         <div className="flex justify-center pt-3 pb-2">
           <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
         </div>
 
         {/* Header */}
         <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
           <h3 className="text-lg font-serif font-medium text-foreground">
             Filters
           </h3>
           <button
             onClick={onClose}
             className="p-2 hover:bg-muted rounded-full transition-colors"
           >
             <X size={20} />
           </button>
         </div>
 
         {/* Content */}
         <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
           <FilterContent />
         </div>
 
         {/* Footer */}
         <div className="p-4 border-t border-border bg-card">
           <Button onClick={onClose} className="w-full rounded-xl h-12">
             Show Results
           </Button>
         </div>
       </aside>
     </>
   );
 };
 
 export default PropertyFilters;