 /**
  * Generate SEO-friendly slug from a title
  * Example: "3 Bedroom Luxury Apartment in Creek Vista" 
  * becomes "3-bedroom-luxury-apartment-in-creek-vista"
  */
 export function generateSlug(title: string): string {
   return title
     .toLowerCase()
     .trim()
     .replace(/[^a-z0-9\s-]/g, '')
     .replace(/\s+/g, '-')
     .replace(/-+/g, '-')
     .substring(0, 100);
 }