 import { Helmet } from 'react-helmet-async';
 
 interface SEOProps {
   title?: string;
   description?: string;
   image?: string;
   url?: string;
   type?: string;
 }
 
 const SEO = ({
   title = 'Park Lane Estate',
   description = 'Discover luxury properties in Karachi with Park Lane Estate. 35+ years of excellence in premium real estate - apartments, bungalows, offices in DHA, Clifton, and more.',
   image = '/og-image.jpg',
   url = '',
   type = 'website',
 }: SEOProps) => {
   const fullTitle = title === 'Park Lane Estate' ? title : `${title} | Park Lane Estate`;
 
   return (
     <Helmet>
       {/* Basic Meta Tags */}
       <title>{fullTitle}</title>
       <meta name="description" content={description} />
 
       {/* Open Graph */}
       <meta property="og:title" content={fullTitle} />
       <meta property="og:description" content={description} />
       <meta property="og:image" content={image} />
       <meta property="og:url" content={url} />
       <meta property="og:type" content={type} />
       <meta property="og:site_name" content="Park Lane Estate" />
 
       {/* Twitter Card */}
       <meta name="twitter:card" content="summary_large_image" />
       <meta name="twitter:title" content={fullTitle} />
       <meta name="twitter:description" content={description} />
       <meta name="twitter:image" content={image} />
 
       {/* Additional SEO */}
       <meta name="robots" content="index, follow" />
       <link rel="canonical" href={url} />
     </Helmet>
   );
 };
 
 export default SEO;