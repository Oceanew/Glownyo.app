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
        "Envie d'une prestation beauté ? Réservez gratuitement en quelques clics. Pour le moment, le paiement se fait directement sur place, au moment de votre rendez-vous. Vous êtes professionnel·le de la beauté ou du bien-être ? L'inscription est gratuite pendant toute la période de lancement. Rejoignez-nous !",
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
