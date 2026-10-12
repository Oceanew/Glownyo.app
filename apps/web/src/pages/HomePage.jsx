import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, ShieldCheck, Smartphone, CalendarCheck, Sparkles, Rocket, Users, TrendingUp, CalendarClock, MessageCircle, Newspaper, CalendarDays } from 'lucide-react';
import { SPECIALTIES, IMAGES, LOGO, CALENDLY_URL, teamWaLink } from '@/data/site';
import { fetchPublishedNews, formatNewsDate } from '@/pages/NewsPage';
import useSiteTexts from '@/lib/useSiteTexts';
import usePublicProviders from '@/lib/usePublicProviders';
const fade = {
  hidden: {
    opacity: 0,
    y: 28
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
const HomePage = () => {
  const { t } = useSiteTexts();
  const { providers } = usePublicProviders();
  const [news, setNews] = useState([]);

  useEffect(() => {
    let active = true;
    fetchPublishedNews(2)
      .then((res) => {
        if (active) setNews(res.items);
      })
      .catch((err) => console.error('failed to load news preview', err));
    return () => {
      active = false;
    };
  }, []);

  return <div className="pt-24 sm:pt-28">
      {/* LOGO */}
      <div className="flex justify-center pt-10 sm:pt-14 pb-2 bg-[#0A0A0A]">
        <motion.img src={LOGO} alt="GlowNyo" initial="hidden" animate="show" variants={fade} className="h-40 sm:h-56 lg:h-64 w-auto" />
      </div>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.heroPortrait} alt="" className="h-full w-full object-cover object-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/60" />
        </div>

        <div className="relative mx-auto max-w-[90rem] w-full px-5 sm:px-8 py-24">
          <motion.div initial="hidden" animate="show" variants={fade} className="max-w-2xl">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-semibold">
              {t('accueil_hero_titre_1', "Rayonne de l'intérieur,")}
              <br />
              <span className="text-gold-gradient italic">{t('accueil_hero_titre_2', 'brille de l\'extérieur')}</span>
            </h1>
            <p className="mt-6 text-lg text-[#F5F0E6]/75 leading-relaxed max-w-xl">{t('accueil_hero_description', "La plateforme afro-moderne qui connecte les clients aux prestataires beauté & bien-être de référence au Bénin et en Afrique. Réservez en quelques clics, payez en Mobile Money.")}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/reservation" className="group gold-gradient text-[#0A0A0A] font-semibold px-8 py-4 rounded-full flex items-center gap-2 hover:brightness-110 transition">
                {t('accueil_hero_bouton_reserver', 'Réserver un rendez-vous')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/prestataires" className="border border-[#C9922A]/40 text-[#F5F0E6] px-8 py-4 rounded-full hover:bg-[#C9922A]/10 transition">
                {t('accueil_hero_bouton_decouvrir', 'Découvrir les prestataires')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SPECIALTIES MARQUEE */}
      <section className="border-y border-[#C9922A]/15 py-6 overflow-hidden bg-[#070707]">
        <div className="flex w-max animate-marquee">
          {[...SPECIALTIES, ...SPECIALTIES, ...SPECIALTIES, ...SPECIALTIES].map((s, i) => <span key={i} className="flex items-center gap-6 px-8 font-display text-2xl italic text-[#F5F0E6]/60">
              {s}
              <span className="text-gold not-italic">✦</span>
            </span>)}
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-[72rem] px-5 sm:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[{
          icon: CalendarCheck,
          title: t('accueil_valeur1_titre', 'Réservation instantanée'),
          desc: t('accueil_valeur1_description', 'Choisissez votre prestataire, un créneau et confirmez en quelques clics.')
        }, {
          icon: Smartphone,
          title: t('accueil_valeur2_titre', 'Paiement Mobile Money'),
          desc: t('accueil_valeur2_description', 'Réglez en toute simplicité avec FedaPay — MTN, Moov et cartes acceptées.')
        }, {
          icon: ShieldCheck,
          title: t('accueil_valeur3_titre', 'Prestataires de confiance'),
          desc: t('accueil_valeur3_description', 'Chaque personne prestataire est sélectionnée pour son savoir-faire et sa fiabilité.')
        }].map((f, i) => <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{
          once: true,
          margin: '-80px'
        }} variants={fade} transition={{
          delay: i * 0.1
        }} className="rounded-2xl border border-[#C9922A]/15 bg-[#0F0F0F] p-8 hover:border-[#C9922A]/40 transition">
              <f.icon className="text-gold" size={30} strokeWidth={1.5} />
              <h3 className="mt-5 text-xl font-display font-semibold">{f.title}</h3>
              <p className="mt-3 text-sm text-[#F5F0E6]/65 leading-relaxed">{f.desc}</p>
            </motion.div>)}
        </div>
      </section>

      {/* FEATURED PROVIDERS */}
      <section className="mx-auto max-w-[90rem] px-5 sm:px-8 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs tracking-widest uppercase text-gold">{t('accueil_talents_label', 'Nos talents')}</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold">{t('accueil_talents_titre', 'Prestataires à la une')}</h2>
          </div>
          <Link to="/prestataires" className="text-gold flex items-center gap-2 hover:gap-3 transition-all text-sm">
            {t('accueil_talents_lien', 'Voir toutes les prestataires')} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.slice(0, 6).map((p, i) => <motion.div key={p.slug} initial="hidden" whileInView="show" viewport={{
          once: true,
          margin: '-60px'
        }} variants={fade} transition={{
          delay: i % 3 * 0.08
        }}>
              <Link to={`/prestataires/${p.slug}`} className="group block rounded-2xl overflow-hidden border border-[#C9922A]/15 bg-[#0F0F0F] hover:border-[#C9922A]/45 transition">
                {p.avatarShape === 'circle' ? (
                  <div className="relative aspect-[4/5] overflow-hidden flex items-center justify-center bg-[#0A0A0A]">
                    <picture>
                      {p.imageWebp && <source srcSet={p.imageWebp} type="image/webp" />}
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-36 w-36 sm:h-44 sm:w-44 rounded-full object-cover ring-4 ring-[#C9922A]/25 group-hover:scale-105 transition-transform duration-700"
                      />
                    </picture>
                    <span className="absolute top-4 left-4 rounded-full bg-[#0A0A0A]/80 backdrop-blur px-3 py-1 text-xs text-gold border border-[#C9922A]/30">
                      {p.specialty}
                    </span>
                  </div>
                ) : (
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 rounded-full bg-[#0A0A0A]/80 backdrop-blur px-3 py-1 text-xs text-gold border border-[#C9922A]/30">
                      {p.specialty}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                    <span className="flex items-center gap-1 text-sm text-gold">
                      <Star size={14} fill="currentColor" /> {p.rating}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-[#F5F0E6]/60">{p.tagline}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-[#F5F0E6]/45">
                    <MapPin size={13} /> {p.location}
                  </p>
                </div>
              </Link>
            </motion.div>)}
        </div>
      </section>

      {/* NEWS PREVIEW — only shown once at least one article has loaded, so
          the section never flashes empty before the fetch resolves. */}
      {news.length > 0 && (
        <section className="mx-auto max-w-[90rem] px-5 sm:px-8 pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs tracking-widest uppercase text-gold">{t('accueil_actualites_label', 'Du nouveau')}</span>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold">{t('accueil_actualites_titre', 'Actualités')}</h2>
            </div>
            <Link to="/actualites" className="text-gold flex items-center gap-2 hover:gap-3 transition-all text-sm">
              {t('accueil_actualites_lien', 'Voir toutes les actualités')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {news.map((item, i) => (
              <motion.div
                key={item.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={fade}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/actualites/${item.id}`}
                  className="group block rounded-2xl border border-[#C9922A]/15 bg-[#0F0F0F] p-7 hover:border-[#C9922A]/45 transition h-full"
                >
                  <p className="flex items-center gap-1.5 text-xs text-[#F5F0E6]/45">
                    <CalendarDays size={13} /> {formatNewsDate(item.date_publication)}
                  </p>
                  <h3 className="mt-2.5 font-display text-xl font-semibold leading-snug">{item.titre}</h3>
                  <p className="mt-2.5 text-sm text-[#F5F0E6]/65 leading-relaxed line-clamp-2">{item.texte}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-gold group-hover:gap-2.5 transition-all">
                    <Newspaper size={14} /> Lire la suite
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* PROVIDER SIGN-UP */}
      <section className="relative overflow-hidden border-y border-[#C9922A]/20 bg-gradient-to-b from-[#0F0B05] to-[#0A0A0A]">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#C9922A] blur-[120px]" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#C9922A] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-[72rem] px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{
            once: true,
            margin: '-80px'
          }} variants={fade}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C9922A]/40 bg-[#C9922A]/10 px-4 py-1.5 text-xs tracking-widest uppercase text-gold">
                <Sparkles size={14} /> {t('accueil_lancement_badge', 'Offre de lancement')}
              </span>
              <h2 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-semibold">
                {t('accueil_lancement_titre', 'Inscrivez-vous gratuitement pendant le lancement')}
              </h2>
              <p className="mt-6 text-lg text-[#F5F0E6]/75 leading-relaxed max-w-xl">
                {t('accueil_lancement_description', "GlowNyo ouvre ses portes aux prestataires beauté & bien-être d'Afrique. Profitez de l'offre de lancement pour rejoindre la plateforme sans aucun frais — places limitées, inscriptions clôturées à la fin du lancement.")}
              </p>

              <div className="mt-9 space-y-4">
                {[{
                icon: Rocket,
                title: t('accueil_benefice1_titre', 'Visibilité immédiate'),
                desc: t('accueil_benefice1_description', 'Votre profil devant des centaines de personnes clientes dès le premier jour.')
              }, {
                icon: TrendingUp,
                title: t('accueil_benefice2_titre', 'Zéro commission pendant le lancement'),
                desc: t('accueil_benefice2_description', 'Gardez 100 % de vos revenus, sans frais cachés.')
              }, {
                icon: Users,
                title: t('accueil_benefice3_titre', 'Réservations simplifiées'),
                desc: t('accueil_benefice3_description', 'Un agenda en ligne, un paiement Mobile Money intégré, zéro paperasse.')
              }].map(b => <div key={b.title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C9922A]/30 bg-[#C9922A]/10">
                      <b.icon className="text-gold" size={20} strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                      <p className="text-sm text-[#F5F0E6]/65 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>)}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/devenir-prestataire" className="group inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-9 py-4 rounded-full hover:brightness-110 transition shadow-lg shadow-[#C9922A]/20">
                  {t('accueil_lancement_bouton_inscription', "Je m'inscris gratuitement")}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 border border-[#C9922A]/40 text-[#F5F0E6] font-semibold px-7 py-4 rounded-full hover:bg-[#C9922A]/10 transition">
                  <CalendarClock size={18} className="text-gold" />
                  {t('accueil_lancement_bouton_appel', 'Réserver un appel avec GlowNyo')}
                </a>
                <a href={teamWaLink("Bonjour l'équipe GlowNyo, je suis prestataire et souhaite vous contacter.")} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-7 py-4 rounded-full hover:brightness-105 active:scale-95 transition">
                  <MessageCircle size={18} />
                  {t('accueil_lancement_bouton_whatsapp', "Contacter l'équipe sur WhatsApp")}
                </a>
                <span className="text-xs text-[#F5F0E6]/50">{t('accueil_lancement_mention', 'Inscription en 2 minutes · Sans engagement')}</span>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{
            once: true,
            margin: '-80px'
          }} variants={fade} transition={{
            delay: 0.15
          }} className="relative rounded-3xl border border-[#C9922A]/25 bg-[#0F0F0F]/80 backdrop-blur p-8 sm:p-10">
              <div className="absolute -top-3 left-8 rounded-full bg-[#C9922A] px-4 py-1 text-xs font-semibold text-[#0A0A0A] tracking-wide">
                {t('accueil_lancement_badge_carte', 'Offre limitée')}
              </div>
              <p className="font-display text-2xl italic text-[#F5F0E6]/85 leading-snug">
                {t('accueil_lancement_citation', "« Rejoindre GlowNyo, c'est donner à mon talent la visibilité qu'il mérite — et toucher une clientèle que je n'aurais jamais atteinte seule. »")}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#C9922A]/15 pt-6">
                <div>
                  <p className="font-display text-3xl text-gold font-semibold">{t('accueil_lancement_stat1_valeur', '0 €')}</p>
                  <p className="mt-1 text-xs text-[#F5F0E6]/55">{t('accueil_lancement_stat1_label', "Frais d'inscription")}</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-gold font-semibold">{t('accueil_lancement_stat2_valeur', '100 %')}</p>
                  <p className="mt-1 text-xs text-[#F5F0E6]/55">{t('accueil_lancement_stat2_label', 'De vos revenus')}</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-gold font-semibold">{t('accueil_lancement_stat3_valeur', '2 min')}</p>
                  <p className="mt-1 text-xs text-[#F5F0E6]/55">{t('accueil_lancement_stat3_label', "Pour s'inscrire")}</p>
                </div>
              </div>
              <Link to="/devenir-prestataire" className="mt-8 flex items-center justify-center gap-2 w-full rounded-full border border-[#C9922A]/40 text-gold px-6 py-3.5 hover:bg-[#C9922A]/10 transition font-medium">
                {t('accueil_lancement_bouton_formulaire', "Ouvrir le formulaire d'inscription")} <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={IMAGES.salon} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[#0A0A0A]/80" />
        <div className="relative mx-auto max-w-[56rem] px-5 sm:px-8 py-28 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
            {t('accueil_cta_titre', 'Votre moment beauté commence ici')}
          </h2>
          <p className="mt-5 text-[#F5F0E6]/75 text-lg max-w-xl mx-auto">
            {t('accueil_cta_description', 'Rejoignez la communauté GlowNyo et vivez une expérience beauté afro-moderne, où que vous soyez.')}
          </p>
          <Link to="/reservation" className="mt-9 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-9 py-4 rounded-full hover:brightness-110 transition">
            {t('accueil_cta_bouton', 'Prendre rendez-vous')} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>;
};
export default HomePage;