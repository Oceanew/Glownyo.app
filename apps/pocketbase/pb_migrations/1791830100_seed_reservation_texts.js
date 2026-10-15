/// <reference path="../pb_data/types.d.ts" />

// Seeds `textes_site` with the current copy of the Réservation (booking)
// page, so Oceane can edit it from "Textes du site" the same way as the
// other pages — publishing this migration changes nothing visually, the
// frontend already falls back to this same hardcoded text.
//
// Scope: the page's narrative/informational copy (headings, descriptions,
// button labels) — not the form field labels (Nom complet, Téléphone...),
// which are form chrome rather than content, nor the dynamic error/status
// messages tied to a specific technical state, consistent with how the
// other pages were scoped.
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("textes_site");

    const entries = [
      { cle: "reservation_eyebrow", page: "reservation", nom: "Réservation — Étiquette", valeur: "Réservation" },
      { cle: "reservation_titre", page: "reservation", nom: "Réservation — Titre principal", valeur: "Prenez rendez-vous" },
      { cle: "reservation_description", page: "reservation", nom: "Réservation — Description sous le titre", valeur: "Renseignez vos préférences ci-dessous. Votre demande est enregistrée automatiquement et transmise à votre prestataire. Réglez en toute sécurité par Mobile Money grâce à FedaPay." },
      { cle: "reservation_bouton_envoyer", page: "reservation", nom: "Réservation — Bouton « Envoyer ma demande »", valeur: "Envoyer ma demande" },
      { cle: "reservation_side_paiement_titre", page: "reservation", nom: "Réservation — Encart latéral « Paiement sécurisé » : titre", valeur: "Paiement sécurisé FedaPay" },
      { cle: "reservation_side_paiement_description", page: "reservation", nom: "Réservation — Encart latéral « Paiement sécurisé » : description", valeur: "Réglez vos prestations en toute sécurité une fois votre demande envoyée." },
      { cle: "reservation_side_confirmation_titre", page: "reservation", nom: "Réservation — Encart latéral « Confirmation directe » : titre", valeur: "Confirmation directe" },
      { cle: "reservation_side_confirmation_description", page: "reservation", nom: "Réservation — Encart latéral « Confirmation directe » : description", valeur: "Votre demande est envoyée directement à votre prestataire, qui vous recontacte pour confirmer votre créneau. Aucun agenda externe, tout se passe ici." },
      { cle: "reservation_confirmation_titre", page: "reservation", nom: "Réservation — Après envoi : titre « Demande enregistrée »", valeur: "Demande enregistrée" },
      { cle: "reservation_confirmation_description", page: "reservation", nom: "Réservation — Après envoi : description", valeur: "Votre demande a bien été enregistrée et transmise à votre prestataire ainsi qu'à l'équipe GlowNyo. Votre prestataire vous contactera rapidement pour confirmer votre créneau. Vous pouvez aussi confirmer les détails via WhatsApp." },
      { cle: "reservation_acompte_titre", page: "reservation", nom: "Réservation — Bloc acompte : titre", valeur: "Réglez votre acompte en toute sécurité" },
      { cle: "reservation_acompte_description", page: "reservation", nom: "Réservation — Bloc acompte : description", valeur: "Le paiement est traité par FedaPay, notre partenaire de paiement sécurisé agréé pour l'Afrique de l'Ouest." },
      { cle: "reservation_acompte_mention_securite", page: "reservation", nom: "Réservation — Bloc acompte : mention de sécurité", valeur: "Paiement chiffré et sécurisé par FedaPay" },
      { cle: "reservation_bouton_whatsapp_confirmer", page: "reservation", nom: "Réservation — Bouton « Confirmer sur WhatsApp »", valeur: "Confirmer sur WhatsApp" },
      { cle: "reservation_bouton_whatsapp_equipe", page: "reservation", nom: "Réservation — Bouton « Contacter l'équipe de GlowNyo »", valeur: "Contacter l'équipe de GlowNyo" },
      { cle: "reservation_espace_pret_titre", page: "reservation", nom: "Réservation — Compte existant : titre", valeur: "Votre espace client est prêt" },
      { cle: "reservation_espace_pret_description", page: "reservation", nom: "Réservation — Compte existant : description", valeur: "Retrouvez et gérez tous vos rendez-vous GlowNyo depuis votre espace personnel." },
      { cle: "reservation_bouton_voir_rdv", page: "reservation", nom: "Réservation — Bouton « Voir mes rendez-vous »", valeur: "Voir mes rendez-vous" },
      { cle: "reservation_creer_compte_titre", page: "reservation", nom: "Réservation — Création de compte : titre", valeur: "Créer un compte (facultatif)" },
      { cle: "reservation_creer_compte_description", page: "reservation", nom: "Réservation — Création de compte : description", valeur: "Pour consulter et gérer vos rendez-vous à tout moment. La réservation reste possible sans compte." },
      { cle: "reservation_bouton_creer_compte", page: "reservation", nom: "Réservation — Bouton « Créer mon compte »", valeur: "Créer mon compte" },
      { cle: "reservation_lien_deja_compte", page: "reservation", nom: "Réservation — Lien « J'ai déjà un compte »", valeur: "J'ai déjà un compte" },
      { cle: "reservation_bouton_modifier", page: "reservation", nom: "Réservation — Lien « Modifier ma demande »", valeur: "Modifier ma demande" },
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
      const records = app.findRecordsByFilter("textes_site", 'page = "reservation"', "", 0, 0);
      for (const record of records) {
        app.delete(record);
      }
    } catch (e) {
      // collection gone already — fine.
    }
  },
);
