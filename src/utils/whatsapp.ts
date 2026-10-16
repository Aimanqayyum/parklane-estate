export const WHATSAPP_NUMBER = '923333978181';

export const whatsappUrl = (message: string, phoneNumber = WHATSAPP_NUMBER): string =>
  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
