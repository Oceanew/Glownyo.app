import { MessageCircle, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import { EMAIL, waLink, IMAGES } from '@/data/site';
const ContactPage = () => {
  return <div className="pt-28 pb-24">
      <section className="relative overflow-hidden">
        <img src={IMAGES.salon} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 to-[#0A0A0A]" />
        <div className="relative mx-auto max-w-[72rem] px-5 sm:px-8 py-20 text-center">
          <span className="text-xs tracking-widest uppercase text-gold">Contact</span>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight">
            Parlons de votre <span className="text-gold-gradient italic">éclat</span>
          </h1>
          <p className="mt-5 text-[#F5F0E6]/70 text-lg max-w-xl mx-auto">
            Une question, un partenariat, ou l'envie de rejoindre GlowNyo en tant que prestataire ?
            Écrivez-nous, nous répondons vite.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8 -mt-4 grid sm:grid-cols-2 gap-6">
        <a href={waLink()} target="_blank" rel="noreferrer" className="group rounded-3xl border border-[#25D366]/30 bg-[#0F0F0F] p-8 hover:border-[#25D366]/70 transition"><MessageCircle className="text-[#25D366]" size={32} /><h2 className="mt-5 font-display text-2xl font-semibold">WhatsApp</h2><p className="mt-2 text-sm text-[#F5F0E6]/65">Le plus rapide pour &nbsp;poser vos questions.</p><span className="mt-5 inline-flex items-center gap-2 text-[#25D366] group-hover:gap-3 transition-all">Ouvrir WhatsApp <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span></a>

        <a href={`mailto:${EMAIL}`} className="group rounded-3xl border border-[#C9922A]/20 bg-[#0F0F0F] p-8 hover:border-[#C9922A]/60 transition">
          <Mail className="text-gold" size={32} />
          <h2 className="mt-5 font-display text-2xl font-semibold">Email</h2>
          <p className="mt-2 text-sm text-[#F5F0E6]/65">{EMAIL}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-gold group-hover:gap-3 transition-all">
            Nous écrire <ArrowRight size={16} />
          </span>
        </a>
      </section>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8 mt-6 grid sm:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-8">
          <MapPin className="text-gold" size={26} />
          <h3 className="mt-4 font-display text-xl font-semibold">Localisation</h3>
          <p className="mt-2 text-sm text-[#F5F0E6]/65">Cotonou, Bénin — au service de toute l'Afrique.</p>
        </div>
        <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-8">
          <Clock className="text-gold" size={26} />
          <h3 className="mt-4 font-display text-xl font-semibold">Disponibilité</h3>
          <p className="mt-2 text-sm text-[#F5F0E6]/65">Support 7j/7, de 8h à 21h (GMT+1).</p>
        </div>
      </section>
    </div>;
};
export default ContactPage;