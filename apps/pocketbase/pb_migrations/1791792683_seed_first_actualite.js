/// <reference path="../pb_data/types.d.ts" />

// Seeds the launch-announcement news item, published from day one.
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("actualites");

    let existing = null;
    try {
      existing = app.findFirstRecordByFilter("actualites", "titre = {:titre}", {
        titre: "Glownyo est lancé ! 🎉",
      });
    } catch (e) {
      existing = null;
    }
    if (existing) return;

    const record = new Record(collection, {
      titre: "Glownyo est lancé ! 🎉",
      texte:
        "Clients : réservez gratuitement votre prestation beauté. Pour le moment, le paiement se fait directement auprès de la prestataire. Prestataires : l'inscription est gratuite pendant toute la période de lancement. Rejoignez-nous !",
      date_publication: new Date().toISOString(),
      statut: "publie",
    });
    app.save(record);
  },
  (app) => {
    try {
      const record = app.findFirstRecordByFilter("actualites", "titre = {:titre}", {
        titre: "Glownyo est lancé ! 🎉",
      });
      app.delete(record);
    } catch (e) {
      // already gone — fine.
    }
  },
);
