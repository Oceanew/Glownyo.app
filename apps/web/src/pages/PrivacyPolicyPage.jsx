import { Helmet } from 'react-helmet';
import useSiteTexts from '@/lib/useSiteTexts';

const SECTIONS = [
  { id: 'qui', title: '1. Qui sommes-nous ?' },
  { id: 'donnees', title: '2. Quelles données collectons-nous ?' },
  { id: 'pourquoi', title: '3. Pourquoi les utilisons-nous ?' },
  { id: 'partage', title: '4. Avec qui sont-elles partagées ?' },
  { id: 'duree', title: '5. Combien de temps les gardons-nous ?' },
  { id: 'droits', title: '6. Vos droits' },
  { id: 'securite', title: '7. Sécurité' },
  { id: 'cookies', title: '8. Cookies' },
  { id: 'cadre-legal', title: '9. Cadre légal' },
  { id: 'modifications', title: '10. Modifications' },
];

const H2 = ({ children }) => (
  <h2 className="font-display text-2xl font-semibold">{children}</h2>
);

const P = ({ children }) => (
  <p className="mt-4 text-[#F5F0E6]/70 leading-relaxed">{children}</p>
);

// Renders a "Lead-in : rest of the sentence" line with the lead-in bolded,
// the way the source policy formats each bullet — falls back to a plain
// bullet if the (admin-edited) text no longer has a colon.
const Bullet = ({ children }) => {
  const idx = children.indexOf(' : ');
  if (idx === -1) {
    return <li>{children}</li>;
  }
  return (
    <li>
      <strong className="text-[#F5F0E6]">{children.slice(0, idx)}</strong>
      {children.slice(idx)}
    </li>
  );
};

const Ul = ({ children }) => (
  <ul className="mt-4 space-y-2 text-[#F5F0E6]/70 leading-relaxed list-disc pl-5 marker:text-gold">
    {children}
  </ul>
);

const PrivacyPolicyPage = () => {
  const { t } = useSiteTexts();

  const listeFinalites = t(
    'confidentialite_s3_liste',
    "Créer et gérer votre compte\nPermettre et confirmer vos réservations\nVous envoyer les emails liés à votre compte et à vos rendez-vous\nAfficher les profils des prestataires\nAméliorer le service et assurer sa sécurité",
  )
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="pt-28 pb-24">
      <Helmet>
        <title>Politique de confidentialité — GlowNyo</title>
        <meta
          name="description"
          content="Comment GlowNyo collecte, utilise et protège vos données personnelles."
        />
      </Helmet>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <span className="text-xs tracking-widest uppercase text-gold">Vie privée</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight max-w-3xl">
          {t('confidentialite_titre', 'Politique de confidentialité')}
        </h1>
        <p className="mt-3 text-sm text-[#F5F0E6]/45">
          Dernière mise à jour : {t('confidentialite_date_maj', '23/10/2026')}
        </p>
      </section>

      <div className="mx-auto max-w-[72rem] px-5 sm:px-8 mt-14 grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">
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
          <section id="qui" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>1. Qui sommes-nous ?</H2>
            <P>{t('confidentialite_s1_texte', "Glownyo est une plateforme de réservation de prestations beauté et bien-être au Bénin, éditée par Océane Worou. Contact : glownyoapp@gmail.com")}</P>
          </section>

          <section id="donnees" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>2. Quelles données collectons-nous ?</H2>
            <Ul>
              <Bullet>{t('confidentialite_s2_comptes', 'Pour tous les comptes : nom, prénom, email, numéro de téléphone ou WhatsApp, mot de passe (crypté, jamais lisible).')}</Bullet>
              <Bullet>{t('confidentialite_s2_google', "Connexion avec Google : nom, email et photo de profil transmis par Google. Nous n'avons jamais accès à votre mot de passe Google.")}</Bullet>
              <Bullet>{t('confidentialite_s2_reservations', 'Réservations : prestation choisie, date, heure, prestataire, notes éventuelles.')}</Bullet>
              <Bullet>{t('confidentialite_s2_prestataires', 'Prestataires : nom ou nom commercial, quartier, prestations, tarifs, disponibilités, photos et vidéos de réalisations.')}</Bullet>
              <Bullet>{t('confidentialite_s2_parrainage', "Parrainage : la personne qui vous a recommandé Glownyo, si vous l'indiquez.")}</Bullet>
            </Ul>
          </section>

          <section id="pourquoi" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>3. Pourquoi les utilisons-nous ?</H2>
            <Ul>
              {listeFinalites.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </Ul>
            <P>{t('confidentialite_s3_conclusion', 'Nous ne vendons jamais vos données.')}</P>
          </section>

          <section id="partage" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>4. Avec qui sont-elles partagées ?</H2>
            <Ul>
              <Bullet>{t('confidentialite_s4_prestataire', "Avec le ou la prestataire réservé·e : uniquement les informations utiles au rendez-vous (nom, téléphone, prestation, date).")}</Bullet>
              <Bullet>{t('confidentialite_s4_outils', "Avec nos outils techniques, uniquement pour faire fonctionner le service : hébergement ([PocketBase Cloud / Vercel]), envoi d'emails (Brevo), connexion (Google).")}</Bullet>
            </Ul>
          </section>

          <section id="duree" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>5. Combien de temps les gardons-nous ?</H2>
            <P>{t('confidentialite_s5_texte', 'Tant que votre compte est actif. Après suppression du compte, vos données sont effacées sous [30] jours, sauf obligation légale de les conserver.')}</P>
          </section>

          <section id="droits" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>6. Vos droits</H2>
            <P>{t('confidentialite_s6_texte', 'Vous pouvez à tout moment demander à consulter, corriger ou supprimer vos données, ou supprimer votre compte, en écrivant à [email de contact]. Nous répondons sous 30 jours maximum.')}</P>
          </section>

          <section id="securite" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>7. Sécurité</H2>
            <P>{t('confidentialite_s7_texte', 'Mots de passe cryptés, connexion sécurisée (HTTPS), accès limité : chaque personne ne voit que ses propres données.')}</P>
          </section>

          <section id="cookies" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>8. Cookies</H2>
            <P>{t('confidentialite_s8_texte', "Glownyo utilise uniquement les cookies nécessaires à son fonctionnement (rester connecté·e). Aucun cookie publicitaire.")}</P>
          </section>

          <section id="cadre-legal" className="scroll-mt-32 sm:scroll-mt-40">
            <H2>9. Cadre légal</H2>
            <P>{t('confidentialite_s9_texte', 'Cette politique s\'appuie sur la loi béninoise de protection des données (Code du numérique, autorité : APDP) et sur le RGPD européen.')}</P>
          </section>

          <section id="modifications" className="scroll-mt-32 sm:scroll-mt-40 pb-4">
            <H2>10. Modifications</H2>
            <P>{t('confidentialite_s10_texte', 'Cette politique peut évoluer. En cas de changement important, vous serez informé·e par email ou sur l\'application.')}</P>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
