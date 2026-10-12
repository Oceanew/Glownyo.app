/// <reference path="../pb_data/types.d.ts" />

// Seeds every entry in `textes_site` with the exact text already live on the
// site today, so publishing this migration changes nothing visually — the
// frontend is wired to fall back to the same hardcoded string whenever a key
// is missing, but after this migration every key exists, so the DB value is
// what actually renders (and is what the admin "Textes du site" page edits).
//
// Two spots keep an inline styled accent split into its own field: the
// homepage hero title (two lines, second one gold) — GlowNyo's single most
// visible brand element. Every other paragraph that used to have a short
// inline gold/italic word inside a longer sentence is stored as one plain
// field instead (the word's special color is dropped so the whole sentence
// is a single, simply editable field).
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("textes_site");

    const entries = [
      // --- ACCUEIL ---------------------------------------------------
      { cle: "accueil_hero_titre_1", page: "accueil", nom: "Accueil — Titre principal (ligne 1)", valeur: "Rayonne de l'intérieur," },
      { cle: "accueil_hero_titre_2", page: "accueil", nom: "Accueil — Titre principal (ligne 2, en or)", valeur: "brille de l'extérieur" },
      { cle: "accueil_hero_description", page: "accueil", nom: "Accueil — Description sous le titre", valeur: "La plateforme afro-moderne qui connecte les clients aux prestataires beauté & bien-être de référence au Bénin et en Afrique. Réservez en quelques clics, payez en Mobile Money." },
      { cle: "accueil_hero_bouton_reserver", page: "accueil", nom: "Accueil — Bouton « Réserver un rendez-vous »", valeur: "Réserver un rendez-vous" },
      { cle: "accueil_hero_bouton_decouvrir", page: "accueil", nom: "Accueil — Bouton « Découvrir les prestataires »", valeur: "Découvrir les prestataires" },
      { cle: "accueil_valeur1_titre", page: "accueil", nom: "Accueil — Atout 1 : titre", valeur: "Réservation instantanée" },
      { cle: "accueil_valeur1_description", page: "accueil", nom: "Accueil — Atout 1 : description", valeur: "Choisissez votre prestataire, un créneau et confirmez en quelques clics." },
      { cle: "accueil_valeur2_titre", page: "accueil", nom: "Accueil — Atout 2 : titre", valeur: "Paiement Mobile Money" },
      { cle: "accueil_valeur2_description", page: "accueil", nom: "Accueil — Atout 2 : description", valeur: "Réglez en toute simplicité avec FedaPay — MTN, Moov et cartes acceptées." },
      { cle: "accueil_valeur3_titre", page: "accueil", nom: "Accueil — Atout 3 : titre", valeur: "Prestataires de confiance" },
      { cle: "accueil_valeur3_description", page: "accueil", nom: "Accueil — Atout 3 : description", valeur: "Chaque personne prestataire est sélectionnée pour son savoir-faire et sa fiabilité." },
      { cle: "accueil_talents_label", page: "accueil", nom: "Accueil — Étiquette section prestataires", valeur: "Nos talents" },
      { cle: "accueil_talents_titre", page: "accueil", nom: "Accueil — Titre section prestataires", valeur: "Prestataires à la une" },
      { cle: "accueil_talents_lien", page: "accueil", nom: "Accueil — Lien « Voir toutes les prestataires »", valeur: "Voir toutes les prestataires" },
      { cle: "accueil_actualites_label", page: "accueil", nom: "Accueil — Étiquette section actualités", valeur: "Du nouveau" },
      { cle: "accueil_actualites_titre", page: "accueil", nom: "Accueil — Titre section actualités", valeur: "Actualités" },
      { cle: "accueil_actualites_lien", page: "accueil", nom: "Accueil — Lien « Voir toutes les actualités »", valeur: "Voir toutes les actualités" },
      { cle: "accueil_lancement_badge", page: "accueil", nom: "Accueil — Badge « Offre de lancement »", valeur: "Offre de lancement" },
      { cle: "accueil_lancement_titre", page: "accueil", nom: "Accueil — Titre offre de lancement", valeur: "Inscrivez-vous gratuitement pendant le lancement" },
      { cle: "accueil_lancement_description", page: "accueil", nom: "Accueil — Description offre de lancement", valeur: "GlowNyo ouvre ses portes aux prestataires beauté & bien-être d'Afrique. Profitez de l'offre de lancement pour rejoindre la plateforme sans aucun frais — places limitées, inscriptions clôturées à la fin du lancement." },
      { cle: "accueil_benefice1_titre", page: "accueil", nom: "Accueil — Bénéfice 1 : titre", valeur: "Visibilité immédiate" },
      { cle: "accueil_benefice1_description", page: "accueil", nom: "Accueil — Bénéfice 1 : description", valeur: "Votre profil devant des centaines de personnes clientes dès le premier jour." },
      { cle: "accueil_benefice2_titre", page: "accueil", nom: "Accueil — Bénéfice 2 : titre", valeur: "Zéro commission pendant le lancement" },
      { cle: "accueil_benefice2_description", page: "accueil", nom: "Accueil — Bénéfice 2 : description", valeur: "Gardez 100 % de vos revenus, sans frais cachés." },
      { cle: "accueil_benefice3_titre", page: "accueil", nom: "Accueil — Bénéfice 3 : titre", valeur: "Réservations simplifiées" },
      { cle: "accueil_benefice3_description", page: "accueil", nom: "Accueil — Bénéfice 3 : description", valeur: "Un agenda en ligne, un paiement Mobile Money intégré, zéro paperasse." },
      { cle: "accueil_lancement_bouton_inscription", page: "accueil", nom: "Accueil — Bouton « Je m'inscris gratuitement »", valeur: "Je m'inscris gratuitement" },
      { cle: "accueil_lancement_bouton_appel", page: "accueil", nom: "Accueil — Bouton « Réserver un appel avec GlowNyo »", valeur: "Réserver un appel avec GlowNyo" },
      { cle: "accueil_lancement_bouton_whatsapp", page: "accueil", nom: "Accueil — Bouton « Contacter l'équipe sur WhatsApp »", valeur: "Contacter l'équipe sur WhatsApp" },
      { cle: "accueil_lancement_mention", page: "accueil", nom: "Accueil — Mention sous les boutons d'inscription", valeur: "Inscription en 2 minutes · Sans engagement" },
      { cle: "accueil_lancement_badge_carte", page: "accueil", nom: "Accueil — Badge sur la carte (« Offre limitée »)", valeur: "Offre limitée" },
      { cle: "accueil_lancement_citation", page: "accueil", nom: "Accueil — Citation sur la carte", valeur: "« Rejoindre GlowNyo, c'est donner à mon talent la visibilité qu'il mérite — et toucher une clientèle que je n'aurais jamais atteinte seule. »" },
      { cle: "accueil_lancement_stat1_valeur", page: "accueil", nom: "Accueil — Statistique 1 : valeur (0 €)", valeur: "0 €" },
      { cle: "accueil_lancement_stat1_label", page: "accueil", nom: "Accueil — Statistique 1 : légende", valeur: "Frais d'inscription" },
      { cle: "accueil_lancement_stat2_valeur", page: "accueil", nom: "Accueil — Statistique 2 : valeur (100 %)", valeur: "100 %" },
      { cle: "accueil_lancement_stat2_label", page: "accueil", nom: "Accueil — Statistique 2 : légende", valeur: "De vos revenus" },
      { cle: "accueil_lancement_stat3_valeur", page: "accueil", nom: "Accueil — Statistique 3 : valeur (2 min)", valeur: "2 min" },
      { cle: "accueil_lancement_stat3_label", page: "accueil", nom: "Accueil — Statistique 3 : légende", valeur: "Pour s'inscrire" },
      { cle: "accueil_lancement_bouton_formulaire", page: "accueil", nom: "Accueil — Bouton « Ouvrir le formulaire d'inscription »", valeur: "Ouvrir le formulaire d'inscription" },
      { cle: "accueil_cta_titre", page: "accueil", nom: "Accueil — Titre section finale", valeur: "Votre moment beauté commence ici" },
      { cle: "accueil_cta_description", page: "accueil", nom: "Accueil — Description section finale", valeur: "Rejoignez la communauté GlowNyo et vivez une expérience beauté afro-moderne, où que vous soyez." },
      { cle: "accueil_cta_bouton", page: "accueil", nom: "Accueil — Bouton section finale", valeur: "Prendre rendez-vous" },

      // --- À PROPOS ----------------------------------------------------
      { cle: "a_propos_eyebrow", page: "a-propos", nom: "À propos — Étiquette", valeur: "À propos" },
      { cle: "a_propos_titre", page: "a-propos", nom: "À propos — Titre principal", valeur: "Célébrer la beauté noire, avec sophistication" },
      { cle: "a_propos_intro", page: "a-propos", nom: "À propos — Texte d'introduction", valeur: "GlowNyo est né d'une vision et d'une conviction simple : la beauté et le bien-être afro méritent une plateforme à la hauteur de leur richesse. Nous connectons les personnes clientes aux prestataires de référence du continent, dans une expérience élégante, chaleureuse et résolument moderne." },
      { cle: "a_propos_histoire_titre", page: "a-propos", nom: "À propos — Titre « Notre histoire »", valeur: "Notre histoire" },
      { cle: "a_propos_histoire_p1", page: "a-propos", nom: "À propos — Histoire : paragraphe 1", valeur: "Trouver une personne de confiance pour la coiffure, l'esthétique ou le barbier relevait souvent du parcours du combattant. GlowNyo change la donne : une seule plateforme pour découvrir, comparer et réserver les prestataires beauté & bien-être près de chez soi." },
      { cle: "a_propos_histoire_p2", page: "a-propos", nom: "À propos — Histoire : paragraphe 2", valeur: "Derrière GlowNyo, il y a une femme." },
      { cle: "a_propos_histoire_p3", page: "a-propos", nom: "À propos — Histoire : paragraphe 3", valeur: "Océane. Entrepreneure, visionnaire, et passionnée de beauté. ✨" },
      { cle: "a_propos_histoire_p4", page: "a-propos", nom: "À propos — Histoire : paragraphe 4", valeur: "C'est elle qui a imaginé GlowNyo, portée par une conviction profonde : l'Afrique mérite une plateforme beauté à sa hauteur." },
      { cle: "a_propos_histoire_p5", page: "a-propos", nom: "À propos — Histoire : paragraphe 5", valeur: "Déjà fondatrice d'Aphro Désir, Océane est passionnée par la beauté, dans une optique de constante évolution. Et c'est de cette détermination profonde qu'est né GlowNyo." },
      { cle: "a_propos_histoire_p6", page: "a-propos", nom: "À propos — Histoire : paragraphe 6", valeur: "Un nom. Une vision. Un mouvement." },
      { cle: "a_propos_histoire_p7", page: "a-propos", nom: "À propos — Histoire : paragraphe 7", valeur: "« Nyo » : l'âme, l'essence, ce qui est profondément toi. « Glow » : cette lumière qui rayonne quand tu t'assumes pleinement." },
      { cle: "a_propos_histoire_p8", page: "a-propos", nom: "À propos — Histoire : paragraphe 8", valeur: "GlowNyo, c'est son rêve. Et bientôt, ce sera votre réalité." },
      { cle: "a_propos_histoire_slogan", page: "a-propos", nom: "À propos — Slogan dans l'histoire", valeur: "Rayonne de l'intérieur, brille de l'extérieur. ✨" },
      { cle: "a_propos_histoire_p9", page: "a-propos", nom: "À propos — Histoire : paragraphe final", valeur: "Pensée mobile-first pour l'Afrique, avec le paiement Mobile Money intégré et une gestion des rendez-vous fluide, GlowNyo valorise le savoir-faire local tout en offrant une expérience premium." },
      { cle: "a_propos_histoire_citation", page: "a-propos", nom: "À propos — Citation finale de l'histoire", valeur: "« Rayonne de l'intérieur, brille de l'extérieur »" },
      { cle: "a_propos_valeurs_titre", page: "a-propos", nom: "À propos — Titre « Nos valeurs »", valeur: "Nos valeurs" },
      { cle: "a_propos_valeur1_titre", page: "a-propos", nom: "À propos — Valeur 1 : titre", valeur: "Fierté afro" },
      { cle: "a_propos_valeur1_description", page: "a-propos", nom: "À propos — Valeur 1 : description", valeur: "Nous célébrons la beauté noire dans toute sa diversité, avec respect et modernité." },
      { cle: "a_propos_valeur2_titre", page: "a-propos", nom: "À propos — Valeur 2 : titre", valeur: "Excellence" },
      { cle: "a_propos_valeur2_description", page: "a-propos", nom: "À propos — Valeur 2 : description", valeur: "Chaque prestataire est choisie pour son talent, son professionnalisme et son sens du détail." },
      { cle: "a_propos_valeur3_titre", page: "a-propos", nom: "À propos — Valeur 3 : titre", valeur: "Ancrage africain" },
      { cle: "a_propos_valeur3_description", page: "a-propos", nom: "À propos — Valeur 3 : description", valeur: "Lancé à Cotonou, pensé pour tout le continent, avec des solutions adaptées à nos réalités." },
      { cle: "a_propos_vision_eyebrow", page: "a-propos", nom: "À propos — Étiquette « Notre vision »", valeur: "Notre vision" },
      { cle: "a_propos_vision_titre", page: "a-propos", nom: "À propos — Titre « Notre vision »", valeur: "Faire rayonner la beauté africaine, partout" },
      { cle: "a_propos_vision_description", page: "a-propos", nom: "À propos — Description « Notre vision »", valeur: "Demain, GlowNyo sera la référence beauté & bien-être en Afrique.  Une communauté où chaque personne trouve la prestation idéale, en quelques clics." },
      { cle: "a_propos_vision_bouton", page: "a-propos", nom: "À propos — Bouton final", valeur: "Découvrir les prestataires" },

      // --- FAQ -----------------------------------------------------
      { cle: "faq_eyebrow", page: "faq", nom: "FAQ — Étiquette", valeur: "FAQ" },
      { cle: "faq_titre", page: "faq", nom: "FAQ — Titre principal", valeur: "Questions fréquentes" },
      { cle: "faq_description", page: "faq", nom: "FAQ — Description", valeur: "Tout ce qu'il faut savoir pour réserver sereinement sur GlowNyo, ou pour rejoindre la plateforme en tant que prestataire." },
      { cle: "faq_clients_titre", page: "faq", nom: "FAQ — Titre section clients", valeur: "Pour les clients" },
      { cle: "faq_client_q1", page: "faq", nom: "FAQ clients — Question 1", valeur: "C'est quoi Glownyo ?" },
      { cle: "faq_client_a1", page: "faq", nom: "FAQ clients — Réponse 1", valeur: "Glownyo est une plateforme qui vous permet de trouver et réserver une prestation beauté ou bien-être au Bénin : coiffure, henné, ongles, esthétique, barbier… directement depuis votre téléphone." },
      { cle: "faq_client_q2", page: "faq", nom: "FAQ clients — Question 2", valeur: "Est-ce que c'est pour les hommes aussi ?" },
      { cle: "faq_client_a2", page: "faq", nom: "FAQ clients — Réponse 2", valeur: "Oui ! Glownyo est fait pour tout le monde. Barbiers et soins homme ont toute leur place." },
      { cle: "faq_client_q3", page: "faq", nom: "FAQ clients — Question 3", valeur: "Est-ce que la réservation est payante ?" },
      { cle: "faq_client_a3", page: "faq", nom: "FAQ clients — Réponse 3", valeur: "Non. Réserver sur Glownyo est gratuit. Vous payez uniquement votre prestation." },
      { cle: "faq_client_q4", page: "faq", nom: "FAQ clients — Question 4", valeur: "Comment je paie ma prestation ?" },
      { cle: "faq_client_a4", page: "faq", nom: "FAQ clients — Réponse 4", valeur: "Pour le moment, le paiement se fait directement sur place auprès de la personne prestataire. Le paiement par Mobile Money (MTN, Moov) arrive bientôt." },
      { cle: "faq_client_q5", page: "faq", nom: "FAQ clients — Question 5", valeur: "Comment je sais que mon rendez-vous est confirmé ?" },
      { cle: "faq_client_a5", page: "faq", nom: "FAQ clients — Réponse 5", valeur: "Vous recevez une confirmation après votre réservation. La personne prestataire peut aussi vous contacter sur WhatsApp." },
      { cle: "faq_client_q6", page: "faq", nom: "FAQ clients — Question 6", valeur: "Je peux annuler mon rendez-vous ?" },
      { cle: "faq_client_a6", page: "faq", nom: "FAQ clients — Réponse 6", valeur: "Oui, depuis votre espace, au plus tard 48h avant le rendez-vous. Merci de prévenir le plus tôt possible : c'est du temps réservé pour vous." },
      { cle: "faq_client_q7", page: "faq", nom: "FAQ clients — Question 7", valeur: "Les photos et vidéos de réalisations sont-elles authentiques ?" },
      { cle: "faq_client_a7", page: "faq", nom: "FAQ clients — Réponse 7", valeur: "Oui. Chaque nouvelle photo ou vidéo publiée par une personne prestataire est vérifiée par l'équipe Glownyo avant de devenir visible sur le site. L'authenticité est une valeur fondamentale de Glownyo." },
      { cle: "faq_prestataires_titre", page: "faq", nom: "FAQ — Titre section prestataires", valeur: "Pour les prestataires" },
      { cle: "faq_prestataire_q1", page: "faq", nom: "FAQ prestataires — Question 1", valeur: "Qui peut s'inscrire ?" },
      { cle: "faq_prestataire_a1", page: "faq", nom: "FAQ prestataires — Réponse 1", valeur: "Toute personne exerçant un métier de la beauté ou du bien-être au Bénin : coiffure, barbier, nail art, henné, esthétique, maquillage…" },
      { cle: "faq_prestataire_q2", page: "faq", nom: "FAQ prestataires — Question 2", valeur: "Combien ça coûte ?" },
      { cle: "faq_prestataire_a2", page: "faq", nom: "FAQ prestataires — Réponse 2", valeur: "L'inscription est gratuite pendant la période de lancement. Les abonnements arriveront plus tard, et vous serez informé(e) bien à l'avance, sans surprise." },
      { cle: "faq_prestataire_q3", page: "faq", nom: "FAQ prestataires — Question 3", valeur: "Qu'est-ce que Glownyo m'apporte ?" },
      { cle: "faq_prestataire_a3", page: "faq", nom: "FAQ prestataires — Réponse 3", valeur: "Plus de visibilité, de nouveaux clients, et vos rendez-vous organisés au même endroit." },
      { cle: "faq_prestataire_q4", page: "faq", nom: "FAQ prestataires — Question 4", valeur: "Comment je reçois mes réservations ?" },
      { cle: "faq_prestataire_a4", page: "faq", nom: "FAQ prestataires — Réponse 4", valeur: "Vous êtes notifié(e) à chaque nouvelle réservation, avec les coordonnées du client." },
      { cle: "faq_prestataire_q5", page: "faq", nom: "FAQ prestataires — Question 5", valeur: "Je peux fixer mes propres prix ?" },
      { cle: "faq_prestataire_a5", page: "faq", nom: "FAQ prestataires — Réponse 5", valeur: "Oui. Vous choisissez vos prestations, vos tarifs et vos disponibilités." },
      { cle: "faq_prestataire_q6", page: "faq", nom: "FAQ prestataires — Question 6", valeur: "Qu'est-ce qu'on attend de moi ?" },
      { cle: "faq_prestataire_a6", page: "faq", nom: "FAQ prestataires — Réponse 6", valeur: "Des photos de vos vraies réalisations, et le respect des rendez-vous pris via Glownyo." },
      { cle: "faq_contact_texte", page: "faq", nom: "FAQ — Texte avant le bouton WhatsApp", valeur: "Vous ne trouvez pas votre réponse ?" },
      { cle: "faq_contact_bouton", page: "faq", nom: "FAQ — Bouton WhatsApp", valeur: "Contactez-nous sur WhatsApp" },

      // --- CONTACT ---------------------------------------------------
      { cle: "contact_eyebrow", page: "contact", nom: "Contact — Étiquette", valeur: "Contact" },
      { cle: "contact_titre", page: "contact", nom: "Contact — Titre principal", valeur: "Parlons de votre éclat" },
      { cle: "contact_description", page: "contact", nom: "Contact — Description", valeur: "Une question, un partenariat, ou l'envie de rejoindre GlowNyo en tant que prestataire ? Écrivez-nous, nous répondons vite." },
      { cle: "contact_whatsapp_titre", page: "contact", nom: "Contact — Carte WhatsApp : titre", valeur: "WhatsApp" },
      { cle: "contact_whatsapp_description", page: "contact", nom: "Contact — Carte WhatsApp : description", valeur: "Le plus rapide pour poser vos questions." },
      { cle: "contact_whatsapp_lien", page: "contact", nom: "Contact — Carte WhatsApp : bouton", valeur: "Ouvrir WhatsApp" },
      { cle: "contact_email_titre", page: "contact", nom: "Contact — Carte Email : titre", valeur: "Email" },
      { cle: "contact_email_lien", page: "contact", nom: "Contact — Carte Email : bouton", valeur: "Nous écrire" },
      { cle: "contact_localisation_titre", page: "contact", nom: "Contact — Localisation : titre", valeur: "Localisation" },
      { cle: "contact_localisation_texte", page: "contact", nom: "Contact — Localisation : texte", valeur: "Cotonou, Bénin — au service de toute l'Afrique." },
      { cle: "contact_disponibilite_titre", page: "contact", nom: "Contact — Disponibilité : titre", valeur: "Disponibilité" },
      { cle: "contact_disponibilite_texte", page: "contact", nom: "Contact — Disponibilité : texte", valeur: "Support 7j/7, de 8h à 21h (GMT+1)." },

      // --- PIED DE PAGE ------------------------------------------------
      { cle: "footer_description", page: "pied-de-page", nom: "Pied de page — Description", valeur: "Plateforme de réservation beauté & bien-être connectant clients et prestataires au Bénin et en Afrique." },
      { cle: "footer_slogan", page: "pied-de-page", nom: "Pied de page — Slogan", valeur: "« Rayonne de l'intérieur, brille de l'extérieur »" },
      { cle: "footer_titre_navigation", page: "pied-de-page", nom: "Pied de page — Titre colonne Navigation", valeur: "Navigation" },
      { cle: "footer_titre_specialites", page: "pied-de-page", nom: "Pied de page — Titre colonne Spécialités", valeur: "Spécialités" },
      { cle: "footer_titre_contact", page: "pied-de-page", nom: "Pied de page — Titre colonne Contact", valeur: "Contact" },
      { cle: "footer_copyright", page: "pied-de-page", nom: "Pied de page — Mention copyright (après « © année »)", valeur: "GlowNyo — glownyo.app. Tous droits réservés." },
      { cle: "footer_lien_cgv", page: "pied-de-page", nom: "Pied de page — Lien Conditions générales de vente", valeur: "Conditions générales de vente" },
      { cle: "footer_paiement_texte", page: "pied-de-page", nom: "Pied de page — Mention paiement", valeur: "Paiement Mobile Money via FedaPay · Réservation directe sur GlowNyo" },

      // --- GLOBAL (boutons principaux) ---------------------------------
      { cle: "global_bouton_reserver", page: "global", nom: "Menu principal — Bouton « Réserver »", valeur: "Réserver" },
      { cle: "global_bouton_reserver_mobile", page: "global", nom: "Menu mobile — Bouton « Réserver un rendez-vous »", valeur: "Réserver un rendez-vous" },
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
      const records = app.findRecordsByFilter("textes_site", "", "", 0, 0);
      for (const record of records) {
        app.delete(record);
      }
    } catch (e) {
      // collection gone already — fine.
    }
  },
);
