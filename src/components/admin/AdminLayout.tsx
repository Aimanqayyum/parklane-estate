 import { useState, useEffect } from 'react';
 import { Outlet, NavLink, useNavigate } from 'react-router-dom';
 import { supabase } from '@/utils/supabase';
 import { User } from '@supabase/supabase-js';
 import {
   LayoutDashboard,
   Building2,
   MessageSquare,
   LogOut,
   Menu,
   X,
   ChevronRight,
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { cn } from '@/lib/utils';
 
 const AdminLayout = () => {
   const navigate = useNavigate();
   const [user, setUser] = useState<User | null>(null);
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         setUser(session?.user ?? null);
       }
     );
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       setUser(session?.user ?? null);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     navigate('/admin/login');
   };
 
   const navItems = [
     { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
     { to: '/admin/properties', icon: Building2, label: 'Properties' },
     { to: '/admin/submissions', icon: MessageSquare, label: 'Inquiries' },
   ];
 
   return (
     <div className="min-h-screen bg-muted/30">
       {/* Mobile Header */}
       <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b h-16 flex items-center justify-between px-4">
         <div className="flex items-center gap-3">
           <button
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 hover:bg-muted rounded-lg"
           >
             {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
           <span className="font-semibold text-primary">Admin Panel</span>
         </div>
         <Button variant="ghost" size="sm" onClick={handleLogout}>
           <LogOut className="h-4 w-4" />
         </Button>
       </header>
 
       {/* Sidebar */}
       <aside
         className={cn(
           'fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r transition-transform duration-300',
           'lg:translate-x-0',
           isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
         )}
       >
         <div className="flex flex-col h-full">
           {/* Logo */}
           <div className="h-16 flex items-center px-6 border-b">
             <h1 className="text-xl font-bold text-primary">Park Lane Estate</h1>
           </div>
 
           {/* Navigation */}
           <nav className="flex-1 py-4 px-3 space-y-1">
             {navItems.map((item) => (
               <NavLink
                 key={item.to}
                 to={item.to}
                 onClick={() => setIsSidebarOpen(false)}
                 className={({ isActive }) =>
                   cn(
                     'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                     isActive
                       ? 'bg-primary text-primary-foreground'
                       : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                   )
                 }
               >
                 <item.icon className="h-5 w-5" />
                 <span>{item.label}</span>
                 <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
               </NavLink>
             ))}
           </nav>
 
           {/* User Info & Logout */}
           <div className="border-t p-4">
             <div className="mb-3 px-2">
               <p className="text-sm font-medium truncate">{user?.email}</p>
               <p className="text-xs text-muted-foreground">Administrator</p>
             </div>
             <Button
               variant="outline"
               className="w-full justify-start"
               onClick={handleLogout}
             >
               <LogOut className="h-4 w-4 mr-2" />
               Logout
             </Button>
           </div>
         </div>
       </aside>
 
       {/* Overlay for mobile */}
       {isSidebarOpen && (
         <div
           className="fixed inset-0 bg-black/50 z-30 lg:hidden"
           onClick={() => setIsSidebarOpen(false)}
         />
       )}
 
       {/* Main Content */}
       <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
         <div className="p-6">
           <Outlet />
         </div>
       </main>
     </div>
   );
 };
 
 export default AdminLayout;