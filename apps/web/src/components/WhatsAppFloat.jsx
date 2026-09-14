import { MessageCircle } from 'lucide-react';
import { waLink } from '@/data/site';

const WhatsAppFloat = () => (
  <a
    href={waLink()}
    target="_blank"
    rel="noreferrer"
    aria-label="Contacter sur WhatsApp"
    className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3.5 shadow-lg shadow-black/40 hover:brightness-105 active:scale-95 transition"
  >
    <MessageCircle size={22} />
    <span className="hidden sm:inline text-sm font-semibold pr-1">WhatsApp</span>
  </a>
);

export default WhatsAppFloat;
