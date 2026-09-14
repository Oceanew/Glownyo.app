import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, ShieldCheck, Smartphone, CalendarCheck, Sparkles, Rocket, Users, TrendingUp, CalendarClock, MessageCircle } from 'lucide-react';
import { PROVIDERS, SPECIALTIES, IMAGES, LOGO, CALENDLY_URL, teamWaLink } from '@/data/site';
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
              Rayonne de l'intérieur,
              <br />
              <span className="text-gold-gradient italic">brille de l'extérieur</span>
            </h1>
            <p className="mt-6 text-lg text-[#F5F0E6]/75 leading-relaxed max-w-xl">La plateforme afro-moderne qui connecte les clients aux meilleures prestataires beauté &amp; bien-être au Bénin et en Afrique. Réservez en quelques clics, payez en Mobile Money.</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/reservation" className="group gold-gradient text-[#0A0A0A] font-semibold px-8 py-4 rounded-full flex items-center gap-2 hover:brightness-110 transition">
                Réserver un rendez-vous
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/prestataires" className="border border-[#C9922A]/40 text-[#F5F0E6] px-8 py-4 rounded-full hover:bg-[#C9922A]/10 transition">
                Découvrir les prestataires
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
          title: 'Réservation instantanée',
          desc: 'Choisissez une prestataire, un créneau et confirmez en quelques clics.'
        }, {
          icon: Smartphone,
          title: 'Paiement Mobile Money',
          desc: 'Réglez en toute simplicité avec FedaPay — MTN, Moov et cartes acceptées.'
        }, {
          icon: ShieldCheck,
          title: 'Prestataires vérifiées',
          desc: 'Chaque professionnelle est sélectionnée pour son savoir-faire et sa fiabilité.'
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
            <span className="text-xs tracking-widest uppercase text-gold">Nos talents</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold">Prestataires à la une</h2>
          </div>
          <Link to="/prestataires" className="text-gold flex items-center gap-2 hover:gap-3 transition-all text-sm">
            Voir toutes les prestataires <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROVIDERS.slice(0, 6).map((p, i) => <motion.div key={p.slug} initial="hidden" whileInView="show" viewport={{
          once: true,
          margin: '-60px'
        }} variants={fade} transition={{
          delay: i % 3 * 0.08
        }}>
              <Link to={`/prestataires/${p.slug}`} className="group block rounded-2xl overflow-hidden border border-[#C9922A]/15 bg-[#0F0F0F] hover:border-[#C9922A]/45 transition">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 rounded-full bg-[#0A0A0A]/80 backdrop-blur px-3 py-1 text-xs text-gold border border-[#C9922A]/30">
                    {p.specialty}
                  </span>
                </div>
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
                <Sparkles size={14} /> Offre de lancement
              </span>
              <h2 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-semibold">
                Inscrivez-vous <span className="text-gold-gradient italic">gratuitement</span> pendant le lancement
              </h2>
              <p className="mt-6 text-lg text-[#F5F0E6]/75 leading-relaxed max-w-xl">
                GlowNyo ouvre ses portes aux prestataires beauté & bien-être d'Afrique. Profitez de
                l'offre de lancement pour rejoindre la plateforme <span className="text-gold font-medium">sans aucun frais</span> —
                places limitées, inscriptions clôturées à la fin du lancement.
              </p>

              <div className="mt-9 space-y-4">
                {[{
                icon: Rocket,
                title: 'Visibilité immédiate',
                desc: 'Votre profil devant des centaines de clientes dès le premier jour.'
              }, {
                icon: TrendingUp,
                title: 'Zéro commission pendant le lancement',
                desc: 'Gardez 100 % de vos revenus, sans frais cachés.'
              }, {
                icon: Users,
                title: 'Réservations simplifiées',
                desc: 'Un agenda en ligne, un paiement Mobile Money intégré, zéro paperasse.'
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
                  Je m'inscris gratuitement
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 border border-[#C9922A]/40 text-[#F5F0E6] font-semibold px-7 py-4 rounded-full hover:bg-[#C9922A]/10 transition">
                  <CalendarClock size={18} className="text-gold" />
                  Réserver un appel avec GlowNyo
                </a>
                <a href={teamWaLink("Bonjour l'équipe GlowNyo, je suis prestataire et souhaite vous contacter.")} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-7 py-4 rounded-full hover:brightness-105 active:scale-95 transition">
                  <MessageCircle size={18} />
                  Contacter l'équipe sur WhatsApp
                </a>
                <span className="text-xs text-[#F5F0E6]/50">Inscription en 2 minutes · Sans engagement</span>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{
            once: true,
            margin: '-80px'
          }} variants={fade} transition={{
            delay: 0.15
          }} className="relative rounded-3xl border border-[#C9922A]/25 bg-[#0F0F0F]/80 backdrop-blur p-8 sm:p-10">
              <div className="absolute -top-3 left-8 rounded-full bg-[#C9922A] px-4 py-1 text-xs font-semibold text-[#0A0A0A] tracking-wide">
                Offre limitée
              </div>
              <p className="font-display text-2xl italic text-[#F5F0E6]/85 leading-snug">
                « Rejoindre GlowNyo, c'est donner à mon talent la visibilité qu'il mérite —
                et toucher une clientèle que je n'aurais jamais atteinte seule. »
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#C9922A]/15 pt-6">
                <div>
                  <p className="font-display text-3xl text-gold font-semibold">0 €</p>
                  <p className="mt-1 text-xs text-[#F5F0E6]/55">Frais d'inscription</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-gold font-semibold">100 %</p>
                  <p className="mt-1 text-xs text-[#F5F0E6]/55">De vos revenus</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-gold font-semibold">2 min</p>
                  <p className="mt-1 text-xs text-[#F5F0E6]/55">Pour s'inscrire</p>
                </div>
              </div>
              <Link to="/devenir-prestataire" className="mt-8 flex items-center justify-center gap-2 w-full rounded-full border border-[#C9922A]/40 text-gold px-6 py-3.5 hover:bg-[#C9922A]/10 transition font-medium">
                Ouvrir le formulaire d'inscription <ArrowRight size={16} />
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
            Votre moment beauté commence ici
          </h2>
          <p className="mt-5 text-[#F5F0E6]/75 text-lg max-w-xl mx-auto">
            Rejoignez la communauté GlowNyo et vivez une expérience beauté afro-moderne, où que vous soyez.
          </p>
          <Link to="/reservation" className="mt-9 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-9 py-4 rounded-full hover:brightness-110 transition">
            Prendre rendez-vous <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>;
};
export default HomePage;