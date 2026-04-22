 import { MessageCircle } from 'lucide-react';
 
 interface WhatsAppButtonProps {
   phoneNumber?: string;
   message?: string;
 }
 
 const WhatsAppButton = ({
   phoneNumber = '923333978181',
   message = "Hi, I'm interested in Park Lane Estate properties.",
 }: WhatsAppButtonProps) => {
   const encodedMessage = encodeURIComponent(message);
   const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
 
   return (
     <a
       href={whatsappUrl}
       target="_blank"
       rel="noopener noreferrer"
       className="fixed bottom-5 right-5 z-[1000] flex items-center justify-center 
                  w-14 h-14 md:w-[60px] md:h-[60px] rounded-full 
                  bg-[#25D366] text-neutral-white shadow-lg
                  hover:scale-110 hover:shadow-xl
                  transition-all duration-300 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
       aria-label="Chat on WhatsApp"
     >
       <MessageCircle size={28} fill="currentColor" strokeWidth={0} />
     </a>
   );
 };
 
 export default WhatsAppButton;