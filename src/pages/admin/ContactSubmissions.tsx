 import { useState, useEffect } from 'react';
 import { Link } from 'react-router-dom';
 import { supabase } from '@/utils/supabase';
 import { Button } from '@/components/ui/button';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from '@/components/ui/alert-dialog';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from '@/components/ui/dialog';
 import { Card, CardContent } from '@/components/ui/card';
 import { Trash2, Phone, Mail, MessageSquare, ExternalLink } from 'lucide-react';
 import LoadingSpinner from '@/components/common/LoadingSpinner';
 import Pagination from '@/components/common/Pagination';
 import { toast } from '@/hooks/use-toast';
 
 interface ContactSubmission {
   id: string;
   name: string;
   phone: string;
   email: string;
   property_id: string | null;
   property_interest: string | null;
   message: string;
   submitted_at: string;
   property?: {
     title: string;
     slug: string;
   };
 }
 
 const ITEMS_PER_PAGE = 20;
 
 const ContactSubmissions = () => {
   const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
 
   const fetchSubmissions = async () => {
     try {
       const { data, error } = await supabase
         .from('contact_submissions')
         .select(`
           *,
           property:properties(title, slug)
         `)
         .order('submitted_at', { ascending: false });
 
       if (error) throw error;
       setSubmissions(data || []);
     } catch (error) {
       console.error('Error fetching submissions:', error);
       toast({
         title: 'Error',
         description: 'Failed to load contact submissions',
         variant: 'destructive',
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   useEffect(() => {
     fetchSubmissions();
   }, []);
 
   const handleDelete = async (id: string) => {
     try {
       const { error } = await supabase
         .from('contact_submissions')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
 
       setSubmissions((prev) => prev.filter((s) => s.id !== id));
 
       toast({
         title: 'Success',
         description: 'Submission deleted successfully',
       });
     } catch (error) {
       console.error('Error deleting submission:', error);
       toast({
         title: 'Error',
         description: 'Failed to delete submission',
         variant: 'destructive',
       });
     }
   };
 
   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString('en-US', {
       month: 'short',
       day: 'numeric',
       year: 'numeric',
       hour: '2-digit',
       minute: '2-digit',
     });
   };
 
   const truncateMessage = (message: string, maxLength: number = 100) => {
     if (message.length <= maxLength) return message;
     return message.substring(0, maxLength) + '...';
   };
 
   const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);
   const paginatedSubmissions = submissions.slice(
     (currentPage - 1) * ITEMS_PER_PAGE,
     currentPage * ITEMS_PER_PAGE
   );
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <LoadingSpinner text="Loading submissions..." />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div>
         <h1 className="text-3xl font-bold text-foreground">Contact Inquiries</h1>
         <p className="text-muted-foreground">
           View and manage contact form submissions ({submissions.length} total)
         </p>
       </div>
 
       {/* Submissions Table */}
       {paginatedSubmissions.length === 0 ? (
         <Card>
           <CardContent className="py-12 text-center">
             <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
             <p className="text-muted-foreground">No inquiries yet.</p>
           </CardContent>
         </Card>
       ) : (
         <Card>
           <CardContent className="p-0">
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Date</TableHead>
                     <TableHead>Name</TableHead>
                     <TableHead>Phone</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Property Interest</TableHead>
                     <TableHead>Message</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {paginatedSubmissions.map((submission) => (
                     <TableRow key={submission.id}>
                       <TableCell className="whitespace-nowrap">
                         {formatDate(submission.submitted_at)}
                       </TableCell>
                       <TableCell className="font-medium">{submission.name}</TableCell>
                       <TableCell>
                         <a
                           href={`tel:${submission.phone.replace(/\s/g, '')}`}
                           className="flex items-center gap-1 text-primary hover:underline"
                         >
                           <Phone className="h-3 w-3" />
                           {submission.phone}
                         </a>
                       </TableCell>
                       <TableCell>
                         <a
                           href={`mailto:${submission.email}`}
                           className="flex items-center gap-1 text-primary hover:underline"
                         >
                           <Mail className="h-3 w-3" />
                           {submission.email}
                         </a>
                       </TableCell>
                       <TableCell>
                         {submission.property ? (
                           <Link
                             to={`/properties/${submission.property.slug}`}
                             target="_blank"
                             className="flex items-center gap-1 text-primary hover:underline"
                           >
                             {submission.property.title}
                             <ExternalLink className="h-3 w-3" />
                           </Link>
                         ) : (
                           <span className="text-muted-foreground">
                             {submission.property_interest || 'General Inquiry'}
                           </span>
                         )}
                       </TableCell>
                       <TableCell className="max-w-xs">
                         {submission.message.length > 100 ? (
                           <Dialog>
                             <DialogTrigger asChild>
                               <button className="text-left hover:text-primary">
                                 {truncateMessage(submission.message)}
                                 <span className="text-primary ml-1">Read more</span>
                               </button>
                             </DialogTrigger>
                             <DialogContent>
                               <DialogHeader>
                                 <DialogTitle>Message from {submission.name}</DialogTitle>
                               </DialogHeader>
                               <div className="mt-4 whitespace-pre-wrap">
                                 {submission.message}
                               </div>
                             </DialogContent>
                           </Dialog>
                         ) : (
                           submission.message
                         )}
                       </TableCell>
                       <TableCell className="text-right">
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="text-destructive hover:text-destructive"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Are you sure you want to delete this submission from{' '}
                                 {submission.name}? This action cannot be undone.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => handleDelete(submission.id)}
                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                               >
                                 Delete
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Pagination */}
       {totalPages > 1 && (
         <div className="flex justify-center">
           <Pagination
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
           />
         </div>
       )}
     </div>
   );
 };
 
 export default ContactSubmissions;