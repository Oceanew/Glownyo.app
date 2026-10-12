/// <reference path="../pb_data/types.d.ts" />

// Corrects two `textes_site` entries seeded with an inaccurate claim —
// payment is for now made on site, not via an integrated Mobile Money
// flow — mirroring the same fix already applied to the site's
// meta-description and share-preview tags.
migrate(
  (app) => {
    const fixes = {
      accueil_hero_description:
        "La plateforme afro-moderne qui connecte les clients aux prestataires beauté & bien-être de référence au Bénin et en Afrique. Réservez en quelques clics.",
      accueil_benefice3_description: "Un agenda en ligne, des réservations centralisées, zéro paperasse.",
    };

    Object.keys(fixes).forEach((cle) => {
      try {
        const record = app.findFirstRecordByFilter("textes_site", "cle = {:cle}", { cle: cle });
        record.set("valeur", fixes[cle]);
        app.save(record);
      } catch (e) {
        app.logger().warn("textes_site entry not found — skipping", "cle", cle);
      }
    });
  },
  (app) => {
    const previous = {
      accueil_hero_description:
        "La plateforme afro-moderne qui connecte les clients aux prestataires beauté & bien-être de référence au Bénin et en Afrique. Réservez en quelques clics, payez en Mobile Money.",
      accueil_benefice3_description: "Un agenda en ligne, un paiement Mobile Money intégré, zéro paperasse.",
    };

    Object.keys(previous).forEach((cle) => {
      try {
        const record = app.findFirstRecordByFilter("textes_site", "cle = {:cle}", { cle: cle });
        record.set("valeur", previous[cle]);
        app.save(record);
      } catch (e) {
        // already gone — fine.
      }
    });
  },
);
