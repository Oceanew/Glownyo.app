import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import { LOGO, EMAIL, waLink, SPECIALTIES } from '@/data/site';
const Footer = () => {
  return <footer className="border-t border-[#C9922A]/15 bg-[#070707]">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <img src={LOGO} alt="GlowNyo" className="h-14 w-auto mb-4" />
          <p className="text-sm text-[#F5F0E6]/60 leading-relaxed max-w-xs">Plateforme de réservation beauté &amp; bien-être connectant clients et prestataires au Bénin et en Afrique.</p>
          <p className="mt-4 font-display italic text-gold text-sm">
            « Rayonne de l'intérieur, brille de l'extérieur »
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-4">Navigation</h4>
          <ul className="space-y-2.5 text-sm text-[#F5F0E6]/70">
            <li><Link to="/" className="hover:text-gold transition">Accueil</Link></li>
            <li><Link to="/prestataires" className="hover:text-gold transition">Prestataires</Link></li>
            <li><Link to="/reservation" className="hover:text-gold transition">Réservation</Link></li>
            <li><Link to="/partenaires" className="hover:text-gold transition">Partenaires</Link></li>
            <li><Link to="/a-propos" className="hover:text-gold transition">À propos</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-4">Spécialités</h4>
          <ul className="space-y-2.5 text-sm text-[#F5F0E6]/70">
            {SPECIALTIES.map(s => <li key={s}>{s}</li>)}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-4">Contact</h4>
          <ul className="space-y-3.5 text-sm text-[#F5F0E6]/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={17} className="text-gold mt-0.5 shrink-0" />
              Cotonou, Bénin
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="flex items-start gap-2.5 hover:text-gold transition">
                <Mail size={17} className="text-gold mt-0.5 shrink-0" />
                {EMAIL}
              </a>
            </li>
            <li>
              <a href={waLink()} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 hover:text-gold transition"><MessageCircle size={17} className="text-gold mt-0.5 shrink-0" />WhatsApp</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#F5F0E6]/40">
          <p>© {new Date().getFullYear()} GlowNyo — glownyo.app. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link to="/cgv" className="hover:text-gold transition">Conditions générales de vente</Link>
            <p>Paiement Mobile Money via FedaPay · Réservation directe sur GlowNyo</p>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;