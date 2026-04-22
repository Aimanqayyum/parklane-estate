 import { useState, useEffect } from 'react';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 import { supabase } from '@/utils/supabase';
 import { Button } from '@/components/ui/button';
 import { Loader2, AlertCircle, MessageCircle } from 'lucide-react';
 import FloatingInput from './FloatingInput';
 import FloatingTextarea from './FloatingTextarea';
 import FloatingSelect from './FloatingSelect';
 import SuccessCard from './SuccessCard';
 
 // Zod schema for validation
 const contactSchema = z.object({
   name: z
     .string()
     .min(1, 'Name is required')
     .min(2, 'Name must be at least 2 characters')
     .max(100, 'Name must be less than 100 characters'),
   phone: z
     .string()
     .min(1, 'Phone number is required')
     .regex(
       /^\+92\s?\d{3}\s?\d{7}$/,
       'Please enter a valid Pakistani phone number (+92 3XX XXXXXXX)'
     ),
   email: z
     .string()
     .min(1, 'Email is required')
     .email('Please enter a valid email address')
     .max(255, 'Email must be less than 255 characters'),
   inquiry: z.string().optional(),
   message: z
     .string()
     .min(1, 'Message is required')
     .min(10, 'Message must be at least 10 characters')
     .max(2000, 'Message must be less than 2000 characters'),
 });
 
 type ContactFormData = z.infer<typeof contactSchema>;
 
 interface Property {
   id: string;
   title: string;
 }
 
 const INQUIRY_OPTIONS = [
   { value: 'general', label: 'General Inquiry' },
   { value: 'buying', label: 'Buying Property' },
   { value: 'selling', label: 'Selling Property' },
   { value: 'creek-vista', label: 'Creek Vista' },
   { value: 'emaar-oceanfront', label: 'Emaar Oceanfront' },
   { value: 'dha-phase8', label: 'DHA Phase 8' },
   { value: 'bahria-town', label: 'Bahria Town' },
 ];
 
 // Format phone number as user types
 const formatPhoneNumber = (value: string): string => {
   // Remove all non-digits except +
   let cleaned = value.replace(/[^\d+]/g, '');
   
   // Ensure it starts with +92
   if (!cleaned.startsWith('+')) {
     if (cleaned.startsWith('92')) {
       cleaned = '+' + cleaned;
     } else if (cleaned.startsWith('0')) {
       cleaned = '+92' + cleaned.slice(1);
     } else if (cleaned.length > 0 && !cleaned.startsWith('+92')) {
       cleaned = '+92' + cleaned;
     }
   }
   
   // Format: +92 3XX XXXXXXX
   if (cleaned.length > 3) {
     const prefix = cleaned.slice(0, 3);
     const rest = cleaned.slice(3);
     if (rest.length > 3) {
       return `${prefix} ${rest.slice(0, 3)} ${rest.slice(3, 10)}`;
     }
     return `${prefix} ${rest}`;
   }
   
   return cleaned;
 };
 
 const ContactForm = () => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);
   const [isSuccess, setIsSuccess] = useState(false);
   const [properties, setProperties] = useState<Property[]>([]);
 
   const {
     register,
     handleSubmit,
     watch,
     setValue,
     reset,
     formState: { errors },
   } = useForm<ContactFormData>({
     resolver: zodResolver(contactSchema),
     defaultValues: {
       name: '',
       phone: '',
       email: '',
       inquiry: '',
       message: '',
     },
   });
 
   const watchedValues = watch();
 
   useEffect(() => {
     const fetchProperties = async () => {
       const { data } = await supabase
         .from('properties')
         .select('id, title')
         .eq('status', 'Available')
         .order('title');
 
       if (data) {
         setProperties(data);
       }
     };
     fetchProperties();
   }, []);
 
   // Phone auto-formatting
   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const formatted = formatPhoneNumber(e.target.value);
     setValue('phone', formatted, { shouldValidate: true });
   };
 
   const onSubmit = async (data: ContactFormData) => {
     setIsSubmitting(true);
     setSubmitError(null);
 
     try {
       const { error } = await supabase.from('contact_submissions').insert({
         name: data.name.trim(),
         phone: data.phone.trim(),
         email: data.email.trim(),
         property_interest: data.inquiry || 'General Inquiry',
         message: data.message.trim(),
       });
 
       if (error) throw error;
 
       setIsSuccess(true);
     } catch (error) {
       console.error('Form submission error:', error);
       setSubmitError('Submission failed. Please try again.');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handleReset = () => {
     reset();
     setIsSuccess(false);
     setSubmitError(null);
   };
 
   // Merge dynamic properties with static options
   const allInquiryOptions = [
     ...INQUIRY_OPTIONS,
     ...properties
       .filter((p) => !INQUIRY_OPTIONS.some((o) => o.label === p.title))
       .map((p) => ({ value: p.id, label: p.title })),
   ];
 
   // Show success card
   if (isSuccess) {
     return <SuccessCard onReset={handleReset} />;
   }
 
   return (
     <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
       {submitError && (
         <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
           <AlertCircle className="h-5 w-5 flex-shrink-0" />
           <p className="text-sm">{submitError}</p>
         </div>
       )}
 
       <FloatingInput
         label="Full Name *"
         type="text"
         {...register('name')}
         value={watchedValues.name}
         error={errors.name?.message}
       />
 
       <FloatingInput
         label="Phone Number *"
         type="tel"
         {...register('phone')}
         value={watchedValues.phone}
         onChange={handlePhoneChange}
         error={errors.phone?.message}
       />
 
       <FloatingInput
         label="Email Address *"
         type="email"
         {...register('email')}
         value={watchedValues.email}
         error={errors.email?.message}
       />
 
       <FloatingSelect
         label="Property Interest"
         value={watchedValues.inquiry || ''}
         onChange={(value) => setValue('inquiry', value)}
         options={allInquiryOptions}
       />
 
       <FloatingTextarea
         label="Your Message *"
         {...register('message')}
         value={watchedValues.message}
         error={errors.message?.message}
       />
 
       <p className="text-xs text-muted-foreground text-right">
         {watchedValues.message?.length || 0}/2000 characters
       </p>
 
       <Button
         type="submit"
         size="lg"
         className="w-full rounded-xl h-14 text-base font-medium active:scale-[0.98] transition-transform"
         disabled={isSubmitting}
       >
         {isSubmitting ? (
           <>
             <Loader2 className="mr-2 h-5 w-5 animate-spin" />
             Sending...
           </>
         ) : (
           'Send Message'
         )}
       </Button>
 
       {/* Divider */}
       <div className="relative py-4">
         <div className="absolute inset-0 flex items-center">
           <div className="w-full border-t border-border" />
         </div>
         <div className="relative flex justify-center text-xs uppercase">
           <span className="bg-card px-4 text-muted-foreground">or</span>
         </div>
       </div>
 
       {/* WhatsApp CTA */}
       <a
         href="https://wa.me/923333978181?text=Hi%2C%20I%27m%20interested%20in%20Park%20Lane%20Estate%20properties."
         target="_blank"
         rel="noopener noreferrer"
         className="flex items-center justify-center gap-3 w-full h-14 rounded-xl
                    bg-green-600 hover:bg-green-700 text-white font-medium text-base
                    active:scale-[0.98] transition-all duration-200"
       >
         <MessageCircle className="h-5 w-5" fill="currentColor" strokeWidth={0} />
         Chat on WhatsApp Now
       </a>
     </form>
   );
 };
 
 export default ContactForm;
