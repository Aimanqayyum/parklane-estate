 import HeroSection from '@/components/home/HeroSection';
 import FeaturedProperties from '@/components/home/FeaturedProperties';
 import WhyChooseUs from '@/components/home/WhyChooseUs';
 import TestimonialsSection from '@/components/home/TestimonialsSection';
import SEO from '@/components/common/SEO';
 
 const Home = () => {
   return (
     <div className="scroll-smooth">
      <SEO
        title="Park Lane Estate"
        description="Discover luxury properties in Karachi with Park Lane Estate. 35+ years of excellence in premium real estate - apartments, bungalows, offices in DHA, Clifton, and more."
      />
       <HeroSection />
       <FeaturedProperties />
       <WhyChooseUs />
       <TestimonialsSection />
     </div>
   );
 };
 
 export default Home;