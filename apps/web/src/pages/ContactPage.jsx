import { MessageCircle, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import { EMAIL, waLink, IMAGES } from '@/data/site';
import useSiteTexts from '@/lib/useSiteTexts';
const ContactPage = () => {
  const { t } = useSiteTexts();
  return <div className="pt-28 pb-24">
      <section className="relative overflow-hidden">
        <img src={IMAGES.salon} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 to-[#0A0A0A]" />
        <div className="relative mx-auto max-w-[72rem] px-5 sm:px-8 py-20 text-center">
          <span className="text-xs tracking-widest uppercase text-gold">{t('contact_eyebrow', 'Contact')}</span>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight">
            {t('contact_titre', 'Parlons de votre éclat')}
          </h1>
          <p className="mt-5 text-[#F5F0E6]/70 text-lg max-w-xl mx-auto">
            {t('contact_description', "Une question, un partenariat, ou l'envie de rejoindre GlowNyo en tant que prestataire ? Écrivez-nous, nous répondons vite.")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8 -mt-4 grid sm:grid-cols-2 gap-6">
        <a href={waLink()} target="_blank" rel="noreferrer" className="group rounded-3xl border border-[#25D366]/30 bg-[#0F0F0F] p-8 hover:border-[#25D366]/70 transition"><MessageCircle className="text-[#25D366]" size={32} /><h2 className="mt-5 font-display text-2xl font-semibold">{t('contact_whatsapp_titre', 'WhatsApp')}</h2><p className="mt-2 text-sm text-[#F5F0E6]/65">{t('contact_whatsapp_description', 'Le plus rapide pour poser vos questions.')}</p><span className="mt-5 inline-flex items-center gap-2 text-[#25D366] group-hover:gap-3 transition-all">{t('contact_whatsapp_lien', 'Ouvrir WhatsApp')} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span></a>

        <a href={`mailto:${EMAIL}`} className="group rounded-3xl border border-[#C9922A]/20 bg-[#0F0F0F] p-8 hover:border-[#C9922A]/60 transition">
          <Mail className="text-gold" size={32} />
          <h2 className="mt-5 font-display text-2xl font-semibold">{t('contact_email_titre', 'Email')}</h2>
          <p className="mt-2 text-sm text-[#F5F0E6]/65">{EMAIL}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-gold group-hover:gap-3 transition-all">
            {t('contact_email_lien', 'Nous écrire')} <ArrowRight size={16} />
          </span>
        </a>
      </section>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8 mt-6 grid sm:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-8">
          <MapPin className="text-gold" size={26} />
          <h3 className="mt-4 font-display text-xl font-semibold">{t('contact_localisation_titre', 'Localisation')}</h3>
          <p className="mt-2 text-sm text-[#F5F0E6]/65">{t('contact_localisation_texte', "Cotonou, Bénin — au service de toute l'Afrique.")}</p>
        </div>
        <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-8">
          <Clock className="text-gold" size={26} />
          <h3 className="mt-4 font-display text-xl font-semibold">{t('contact_disponibilite_titre', 'Disponibilité')}</h3>
          <p className="mt-2 text-sm text-[#F5F0E6]/65">{t('contact_disponibilite_texte', 'Support 7j/7, de 8h à 21h (GMT+1).')}</p>
        </div>
      </section>
    </div>;
};
export default ContactPage;