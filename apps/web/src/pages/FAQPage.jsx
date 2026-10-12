import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { waLink } from '@/data/site';
import useSiteTexts from '@/lib/useSiteTexts';

const buildClientFaq = (t) => [
  {
    q: t('faq_client_q1', "C'est quoi Glownyo ?"),
    a: t('faq_client_a1', "Glownyo est une plateforme qui vous permet de trouver et réserver une prestation beauté ou bien-être au Bénin : coiffure, henné, ongles, esthétique, barbier… directement depuis votre téléphone."),
  },
  {
    q: t('faq_client_q2', "Est-ce que c'est pour les hommes aussi ?"),
    a: t('faq_client_a2', 'Oui ! Glownyo est fait pour tout le monde. Barbiers et soins homme ont toute leur place.'),
  },
  {
    q: t('faq_client_q3', 'Est-ce que la réservation est payante ?'),
    a: t('faq_client_a3', 'Non. Réserver sur Glownyo est gratuit. Vous payez uniquement votre prestation.'),
  },
  {
    q: t('faq_client_q4', 'Comment je paie ma prestation ?'),
    a: t('faq_client_a4', "Pour le moment, le paiement se fait directement sur place auprès de la personne prestataire. Le paiement par Mobile Money (MTN, Moov) arrive bientôt."),
  },
  {
    q: t('faq_client_q5', 'Comment je sais que mon rendez-vous est confirmé ?'),
    a: t('faq_client_a5', 'Vous recevez une confirmation après votre réservation. La personne prestataire peut aussi vous contacter sur WhatsApp.'),
  },
  {
    q: t('faq_client_q6', 'Je peux annuler mon rendez-vous ?'),
    a: t('faq_client_a6', "Oui, depuis votre espace, au plus tard 48h avant le rendez-vous. Merci de prévenir le plus tôt possible : c'est du temps réservé pour vous."),
  },
  {
    q: t('faq_client_q7', 'Les photos et vidéos de réalisations sont-elles authentiques ?'),
    a: t('faq_client_a7', "Oui. Chaque nouvelle photo ou vidéo publiée par une personne prestataire est vérifiée par l'équipe Glownyo avant de devenir visible sur le site. L'authenticité est une valeur fondamentale de Glownyo."),
  },
];

const buildProviderFaq = (t) => [
  {
    q: t('faq_prestataire_q1', "Qui peut s'inscrire ?"),
    a: t('faq_prestataire_a1', 'Toute personne exerçant un métier de la beauté ou du bien-être au Bénin : coiffure, barbier, nail art, henné, esthétique, maquillage…'),
  },
  {
    q: t('faq_prestataire_q2', 'Combien ça coûte ?'),
    a: t('faq_prestataire_a2', "L'inscription est gratuite pendant la période de lancement. Les abonnements arriveront plus tard, et vous serez informé(e) bien à l'avance, sans surprise."),
  },
  {
    q: t('faq_prestataire_q3', "Qu'est-ce que Glownyo m'apporte ?"),
    a: t('faq_prestataire_a3', 'Plus de visibilité, de nouveaux clients, et vos rendez-vous organisés au même endroit.'),
  },
  {
    q: t('faq_prestataire_q4', 'Comment je reçois mes réservations ?'),
    a: t('faq_prestataire_a4', 'Vous êtes notifié(e) à chaque nouvelle réservation, avec les coordonnées du client.'),
  },
  {
    q: t('faq_prestataire_q5', 'Je peux fixer mes propres prix ?'),
    a: t('faq_prestataire_a5', 'Oui. Vous choisissez vos prestations, vos tarifs et vos disponibilités.'),
  },
  {
    q: t('faq_prestataire_q6', "Qu'est-ce qu'on attend de moi ?"),
    a: t('faq_prestataire_a6', 'Des photos de vos vraies réalisations, et le respect des rendez-vous pris via Glownyo.'),
  },
];

const AccordionItem = ({ item, open, onToggle }) => (
  <div className="rounded-2xl border border-[#C9922A]/15 bg-[#0F0F0F] overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left"
    >
      <span className="font-display text-base sm:text-lg font-semibold">{item.q}</span>
      <ChevronDown
        size={20}
        className={`text-gold shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      />
    </button>
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-out"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">
        <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-[#F5F0E6]/70 leading-relaxed">
          {item.a}
        </p>
      </div>
    </div>
  </div>
);

const FAQSection = ({ title, items, idPrefix }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold">{title}</h2>
      <div className="mt-6 space-y-3">
        {items.map((item, i) => (
          <AccordionItem
            key={`${idPrefix}-${i}`}
            item={item}
            open={openIndex === i}
            onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
          />
        ))}
      </div>
    </section>
  );
};

const FAQPage = () => {
  const { t } = useSiteTexts();
  const clientFaq = buildClientFaq(t);
  const providerFaq = buildProviderFaq(t);
  return (
    <div className="pt-28 pb-24">
      <Helmet>
        <title>FAQ — GlowNyo</title>
        <meta
          name="description"
          content="Questions fréquentes GlowNyo : réservation, paiement, annulation pour les clients, et inscription, visibilité, tarifs pour les prestataires."
        />
      </Helmet>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <span className="text-xs tracking-widest uppercase text-gold">{t('faq_eyebrow', 'FAQ')}</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight max-w-3xl">
          {t('faq_titre', 'Questions fréquentes')}
        </h1>
        <p className="mt-5 text-[#F5F0E6]/70 text-lg max-w-2xl leading-relaxed">
          {t('faq_description', "Tout ce qu'il faut savoir pour réserver sereinement sur GlowNyo, ou pour rejoindre la plateforme en tant que prestataire.")}
        </p>
      </section>

      <div className="mx-auto max-w-[56rem] px-5 sm:px-8 mt-16 space-y-16">
        <FAQSection title={t('faq_clients_titre', 'Pour les clients')} items={clientFaq} idPrefix="client" />
        <FAQSection title={t('faq_prestataires_titre', 'Pour les prestataires')} items={providerFaq} idPrefix="prestataire" />
      </div>

      <section className="mx-auto max-w-[56rem] px-5 sm:px-8 mt-16">
        <div className="rounded-3xl border border-[#25D366]/30 bg-[#0F0F0F] p-8 sm:p-10 text-center">
          <p className="text-lg text-[#F5F0E6]/80">
            {t('faq_contact_texte', 'Vous ne trouvez pas votre réponse ?')}
          </p>
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-7 py-3.5 rounded-full hover:brightness-105 active:scale-95 transition"
          >
            <MessageCircle size={20} />
            {t('faq_contact_bouton', 'Contactez-nous sur WhatsApp')}
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
