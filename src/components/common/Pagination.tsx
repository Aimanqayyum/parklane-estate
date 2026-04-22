 import { ChevronLeft, ChevronRight } from 'lucide-react';
 
 interface PaginationProps {
   currentPage: number;
   totalPages: number;
   onPageChange: (page: number) => void;
 }
 
 const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
   if (totalPages <= 1) return null;
 
   const getPageNumbers = () => {
     const pages: (number | string)[] = [];
 
     if (totalPages <= 5) {
       // Show all pages
       for (let i = 1; i <= totalPages; i++) {
         pages.push(i);
       }
     } else if (currentPage <= 3) {
       // Near start
       pages.push(1, 2, 3, 4, 5, '...', totalPages);
     } else if (currentPage >= totalPages - 2) {
       // Near end
       pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
     } else {
       // Middle
       pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
     }
 
     return pages;
   };
 
   const pageNumbers = getPageNumbers();
 
   return (
     <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
       {/* Previous Button */}
       <button
         onClick={() => onPageChange(currentPage - 1)}
         disabled={currentPage === 1}
         className="flex items-center justify-center w-10 h-10 rounded-md border border-border 
                    hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         aria-label="Previous page"
       >
         <ChevronLeft size={18} />
       </button>
 
       {/* Page Numbers - Hidden on mobile */}
       <div className="hidden sm:flex items-center gap-1">
         {pageNumbers.map((page, index) =>
           page === '...' ? (
             <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground">
               ...
             </span>
           ) : (
             <button
               key={page}
               onClick={() => onPageChange(page as number)}
               className={`w-10 h-10 rounded-md font-medium transition-colors ${
                 currentPage === page
                   ? 'bg-primary text-primary-foreground'
                   : 'border border-border hover:bg-muted'
               }`}
               aria-current={currentPage === page ? 'page' : undefined}
             >
               {page}
             </button>
           )
         )}
       </div>
 
       {/* Mobile: Current Page Display */}
       <span className="sm:hidden px-4 py-2 text-sm text-muted-foreground">
         Page {currentPage} of {totalPages}
       </span>
 
       {/* Next Button */}
       <button
         onClick={() => onPageChange(currentPage + 1)}
         disabled={currentPage === totalPages}
         className="flex items-center justify-center w-10 h-10 rounded-md border border-border 
                    hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         aria-label="Next page"
       >
         <ChevronRight size={18} />
       </button>
     </nav>
   );
 };
 
 export default Pagination;