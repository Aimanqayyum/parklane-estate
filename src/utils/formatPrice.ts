 /**
  * Format price in Pakistani Rupees (PKR)
  * - >= 1 Crore (10 million): "PKR X.XX Crore"
  * - >= 1 Lac (100,000): "PKR XX.XX Lac"
  * - Below: "PKR X,XXX"
  */
 export const formatPrice = (price: number): string => {
   if (price >= 10000000) {
     // 1 Crore = 10 million
     const crore = price / 10000000;
     return `PKR ${crore.toFixed(2)} Crore`;
   } else if (price >= 100000) {
     // 1 Lac = 100,000
     const lac = price / 100000;
     return `PKR ${lac.toFixed(2)} Lac`;
   }
   return `PKR ${price.toLocaleString()}`;
 };
 
 /**
  * Format area in square feet with comma separation
  */
 export const formatArea = (sqft: number): string => {
   return `${sqft.toLocaleString()} sq.ft`;
 };