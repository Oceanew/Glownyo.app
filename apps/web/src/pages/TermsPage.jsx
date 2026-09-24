import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { EMAIL, waLink } from '@/data/site';

const SECTIONS = [
  { id: 'objet', title: '1. Objet' },
  { id: 'definitions', title: '2. Définitions' },
  { id: 'acceptation', title: '3. Acceptation des CGV' },
  { id: 'role', title: '4. Rôle de GlowNyo' },
  { id: 'compte', title: '5. Compte utilisateur' },
  { id: 'reservation', title: '6. Processus de réservation' },
  { id: 'tarifs', title: '7. Tarifs et paiement' },
  { id: 'annulation', title: '8. Annulation, modification et absence' },
  { id: 'obligations-client', title: '9. Obligations du client' },
  { id: 'obligations-prestataire', title: '10. Statut et obligations du prestataire' },
  { id: 'responsabilite', title: '11. Responsabilité' },
  { id: 'donnees', title: '12. Données personnelles' },
  { id: 'propriete', title: '13. Propriété intellectuelle' },
  { id: 'droit', title: '14. Droit applicable et litiges' },
  { id: 'modification', title: '15. Modification des CGV' },
  { id: 'contact', title: '16. Contact' },
];

const H2 = ({ children }) => (
  <h2 className="font-display text-2xl font-semibold">{children}</h2>
);

const P = ({ children }) => (
  <p className="mt-4 text-[#F5F0E6]/70 leading-relaxed">{children}</p>
);

const Ul = ({ children }) => (
  <ul className="mt-4 space-y-2 text-[#F5F0E6]/70 leading-relaxed list-disc pl-5 marker:text-gold">
    {children}
  </ul>
);

const TermsPage = () => {
  return (
    <div className="pt-28 pb-24">
      <Helmet>
        <title>Conditions générales de vente — GlowNyo</title>
        <meta
          name="description"
          content="Conditions générales de vente de GlowNyo : réservation, tarifs, paiement Mobile Money, annulation et responsabilité entre clients et prestataires."
        />
      </Helmet>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <span className="text-xs tracking-widest uppercase text-gold">Conditions générales</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight max-w-3xl">
          Conditions générales de vente
        </h1>
        <p className="mt-5 text-[#F5F0E6]/70 text-lg max-w-2xl leading-relaxed">
          Applicables à toute réservation effectuée sur GlowNyo entre un client et une prestataire
          beauté &amp; bien-être référencée sur la plateforme.
        </p>
        <p className="mt-3 text-sm text-[#F5F0E6]/45">Dernière mise à jour : 24 septembre 2026</p>
      </section>

      <div className="mx-auto max-w-[72rem] px-5 sm:px-8 mt-14 grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-16 items-start">
        {/* Sommaire */}
        <nav
          aria-label="Sommaire"
          className="lg:sticky lg:top-32 rounded-2xl border border-[#C9922A]/15 bg-[#0F0F0F] p-5"
        >
          <p className="text-xs tracking-widest uppercase text-gold mb-3">Sommaire</p>
          <ul className="space-y-2 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#F5F0E6]/60 hover:text-gold transition">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Corps du texte */}
        <div className="max-w-[68ch] space-y-12">
          <section id="objet" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>1. Objet</H2>
            <P>
              Les présentes conditions générales de vente (les « CGV ») régissent l'utilisation de la
              plateforme GlowNyo (le « Site », accessible à l'adresse glownyo.app) et les réservations de
              prestations beauté &amp; bien-être effectuées par son intermédiaire entre un client (la
              « Cliente » ou le « Client ») et une professionnelle indépendante référencée sur le Site (la
              « Prestataire »). Toute réservation effectuée sur GlowNyo implique l'acceptation pleine et
              entière des présentes CGV.
            </P>
          </section>

          <section id="definitions" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>2. Définitions</H2>
            <Ul>
              <li><strong className="text-[#F5F0E6]">Plateforme / GlowNyo</strong> — le site glownyo.app et les services associés (annuaire de prestataires, formulaire de réservation, paiement en ligne).</li>
              <li><strong className="text-[#F5F0E6]">Client</strong> — toute personne qui consulte le Site ou effectue une réservation, avec ou sans compte.</li>
              <li><strong className="text-[#F5F0E6]">Prestataire</strong> — la professionnelle indépendante (coiffure, henné, esthétique, manucure/pédicure, barbier, bien-être...) référencée sur GlowNyo, qui exécute la prestation réservée.</li>
              <li><strong className="text-[#F5F0E6]">Réservation</strong> — la demande de rendez-vous soumise via le formulaire de la page « Réservation ».</li>
              <li><strong className="text-[#F5F0E6]">Prestation</strong> — le service beauté ou bien-être exécuté par la Prestataire au bénéfice du Client.</li>
            </Ul>
          </section>

          <section id="acceptation" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>3. Acceptation des CGV</H2>
            <P>
              En soumettant une réservation, en créant un compte ou en s'inscrivant comme Prestataire sur
              GlowNyo, l'utilisateur reconnaît avoir pris connaissance des présentes CGV et les accepte sans
              réserve. Si le Client n'accepte pas ces CGV, il est invité à ne pas utiliser le Site.
            </P>
          </section>

          <section id="role" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>4. Rôle de GlowNyo</H2>
            <P>
              GlowNyo est une plateforme de <strong className="text-[#F5F0E6]">mise en relation</strong>{' '}
              entre Clients et Prestataires indépendantes. GlowNyo facilite la prise de rendez-vous et, le
              cas échéant, le paiement d'un acompte en ligne, mais{' '}
              <strong className="text-[#F5F0E6]">n'exécute elle-même aucune prestation</strong> beauté ou
              bien-être. Le contrat de prestation de service est conclu directement entre le Client et la
              Prestataire ; GlowNyo n'est pas partie à ce contrat.
            </P>
          </section>

          <section id="compte" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>5. Compte utilisateur</H2>
            <P>
              La création d'un compte client est <strong className="text-[#F5F0E6]">facultative</strong> :
              une réservation peut être effectuée sans compte. Un compte permet de retrouver l'historique de
              ses rendez-vous. Le Client s'engage à fournir des informations exactes et à préserver la
              confidentialité de son mot de passe. Toute Prestataire inscrite via le formulaire « Devenir
              prestataire » fait l'objet d'une validation par l'équipe GlowNyo avant activation de son
              espace.
            </P>
          </section>

          <section id="reservation" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>6. Processus de réservation</H2>
            <P>
              Le Client sélectionne une Prestataire (ou laisse GlowNyo lui en recommander une), une
              prestation, une date et une heure souhaitées, puis soumet sa demande. Cette demande est
              transmise à la Prestataire concernée, qui recontacte le Client (téléphone, WhatsApp ou email)
              pour confirmer le créneau. <strong className="text-[#F5F0E6]">La réservation n'est
              définitivement confirmée qu'après cet accord de la Prestataire</strong> — GlowNyo ne garantit
              pas la disponibilité d'un créneau tant qu'il n'a pas été confirmé par la Prestataire.
            </P>
          </section>

          <section id="tarifs" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>7. Tarifs et paiement</H2>
            <P>
              Les tarifs affichés sur les fiches Prestataires sont indiqués en francs CFA (FCFA) et fixés
              librement par chaque Prestataire ; ils peuvent varier selon la prestation exacte, appréciée au
              moment du rendez-vous. GlowNyo permet, lorsque cette option est disponible, le règlement d'un
              acompte en ligne par Mobile Money (MTN Mobile Money, Moov Money) ou carte bancaire, via son
              partenaire de paiement sécurisé <strong className="text-[#F5F0E6]">FedaPay</strong>. Le solde
              de la prestation, lorsqu'un acompte a été versé, ou l'intégralité du montant lorsque aucun
              paiement en ligne n'a été effectué, est réglé{' '}
              <strong className="text-[#F5F0E6]">directement à la Prestataire</strong> selon les modalités
              convenues avec elle (espèces, Mobile Money, etc.).
            </P>
            <P>
              GlowNyo ne conserve aucune donnée de carte bancaire ; ces informations sont traitées
              directement par FedaPay dans le respect des standards de sécurité applicables aux paiements en
              ligne.
            </P>
          </section>

          <section id="annulation" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>8. Annulation, modification et absence</H2>
            <P>
              Le Client peut annuler une réservation depuis son espace « Mes rendez-vous », ou en contactant
              directement la Prestataire ou l'équipe GlowNyo. Il est demandé d'annuler ou de modifier un
              rendez-vous <strong className="text-[#F5F0E6]">le plus tôt possible</strong>, par courtoisie
              envers la Prestataire, idéalement au moins 24 heures à l'avance. Un acompte versé en ligne
              peut être retenu par la Prestataire en cas d'annulation tardive ou d'absence non signalée
              (« no-show ») ; les conditions d'annulation propres à chaque Prestataire, lorsqu'elles
              existent, prévalent et sont communicables sur demande directe. Toute demande de remboursement
              d'un acompte doit être adressée à l'équipe GlowNyo, qui la transmettra à la Prestataire
              concernée.
            </P>
          </section>

          <section id="obligations-client" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>9. Obligations du client</H2>
            <Ul>
              <li>Fournir des informations exactes et à jour lors de la réservation (nom, téléphone, email).</li>
              <li>Se présenter au rendez-vous convenu avec la Prestataire, à l'heure fixée.</li>
              <li>Régler la prestation selon les modalités convenues avec la Prestataire.</li>
              <li>Faire preuve de courtoisie envers les Prestataires et l'équipe GlowNyo.</li>
            </Ul>
          </section>

          <section id="obligations-prestataire" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>10. Statut et obligations du prestataire</H2>
            <P>
              Chaque Prestataire référencée sur GlowNyo est une professionnelle{' '}
              <strong className="text-[#F5F0E6]">indépendante</strong>, qui n'est ni salariée, ni mandataire,
              ni agente de GlowNyo. Elle demeure seule responsable de la qualité, de la sécurité et de la
              bonne exécution des prestations qu'elle propose, du respect des règles d'hygiène applicables à
              son activité, ainsi que de ses obligations fiscales et administratives propres. En s'inscrivant
              sur GlowNyo, la Prestataire s'engage à fournir des informations exactes sur son profil, ses
              prestations et ses tarifs, et à honorer les rendez-vous qu'elle a confirmés.
            </P>
          </section>

          <section id="responsabilite" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>11. Responsabilité</H2>
            <P>
              GlowNyo met tout en œuvre pour assurer la fiabilité de sa plateforme et la pertinence des
              informations qui y figurent, mais ne saurait être tenue responsable :
            </P>
            <Ul>
              <li>de la qualité, de la conformité ou des conséquences d'une prestation exécutée par une Prestataire ;</li>
              <li>d'un retard, d'une annulation ou d'une absence imputable au Client ou à la Prestataire ;</li>
              <li>d'un différend survenant entre un Client et une Prestataire relatif à l'exécution de la prestation ou à son règlement ;</li>
              <li>d'une interruption temporaire du Site liée à la maintenance, à une panne technique ou à un cas de force majeure.</li>
            </Ul>
            <P>
              GlowNyo s'engage néanmoins à examiner tout signalement transmis via la page{' '}
              <Link to="/contact" className="text-gold hover:brightness-110 transition">Contact</Link> et à
              prendre les mesures appropriées vis-à-vis d'une Prestataire (avertissement, suspension) en cas
              de manquement avéré et répété à ses obligations.
            </P>
          </section>

          <section id="donnees" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>12. Données personnelles</H2>
            <P>
              Les données collectées lors d'une réservation ou de la création d'un compte (nom, téléphone,
              email, historique de rendez-vous) sont utilisées exclusivement pour la mise en relation entre
              le Client et la Prestataire, la gestion du compte et l'amélioration du service, et ne sont en
              aucun cas revendues à des tiers. Elles sont conservées le temps nécessaire à ces finalités.
              Tout Client peut demander l'accès, la rectification ou la suppression de ses données en
              écrivant à{' '}
              <a href={`mailto:${EMAIL}`} className="text-gold hover:brightness-110 transition">{EMAIL}</a>.
            </P>
          </section>

          <section id="propriete" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>13. Propriété intellectuelle</H2>
            <P>
              Le nom « GlowNyo », son logo, la charte graphique et l'ensemble des contenus du Site (textes,
              visuels, mise en page) sont la propriété de GlowNyo ou de ses partenaires et sont protégés par
              le droit de la propriété intellectuelle. Toute reproduction ou utilisation non autorisée est
              interdite. Les photographies des Prestataires et de leurs réalisations restent la propriété de
              leurs auteurs respectifs, publiées avec leur accord.
            </P>
          </section>

          <section id="droit" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>14. Droit applicable et litiges</H2>
            <P>
              Les présentes CGV sont soumises au droit béninois. En cas de litige relatif à l'utilisation du
              Site ou à une réservation, le Client est invité à contacter en priorité l'équipe GlowNyo pour
              une résolution amiable via la page{' '}
              <Link to="/contact" className="text-gold hover:brightness-110 transition">Contact</Link>{' '}
              ou{' '}
              <a href={waLink('Bonjour GlowNyo, je souhaite signaler un litige concernant ma réservation.')} target="_blank" rel="noreferrer" className="text-gold hover:brightness-110 transition">
                WhatsApp
              </a>. À défaut de résolution amiable, les tribunaux compétents du Bénin seront seuls saisis.
            </P>
          </section>

          <section id="modification" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>15. Modification des CGV</H2>
            <P>
              GlowNyo se réserve le droit de modifier les présentes CGV à tout moment, notamment pour
              refléter une évolution du Site ou de la réglementation applicable. La version en vigueur est
              celle publiée sur cette page, avec sa date de dernière mise à jour. Il est recommandé de la
              consulter régulièrement.
            </P>
          </section>

          <section id="contact" className="scroll-mt-32 sm:scroll-mt-40 pb-4">
            <H2>16. Contact</H2>
            <P>
              Pour toute question relative aux présentes CGV : {' '}
              <a href={`mailto:${EMAIL}`} className="text-gold hover:brightness-110 transition">{EMAIL}</a>
              {' '}ou{' '}
              <a href={waLink()} target="_blank" rel="noreferrer" className="text-gold hover:brightness-110 transition">
                WhatsApp
              </a>. Équipe GlowNyo — Cotonou, Bénin.
            </P>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
