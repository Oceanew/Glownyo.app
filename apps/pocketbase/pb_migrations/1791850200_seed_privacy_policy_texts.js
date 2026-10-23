/// <reference path="../pb_data/types.d.ts" />

// Seeds `textes_site` with the Privacy Policy copy supplied by Oceane, so
// the page can be edited from "Textes du site" the same way as the other
// pages. A few values in the source text are left as literal bracketed
// placeholders ([30], [email de contact], [PocketBase Cloud / Vercel]) —
// she asked for those to stay untouched until she fills them in herself.
//
// confidentialite_s3_liste holds five short items separated by "\n" (one
// field, rendered as a bullet list) rather than five separate keys, since
// they're short parallel phrases edited together as a block.
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("textes_site");

    const entries = [
      { cle: "confidentialite_titre", page: "confidentialite", nom: "Confidentialité — Titre principal", valeur: "Politique de confidentialité" },
      { cle: "confidentialite_date_maj", page: "confidentialite", nom: "Confidentialité — Date de dernière mise à jour", valeur: "23/10/2026" },
      { cle: "confidentialite_s1_texte", page: "confidentialite", nom: "Confidentialité — 1. Qui sommes-nous ?", valeur: "Glownyo est une plateforme de réservation de prestations beauté et bien-être au Bénin, éditée par Océane Worou. Contact : glownyoapp@gmail.com" },
      { cle: "confidentialite_s2_comptes", page: "confidentialite", nom: "Confidentialité — 2. Données : pour tous les comptes", valeur: "Pour tous les comptes : nom, prénom, email, numéro de téléphone ou WhatsApp, mot de passe (crypté, jamais lisible)." },
      { cle: "confidentialite_s2_google", page: "confidentialite", nom: "Confidentialité — 2. Données : connexion avec Google", valeur: "Connexion avec Google : nom, email et photo de profil transmis par Google. Nous n'avons jamais accès à votre mot de passe Google." },
      { cle: "confidentialite_s2_reservations", page: "confidentialite", nom: "Confidentialité — 2. Données : réservations", valeur: "Réservations : prestation choisie, date, heure, prestataire, notes éventuelles." },
      { cle: "confidentialite_s2_prestataires", page: "confidentialite", nom: "Confidentialité — 2. Données : prestataires", valeur: "Prestataires : nom ou nom commercial, quartier, prestations, tarifs, disponibilités, photos et vidéos de réalisations." },
      { cle: "confidentialite_s2_parrainage", page: "confidentialite", nom: "Confidentialité — 2. Données : parrainage", valeur: "Parrainage : la personne qui vous a recommandé Glownyo, si vous l'indiquez." },
      { cle: "confidentialite_s3_liste", page: "confidentialite", nom: "Confidentialité — 3. Pourquoi : liste (une par ligne)", valeur: "Créer et gérer votre compte\nPermettre et confirmer vos réservations\nVous envoyer les emails liés à votre compte et à vos rendez-vous\nAfficher les profils des prestataires\nAméliorer le service et assurer sa sécurité" },
      { cle: "confidentialite_s3_conclusion", page: "confidentialite", nom: "Confidentialité — 3. Pourquoi : phrase de conclusion", valeur: "Nous ne vendons jamais vos données." },
      { cle: "confidentialite_s4_prestataire", page: "confidentialite", nom: "Confidentialité — 4. Partage : avec le/la prestataire", valeur: "Avec le ou la prestataire réservé·e : uniquement les informations utiles au rendez-vous (nom, téléphone, prestation, date)." },
      { cle: "confidentialite_s4_outils", page: "confidentialite", nom: "Confidentialité — 4. Partage : avec nos outils techniques", valeur: "Avec nos outils techniques, uniquement pour faire fonctionner le service : hébergement ([PocketBase Cloud / Vercel]), envoi d'emails (Brevo), connexion (Google)." },
      { cle: "confidentialite_s5_texte", page: "confidentialite", nom: "Confidentialité — 5. Durée de conservation", valeur: "Tant que votre compte est actif. Après suppression du compte, vos données sont effacées sous [30] jours, sauf obligation légale de les conserver." },
      { cle: "confidentialite_s6_texte", page: "confidentialite", nom: "Confidentialité — 6. Vos droits", valeur: "Vous pouvez à tout moment demander à consulter, corriger ou supprimer vos données, ou supprimer votre compte, en écrivant à [email de contact]. Nous répondons sous 30 jours maximum." },
      { cle: "confidentialite_s7_texte", page: "confidentialite", nom: "Confidentialité — 7. Sécurité", valeur: "Mots de passe cryptés, connexion sécurisée (HTTPS), accès limité : chaque personne ne voit que ses propres données." },
      { cle: "confidentialite_s8_texte", page: "confidentialite", nom: "Confidentialité — 8. Cookies", valeur: "Glownyo utilise uniquement les cookies nécessaires à son fonctionnement (rester connecté·e). Aucun cookie publicitaire." },
      { cle: "confidentialite_s9_texte", page: "confidentialite", nom: "Confidentialité — 9. Cadre légal", valeur: "Cette politique s'appuie sur la loi béninoise de protection des données (Code du numérique, autorité : APDP) et sur le RGPD européen." },
      { cle: "confidentialite_s10_texte", page: "confidentialite", nom: "Confidentialité — 10. Modifications", valeur: "Cette politique peut évoluer. En cas de changement important, vous serez informé·e par email ou sur l'application." },
      { cle: "footer_lien_confidentialite", page: "pied-de-page", nom: "Pied de page — Lien « Politique de confidentialité »", valeur: "Politique de confidentialité" },
    ];

    for (const entry of entries) {
      let existing = null;
      try {
        existing = app.findFirstRecordByFilter("textes_site", "cle = {:cle}", { cle: entry.cle });
      } catch (e) {
        existing = null;
      }
      if (existing) continue;

      const record = new Record(collection, entry);
      app.save(record);
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter("textes_site", 'page = "confidentialite" || cle = "footer_lien_confidentialite"', "", 0, 0);
      for (const record of records) {
        app.delete(record);
      }
    } catch (e) {
      // collection gone already — fine.
    }
  },
);
