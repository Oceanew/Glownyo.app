import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowRight, Rocket, TrendingUp, ShieldCheck, CalendarCheck, CalendarClock, MessageCircle } from 'lucide-react';

import { SPECIALTIES, CALENDLY_URL, teamWaLink } from '@/data/site';
import { usePublicProviders } from '@/lib/usePublicProviders';
import { Helmet } from 'react-helmet';

const ProvidersPage = () => {
  const { providers } = usePublicProviders();
  const [filter, setFilter] = useState('Tous');
  const list = filter === 'Tous' ? providers : providers.filter((p) => p.specialty === filter);

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[90rem] px-5 sm:px-8">
      <Helmet>
        <title>Nos prestataires — GlowNyo</title>
        <meta name="description" content="Découvrez les professionnelles beauté & bien-être de Cotonou sur GlowNyo : coiffure, henné, esthétique, manucure et plus encore." />
      </Helmet>
      <div className="max-w-2xl">
        <span className="text-xs tracking-widest uppercase text-gold">Nos prestataires</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight">
          Des talents d'exception
        </h1>
        <p className="mt-5 text-[#F5F0E6]/70 text-lg">
          Découvrez les professionnelles beauté & bien-être qui subliment l'Afrique, une prestation à la fois.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-2.5">
        {['Tous', ...SPECIALTIES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-5 py-2 text-sm transition border ${
              filter === s
                ? 'gold-gradient text-[#0A0A0A] font-semibold border-transparent'
                : 'border-[#C9922A]/25 text-[#F5F0E6]/70 hover:border-[#C9922A]/60'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((p) => (
          <Link
            key={p.slug}
            to={`/prestataires/${p.slug}`}
            className="group block rounded-2xl overflow-hidden border border-[#C9922A]/15 bg-[#0F0F0F] hover:border-[#C9922A]/45 transition"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
              <span className="absolute top-4 left-4 rounded-full bg-[#0A0A0A]/80 backdrop-blur px-3 py-1 text-xs text-gold border border-[#C9922A]/30">
                {p.specialty}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <span className="flex items-center gap-1 text-sm text-gold">
                  <Star size={14} fill={p.rating ? 'currentColor' : 'none'} /> {p.rating ? p.rating.toFixed(1) : 'Nouveau'}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[#F5F0E6]/60">{p.tagline}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs text-[#F5F0E6]/45">
                  <MapPin size={13} /> {p.location}
                </p>
                <span className="text-gold flex items-center gap-1 text-sm opacity-0 group-hover:opacity-100 transition">
                  Voir <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <p className="mt-16 text-center text-[#F5F0E6]/50">Aucune prestataire dans cette catégorie pour le moment.</p>
      )}

      {/* PROVIDER SIGN-UP */}
      <section className="mt-24 relative overflow-hidden rounded-3xl border border-[#C9922A]/30 bg-gradient-to-br from-[#141007] via-[#0F0F0F] to-[#0A0A0A] px-6 py-14 sm:px-14 sm:py-20">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#C9922A]/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C9922A]/40 bg-[#0A0A0A]/60 px-4 py-1.5 text-xs uppercase tracking-widest text-gold">
            <Rocket size={14} /> Offre de lancement · places limitées
          </span>
          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-semibold leading-tight">
            Inscrivez-vous <span className="text-gold-gradient">gratuitement</span> pendant le lancement
          </h2>
          <p className="mt-5 text-[#F5F0E6]/70 text-lg">
            Rejoignez les premières professionnelles beauté & bien-être de Cotonou sur GlowNyo. Zéro frais
            aujourd'hui, une visibilité immédiate demain. Les places de la vague de lancement partent vite.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, title: 'Visibilité immédiate', text: 'Votre profil mis en avant auprès de nouvelles clientes.' },
              { icon: ShieldCheck, title: 'Zéro commission', text: 'Aucun frais pendant toute la période de lancement.' },
              { icon: CalendarCheck, title: 'Réservations simplifiées', text: 'Gérez vos rendez-vous sans effort, en un seul endroit.' },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl border border-[#C9922A]/15 bg-[#0A0A0A]/50 p-5">
                <b.icon className="text-gold" size={22} />
                <h3 className="mt-3 font-display text-lg font-semibold">{b.title}</h3>
                <p className="mt-1.5 text-sm text-[#F5F0E6]/60">{b.text}</p>
              </div>
            ))}
          </div>

          <Link
            to="/devenir-prestataire"
            className="mt-10 inline-flex items-center gap-2 rounded-full gold-gradient px-8 py-4 text-[#0A0A0A] font-semibold text-base shadow-lg shadow-[#C9922A]/20 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Je m'inscris gratuitement <ArrowRight size={18} />
          </Link>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 sm:ml-4 inline-flex items-center gap-2 rounded-full border border-[#C9922A]/40 px-7 py-4 text-[#F5F0E6] font-semibold text-base transition hover:bg-[#C9922A]/10"
          >
            <CalendarClock size={18} className="text-gold" /> Réserver un appel avec GlowNyo
          </a>
          <a
            href={teamWaLink("Bonjour l'équipe GlowNyo, je suis prestataire et souhaite vous contacter.")}
            target="_blank"
            rel="noreferrer"
            className="mt-4 sm:ml-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-7 py-4 font-semibold text-base transition hover:brightness-105 active:scale-95"
          >
            <MessageCircle size={18} /> Contacter l'équipe sur WhatsApp
          </a>
          <p className="mt-4 text-xs text-[#F5F0E6]/45">Inscription en 2 minutes · sans engagement · réponse rapide de l'équipe GlowNyo.</p>
        </div>
      </section>
    </div>
  );
};

export default ProvidersPage;
