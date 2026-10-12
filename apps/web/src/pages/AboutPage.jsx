import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Globe2, Sparkles } from 'lucide-react';
import useSiteTexts from '@/lib/useSiteTexts';
const AboutPage = () => {
  const { t } = useSiteTexts();
  return <div className="pt-28 pb-24">
      {/* Intro */}
      <section className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <span className="text-xs tracking-widest uppercase text-gold">{t('a_propos_eyebrow', 'À propos')}</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight max-w-3xl">
          {t('a_propos_titre', 'Célébrer la beauté noire, avec sophistication')}
        </h1>
        <p className="mt-6 text-lg text-[#F5F0E6]/70 max-w-2xl leading-relaxed">{t('a_propos_intro', "GlowNyo est né d'une vision et d'une conviction simple : la beauté et le bien-être afro méritent une plateforme à la hauteur de leur richesse. Nous connectons les personnes clientes aux prestataires de référence du continent, dans une expérience élégante, chaleureuse et résolument moderne.")}</p>
      </section>

      {/* Image + story */}
      <section className="mx-auto max-w-[90rem] px-5 sm:px-8 mt-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="rounded-3xl overflow-hidden border border-[#C9922A]/20">
          <img src="https://horizons-cdn.hostinger.com/1abd766d-e423-438d-8143-d72cc1e75115/d70a4b0dc622e132dad82a75f88f1e2c.jpg" alt="L'équipe fondatrice de GlowNyo à Cotonou" className="w-full h-auto object-contain" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold">{t('a_propos_histoire_titre', 'Notre histoire')}</h2>
          <p className="mt-5 text-[#F5F0E6]/70 leading-relaxed">
            {t('a_propos_histoire_p1', "Trouver une personne de confiance pour la coiffure, l'esthétique ou le barbier relevait souvent du parcours du combattant. GlowNyo change la donne : une seule plateforme pour découvrir, comparer et réserver les prestataires beauté & bien-être près de chez soi.")}
          </p>
          <div className="mt-5 space-y-4 text-[#F5F0E6]/70 leading-relaxed">
            <p>{t('a_propos_histoire_p2', 'Derrière GlowNyo, il y a une femme.')}</p>
            <p>{t('a_propos_histoire_p3', 'Océane. Entrepreneure, visionnaire, et passionnée de beauté. ✨')}</p>
            <p>
              {t('a_propos_histoire_p4', "C'est elle qui a imaginé GlowNyo, portée par une conviction profonde : l'Afrique mérite une plateforme beauté à sa hauteur.")}
            </p>
            <p>
              {t('a_propos_histoire_p5', "Déjà fondatrice d'Aphro Désir, Océane est passionnée par la beauté, dans une optique de constante évolution. Et c'est de cette détermination profonde qu'est né GlowNyo.")}
            </p>
            <p>{t('a_propos_histoire_p6', 'Un nom. Une vision. Un mouvement.')}</p>
            <p>
              {t('a_propos_histoire_p7', "« Nyo » : l'âme, l'essence, ce qui est profondément toi. « Glow » : cette lumière qui rayonne quand tu t'assumes pleinement.")}
            </p>
            <p>{t('a_propos_histoire_p8', 'GlowNyo, c\'est son rêve. Et bientôt, ce sera votre réalité.')}</p>
            <p className="font-display italic text-gold">{t('a_propos_histoire_slogan', "Rayonne de l'intérieur, brille de l'extérieur. ✨")}</p>
          </div>
          <p className="mt-4 text-[#F5F0E6]/70 leading-relaxed">{t('a_propos_histoire_p9', "Pensée mobile-first pour l'Afrique, avec le paiement Mobile Money intégré et une gestion des rendez-vous fluide, GlowNyo valorise le savoir-faire local tout en offrant une expérience premium.")}</p>
          <p className="mt-6 font-display italic text-xl text-gold">
            {t('a_propos_histoire_citation', "« Rayonne de l'intérieur, brille de l'extérieur »")}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-[72rem] px-5 sm:px-8 mt-24">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-center">{t('a_propos_valeurs_titre', 'Nos valeurs')}</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[{
          icon: Heart,
          title: t('a_propos_valeur1_titre', 'Fierté afro'),
          desc: t('a_propos_valeur1_description', 'Nous célébrons la beauté noire dans toute sa diversité, avec respect et modernité.')
        }, {
          icon: Sparkles,
          title: t('a_propos_valeur2_titre', 'Excellence'),
          desc: t('a_propos_valeur2_description', 'Chaque prestataire est choisie pour son talent, son professionnalisme et son sens du détail.')
        }, {
          icon: Globe2,
          title: t('a_propos_valeur3_titre', 'Ancrage africain'),
          desc: t('a_propos_valeur3_description', 'Lancé à Cotonou, pensé pour tout le continent, avec des solutions adaptées à nos réalités.')
        }].map(v => <div key={v.title} className="rounded-2xl border border-[#C9922A]/15 bg-[#0F0F0F] p-8 text-center">
              <v.icon className="text-gold mx-auto" size={30} strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-xl font-semibold">{v.title}</h3>
              <p className="mt-3 text-sm text-[#F5F0E6]/65 leading-relaxed">{v.desc}</p>
            </div>)}
        </div>
      </section>

      {/* Vision / CTA */}
      <section className="mx-auto max-w-[56rem] px-5 sm:px-8 mt-24 text-center">
        <span className="text-xs tracking-widest uppercase text-gold">{t('a_propos_vision_eyebrow', 'Notre vision')}</span>
        <h2 className="mt-4 font-display text-3xl sm:text-5xl font-semibold leading-tight">
          {t('a_propos_vision_titre', 'Faire rayonner la beauté africaine, partout')}
        </h2>
        <p className="mt-6 text-[#F5F0E6]/70 text-lg">{t('a_propos_vision_description', "Demain, GlowNyo sera la référence beauté & bien-être en Afrique.  Une communauté où chaque personne trouve la prestation idéale, en quelques clics.")}</p>
        <Link to="/prestataires" className="mt-9 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-9 py-4 rounded-full hover:brightness-110 transition">
          {t('a_propos_vision_bouton', 'Découvrir les prestataires')} <ArrowRight size={18} />
        </Link>
      </section>
    </div>;
};
export default AboutPage;