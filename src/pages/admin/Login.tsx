 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { supabase } from '@/utils/supabase';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Loader2, AlertCircle } from 'lucide-react';
 import { z } from 'zod';
 
 const loginSchema = z.object({
   email: z.string().email('Please enter a valid email address'),
   password: z.string().min(8, 'Password must be at least 8 characters'),
 });
 
 const Login = () => {
   const navigate = useNavigate();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [rememberMe, setRememberMe] = useState(false);
   const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
   const [isLoading, setIsLoading] = useState(false);
   const [authError, setAuthError] = useState<string | null>(null);
   const [isResetMode, setIsResetMode] = useState(false);
   const [resetSent, setResetSent] = useState(false);
 
   useEffect(() => {
     // Check if already logged in
     const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session) {
         navigate('/admin/dashboard');
       }
     };
     checkSession();
   }, [navigate]);
 
   const validateForm = () => {
     try {
       loginSchema.parse({ email, password });
       setErrors({});
       return true;
     } catch (error) {
       if (error instanceof z.ZodError) {
         const fieldErrors: { email?: string; password?: string } = {};
         error.errors.forEach((err) => {
           if (err.path[0] === 'email') fieldErrors.email = err.message;
           if (err.path[0] === 'password') fieldErrors.password = err.message;
         });
         setErrors(fieldErrors);
       }
       return false;
     }
   };
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setAuthError(null);
 
     if (!validateForm()) return;
 
     setIsLoading(true);
 
     try {
       const { data, error } = await supabase.auth.signInWithPassword({
         email: email.trim(),
         password,
       });
 
       if (error) {
         if (error.message.includes('Invalid login credentials')) {
           setAuthError('Invalid email or password');
         } else if (error.message.includes('Email not confirmed')) {
           setAuthError('Please verify your email address before logging in');
         } else {
           setAuthError(error.message);
         }
         return;
       }
 
       if (data.session) {
         navigate('/admin/dashboard');
       }
     } catch (err) {
       setAuthError('An unexpected error occurred. Please try again.');
     } finally {
       setIsLoading(false);
     }
   };
 
   const handlePasswordReset = async (e: React.FormEvent) => {
     e.preventDefault();
     setAuthError(null);
 
     if (!email.trim()) {
       setErrors({ email: 'Please enter your email address' });
       return;
     }
 
     try {
       z.string().email().parse(email);
     } catch {
       setErrors({ email: 'Please enter a valid email address' });
       return;
     }
 
     setIsLoading(true);
 
     try {
       const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
         redirectTo: `${window.location.origin}/admin/login`,
       });
 
       if (error) {
         setAuthError(error.message);
         return;
       }
 
       setResetSent(true);
     } catch (err) {
       setAuthError('An unexpected error occurred. Please try again.');
     } finally {
       setIsLoading(false);
     }
   };
 
   if (resetSent) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
         <Card className="w-full max-w-md">
           <CardHeader className="text-center">
             <CardTitle className="text-2xl">Check Your Email</CardTitle>
             <CardDescription>
               We've sent a password reset link to {email}
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Button
               variant="outline"
               className="w-full"
               onClick={() => {
                 setResetSent(false);
                 setIsResetMode(false);
               }}
             >
               Back to Login
             </Button>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
       <Card className="w-full max-w-md">
         <CardHeader className="text-center">
           <div className="mx-auto mb-4">
             <h1 className="text-2xl font-bold text-primary">Park Lane Estate</h1>
           </div>
           <CardTitle className="text-xl">
             {isResetMode ? 'Reset Password' : 'Admin Login'}
           </CardTitle>
           <CardDescription>
             {isResetMode
               ? 'Enter your email to receive a reset link'
               : 'Sign in to access the admin panel'}
           </CardDescription>
         </CardHeader>
         <CardContent>
           {authError && (
             <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
               <AlertCircle className="h-4 w-4 flex-shrink-0" />
               <p>{authError}</p>
             </div>
           )}
 
           <form onSubmit={isResetMode ? handlePasswordReset : handleLogin} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="admin@example.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className={errors.email ? 'border-destructive' : ''}
               />
               {errors.email && (
                 <p className="text-sm text-destructive">{errors.email}</p>
               )}
             </div>
 
             {!isResetMode && (
               <>
                 <div className="space-y-2">
                   <Label htmlFor="password">Password</Label>
                   <Input
                     id="password"
                     type="password"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className={errors.password ? 'border-destructive' : ''}
                   />
                   {errors.password && (
                     <p className="text-sm text-destructive">{errors.password}</p>
                   )}
                 </div>
 
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <Checkbox
                       id="remember"
                       checked={rememberMe}
                       onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                     />
                     <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                       Remember me
                     </Label>
                   </div>
                   <button
                     type="button"
                     onClick={() => setIsResetMode(true)}
                     className="text-sm text-primary hover:underline"
                   >
                     Forgot Password?
                   </button>
                 </div>
               </>
             )}
 
             <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   {isResetMode ? 'Sending...' : 'Signing in...'}
                 </>
               ) : isResetMode ? (
                 'Send Reset Link'
               ) : (
                 'Sign In'
               )}
             </Button>
 
             {isResetMode && (
               <Button
                 type="button"
                 variant="outline"
                 className="w-full"
                 onClick={() => setIsResetMode(false)}
               >
                 Back to Login
               </Button>
             )}
           </form>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default Login;