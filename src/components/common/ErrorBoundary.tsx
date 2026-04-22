 import React, { Component, ErrorInfo, ReactNode } from 'react';
 import { AlertTriangle, RefreshCw } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 interface Props {
   children: ReactNode;
 }
 
 interface State {
   hasError: boolean;
   error: Error | null;
 }
 
 class ErrorBoundary extends Component<Props, State> {
   public state: State = {
     hasError: false,
     error: null,
   };
 
   public static getDerivedStateFromError(error: Error): State {
     return { hasError: true, error };
   }
 
   public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
     console.error('ErrorBoundary caught an error:', error, errorInfo);
   }
 
   private handleRefresh = () => {
     window.location.reload();
   };
 
   public render() {
     if (this.state.hasError) {
       return (
         <div className="min-h-screen flex items-center justify-center bg-background px-4">
           <div className="text-center max-w-md">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
               <AlertTriangle className="h-8 w-8 text-destructive" />
             </div>
             <h1 className="text-2xl font-bold text-foreground mb-2">
               Something went wrong
             </h1>
             <p className="text-muted-foreground mb-6">
               We're sorry, but something unexpected happened. Please refresh the page to try again.
             </p>
             <Button onClick={this.handleRefresh} size="lg">
               <RefreshCw className="mr-2 h-4 w-4" />
               Refresh Page
             </Button>
             {process.env.NODE_ENV === 'development' && this.state.error && (
               <div className="mt-6 p-4 bg-muted rounded-lg text-left">
                 <p className="text-sm font-mono text-destructive">
                   {this.state.error.message}
                 </p>
               </div>
             )}
           </div>
         </div>
       );
     }
 
     return this.props.children;
   }
 }
 
 export default ErrorBoundary;