import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Globe, MessageCircle, MapPin, LoaderCircle, CalendarClock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { CALENDLY_URL, teamWaLink } from '@/data/site';

// WhatsApp de l'équipe GlowNyo (+33 7 43 62 68 18)
const GLOWNYO_TEAM_WA = teamWaLink("Bonjour l'équipe GlowNyo, je vous contacte au sujet des partenaires.");

const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.6 5.82a4.28 4.28 0 0 1-3.32-4.06h-3.4v14.53a2.6 2.6 0 1 1-1.84-2.49V10.4a5.99 5.99 0 0 0-1.03-.09A6 6 0 1 0 13 16.3V9.4a7.63 7.63 0 0 0 4.29 1.3V7.3a4.24 4.24 0 0 1-.69-1.48Z" />
  </svg>
);

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const socialMeta = {
  instagram: { icon: Instagram, label: 'Instagram' },
  facebook: { icon: Facebook, label: 'Facebook' },
  tiktok: { icon: TikTokIcon, label: 'TikTok' },
  website: { icon: Globe, label: 'Site web' },
};

const PartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    pb.collection('partners')
      .getFullList({ sort: 'order,name' })
      .then((records) => {
        if (active) setPartners(records);
      })
      .catch((err) => {
        console.error('load partners failed', err);
        if (active) setError('Impossible de charger les partenaires pour le moment.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pt-28 pb-24">
      {/* Intro */}
      <section className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <span className="text-xs tracking-widest uppercase text-gold">Partenaires</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight max-w-3xl">
          Des marques et créateurs africains,{' '}
          <span className="text-gold-gradient italic">réunis autour d'un même éclat</span>
        </h1>
        <p className="mt-6 text-lg text-[#F5F0E6]/70 max-w-2xl leading-relaxed">
          Cette page met en avant des marques et créateurs africains partenaires de GlowNyo — coiffure,
          esthétique, nail art, barbershop, bien-être et lifestyle. Des maisons qui partagent notre exigence
          de qualité et notre fierté de célébrer la beauté afro, sur le continent et au-delà.
        </p>
        <a
          href={GLOWNYO_TEAM_WA}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-7 py-3.5 rounded-full hover:brightness-105 active:scale-95 transition"
        >
          <MessageCircle size={20} />
          Contacter l'équipe GlowNyo sur WhatsApp
        </a>
      </section>

      {/* Partner grid */}
      <section className="mx-auto max-w-[90rem] px-5 sm:px-8 mt-16">
        {loading && (
          <div className="flex items-center justify-center gap-3 text-[#F5F0E6]/60 py-16">
            <LoaderCircle className="animate-spin" size={20} />
            <span>Chargement des partenaires…</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-[#F5F0E6]/60">{error}</div>
        )}

        {!loading && !error && partners.length === 0 && (
          <div className="text-center py-16 text-[#F5F0E6]/60">
            Aucun partenaire pour le moment. Revenez bientôt !
          </div>
        )}

        {!loading && !error && partners.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p, i) => (
              <motion.div
                key={p.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={fade}
                transition={{ delay: (i % 3) * 0.08 }}
                className="group rounded-2xl border border-[#C9922A]/15 bg-[#0F0F0F] p-7 flex flex-col hover:border-[#C9922A]/45 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-[#C9922A]/30 shrink-0 bg-[#0A0A0A]">
                    {p.logo ? (
                      <img src={p.logo} alt={`Logo ${p.name}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-display text-gold text-xl">
                        {p.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold leading-snug">{p.name}</h3>
                    <span className="mt-1 inline-block text-xs text-gold tracking-wide">{p.specialty}</span>
                    {p.location && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#F5F0E6]/45">
                        <MapPin size={12} /> {p.location}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-5 text-sm text-[#F5F0E6]/65 leading-relaxed flex-1">{p.description}</p>

                <div className="mt-6 flex items-center gap-2 flex-wrap">
                  {Object.keys(socialMeta).map((key) => {
                    const url = p[key];
                    const meta = socialMeta[key];
                    if (!url) return null;
                    const Icon = meta.icon;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${meta.label} de ${p.name}`}
                        className="flex items-center justify-center h-10 w-10 rounded-full border border-[#C9922A]/25 text-[#F5F0E6]/70 hover:text-gold hover:border-[#C9922A]/60 hover:bg-[#C9922A]/10 transition"
                      >
                        <Icon size={17} strokeWidth={1.75} />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* BOOK A CALL WITH GLOWNYO TEAM (Calendly) */}
      <section className="mx-auto max-w-[72rem] px-5 sm:px-8 mt-24">
        <div className="relative overflow-hidden rounded-3xl border border-[#C9922A]/30 bg-gradient-to-br from-[#141007] via-[#0F0F0F] to-[#0A0A0A] px-6 py-14 sm:px-14 sm:py-16 text-center">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#C9922A]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#C9922A]/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C9922A]/40 bg-[#0A0A0A]/60 px-4 py-1.5 text-xs uppercase tracking-widest text-gold">
              <CalendarClock size={14} /> Espace prestataires & partenaires
            </span>
            <h2 className="mt-6 font-display text-3xl sm:text-4xl font-semibold leading-tight max-w-2xl mx-auto">
              Réservez un appel avec l'équipe <span className="text-gold-gradient italic">GlowNyo</span>
            </h2>
            <p className="mt-5 text-[#F5F0E6]/70 text-lg max-w-xl mx-auto">
              Vous êtes prestataire ou partenaire ? Échangeons en visio pendant 30 minutes pour parler de
              votre projet, de votre inscription ou d'une collaboration. Choisissez le créneau qui vous convient.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-9 py-4 rounded-full hover:brightness-110 transition shadow-lg shadow-[#C9922A]/20"
            >
              <CalendarClock size={20} /> Choisir un créneau sur Calendly
            </a>
            <p className="mt-4 text-xs text-[#F5F0E6]/45">Appel de 30 min · gratuit · sans engagement</p>
          </div>
        </div>
      </section>

      {/* CTA to become a partner */}
      <section className="mx-auto max-w-[56rem] px-5 sm:px-8 mt-24 text-center">
        <span className="text-xs tracking-widest uppercase text-gold">Devenir partenaire</span>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight">
          Votre marque a sa place ici
        </h2>
        <p className="mt-5 text-[#F5F0E6]/70 text-lg">
          Vous représentez une marque ou un créateur africain lié à la beauté, au bien-être ou au lifestyle ?
          Rejoignez la communauté de partenaires GlowNyo.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-9 py-4 rounded-full hover:brightness-110 transition"
          >
            Nous contacter
          </Link>
          <a
            href={GLOWNYO_TEAM_WA}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-9 py-4 rounded-full hover:brightness-105 active:scale-95 transition"
          >
            <MessageCircle size={20} />
            WhatsApp GlowNyo
          </a>
        </div>
      </section>
    </div>
  );
};

export default PartnersPage;
