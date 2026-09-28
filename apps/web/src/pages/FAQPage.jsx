import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { waLink } from '@/data/site';

const CLIENT_FAQ = [
  {
    q: "C'est quoi Glownyo ?",
    a: "Glownyo est une plateforme qui vous permet de trouver et réserver une prestation beauté ou bien-être au Bénin : coiffure, henné, ongles, esthétique, barbier… directement depuis votre téléphone.",
  },
  {
    q: 'Est-ce que c\'est pour les hommes aussi ?',
    a: 'Oui ! Glownyo est pour elle comme pour lui. Barbiers et soins homme ont toute leur place.',
  },
  {
    q: 'Est-ce que la réservation est payante ?',
    a: 'Non. Réserver sur Glownyo est gratuit. Vous payez uniquement votre prestation.',
  },
  {
    q: 'Comment je paie ma prestation ?',
    a: "Pour le moment, le paiement se fait directement sur place auprès de la prestataire. Le paiement par Mobile Money (MTN, Moov) arrive bientôt.",
  },
  {
    q: 'Comment je sais que mon rendez-vous est confirmé ?',
    a: 'Vous recevez une confirmation après votre réservation. La prestataire peut aussi vous contacter sur WhatsApp.',
  },
  {
    q: 'Je peux annuler mon rendez-vous ?',
    a: "Oui, depuis votre espace, au plus tard 48h avant le rendez-vous. Merci de prévenir le plus tôt possible : c'est du temps réservé pour vous.",
  },
  {
    q: 'Les photos des prestataires sont-elles réelles ?',
    a: "Oui. Chaque prestataire publie ses propres réalisations. L'authenticité est une valeur fondamentale de Glownyo.",
  },
];

const PROVIDER_FAQ = [
  {
    q: 'Qui peut s\'inscrire ?',
    a: 'Tout professionnel de la beauté ou du bien-être au Bénin : coiffeuse, barbier, nail artiste, artiste henné, esthéticienne, maquilleuse…',
  },
  {
    q: 'Combien ça coûte ?',
    a: "L'inscription est gratuite pendant la période de lancement. Les abonnements arriveront plus tard, et vous serez informé(e) bien à l'avance, sans surprise.",
  },
  {
    q: "Qu'est-ce que Glownyo m'apporte ?",
    a: 'Plus de visibilité, de nouveaux clients, et vos rendez-vous organisés au même endroit.',
  },
  {
    q: 'Comment je reçois mes réservations ?',
    a: 'Vous êtes notifié(e) à chaque nouvelle réservation, avec les coordonnées du client.',
  },
  {
    q: 'Je peux fixer mes propres prix ?',
    a: 'Oui. Vous choisissez vos prestations, vos tarifs et vos disponibilités.',
  },
  {
    q: "Qu'est-ce qu'on attend de moi ?",
    a: 'Des photos de vos vraies réalisations, et le respect des rendez-vous pris via Glownyo.',
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
        <span className="text-xs tracking-widest uppercase text-gold">FAQ</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight max-w-3xl">
          Questions fréquentes
        </h1>
        <p className="mt-5 text-[#F5F0E6]/70 text-lg max-w-2xl leading-relaxed">
          Tout ce qu'il faut savoir pour réserver sereinement sur GlowNyo, ou pour rejoindre la
          plateforme en tant que prestataire.
        </p>
      </section>

      <div className="mx-auto max-w-[56rem] px-5 sm:px-8 mt-16 space-y-16">
        <FAQSection title="Pour les clients" items={CLIENT_FAQ} idPrefix="client" />
        <FAQSection title="Pour les prestataires" items={PROVIDER_FAQ} idPrefix="prestataire" />
      </div>

      <section className="mx-auto max-w-[56rem] px-5 sm:px-8 mt-16">
        <div className="rounded-3xl border border-[#25D366]/30 bg-[#0F0F0F] p-8 sm:p-10 text-center">
          <p className="text-lg text-[#F5F0E6]/80">
            Vous ne trouvez pas votre réponse ?
          </p>
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-7 py-3.5 rounded-full hover:brightness-105 active:scale-95 transition"
          >
            <MessageCircle size={20} />
            Contactez-nous sur WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
