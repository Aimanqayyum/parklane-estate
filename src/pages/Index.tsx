import SupabaseTest from '@/components/SupabaseTest';
 
 const Index = () => {
  return (
    <div className="section-padding">
      <div className="container-luxury">
        <div className="text-center mb-12">
          <h1 className="mb-4">Welcome to Park Lane Estate</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            35+ years of excellence in Karachi's premium real estate. 
            Discover luxury properties in Clifton and DHA.
          </p>
        </div>
        
        {/* Supabase Connection Test */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Database Connection Test</h2>
          <SupabaseTest />
        </div>
      </div>
    </div>
  );
 };
 
 export default Index;
