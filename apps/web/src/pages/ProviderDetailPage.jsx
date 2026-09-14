import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, MessageCircle, CalendarCheck, ArrowLeft, Clock, Instagram, CalendarClock, Tag } from 'lucide-react';
import { waLinkTo } from '@/data/site';
import { usePublicProviders } from '@/lib/usePublicProviders';
import { Helmet } from 'react-helmet';

const ProviderDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { providers } = usePublicProviders();
  const p = providers.find((x) => x.slug === slug);

  if (!p) {
    return (
      <div className="pt-40 pb-32 text-center px-5">
        <h1 className="font-display text-3xl">Prestataire introuvable</h1>
        <Link to="/prestataires" className="mt-6 inline-block text-gold">Retour aux prestataires</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24">
      <Helmet>
        <title>{`${p.name} — GlowNyo`}</title>
        <meta name="description" content={`${p.name} — ${p.specialty} à ${p.location}. Réservez votre rendez-vous sur GlowNyo.`} />
      </Helmet>
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <button
          onClick={() => navigate('/prestataires')}
          className="flex items-center gap-2 text-sm text-[#F5F0E6]/60 hover:text-gold transition mb-8"
        >
          <ArrowLeft size={16} /> Toutes les prestataires
        </button>

        <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-10 lg:gap-14">
          {/* LEFT: photo + actions */}
          <div>
            <div className="relative rounded-3xl overflow-hidden border border-[#C9922A]/20">
              <img src={p.image} alt={p.name} className="w-full aspect-[4/5] object-cover" />
              <span className="absolute top-4 left-4 rounded-full bg-[#0A0A0A]/80 backdrop-blur px-3 py-1 text-xs text-gold border border-[#C9922A]/30">
                {p.specialty}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to={`/reservation?prestataire=${p.slug}`}
                className="gold-gradient text-[#0A0A0A] font-semibold px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:brightness-110 transition"
              >
                <CalendarCheck size={18} /> Réserver
              </Link>
              <a
                href={waLinkTo(p.whatsapp, `Bonjour ${p.name}, je vous ai trouvée sur GlowNyo et souhaite en savoir plus sur vos prestations de ${p.specialty}.`)}
                target="_blank"
                rel="noreferrer"
                className="border border-[#25D366]/60 text-[#25D366] px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#25D366]/10 transition"
              >
                <MessageCircle size={18} /> Contacter sur WhatsApp
              </a>
              {p.instagram && (
                <a
                  href={p.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-[#C9922A]/40 text-gold px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#C9922A]/10 transition"
                >
                  <Instagram size={18} /> Voir sur Instagram
                </a>
              )}
            </div>
          </div>

          {/* RIGHT: info */}
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold">{p.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              {p.rating ? (
                <span className="flex items-center gap-1.5 text-gold">
                  <Star size={15} fill="currentColor" /> {p.rating.toFixed(1)}
                  <span className="text-[#F5F0E6]/50">({p.reviews} avis)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-gold">
                  <Star size={15} /> Nouvelle prestataire
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[#F5F0E6]/60">
                <MapPin size={15} /> {p.location}
              </span>
            </div>

            <p className="mt-6 text-lg text-gold font-display italic">{p.tagline}</p>
            <p className="mt-4 text-[#F5F0E6]/70 leading-relaxed max-w-2xl">{p.bio}</p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {p.startingPrice && (
                <span className="flex items-center gap-1.5 rounded-full border border-[#C9922A]/25 px-4 py-2 text-[#F5F0E6]/75">
                  <Tag size={14} className="text-gold" /> À partir de {p.startingPrice}
                </span>
              )}
              {p.availability && (
                <span className="flex items-center gap-1.5 rounded-full border border-[#C9922A]/25 px-4 py-2 text-[#F5F0E6]/75">
                  <CalendarClock size={14} className="text-gold" /> {p.availability}
                </span>
              )}
            </div>

            {/* Tarifs */}
            <h2 className="mt-12 font-display text-2xl font-semibold">Prestations & tarifs</h2>
            <div className="mt-5 divide-y divide-white/5 border border-[#C9922A]/15 rounded-2xl overflow-hidden">
              {p.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-4 p-5 bg-[#0F0F0F]">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#F5F0E6]/50">
                      <Clock size={12} /> {s.duration}
                    </p>
                  </div>
                  <span className="text-gold font-semibold whitespace-nowrap">{s.price}</span>
                </div>
              ))}
            </div>

            {/* Réalisations */}
            <h2 className="mt-12 font-display text-2xl font-semibold">Réalisations</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {p.gallery.map((g, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[#C9922A]/15 aspect-square">
                  <img src={g} alt={`Réalisation ${i + 1} de ${p.name}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPage;
