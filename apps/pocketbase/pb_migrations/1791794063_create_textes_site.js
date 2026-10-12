/// <reference path="../pb_data/types.d.ts" />

// Creates the `textes_site` collection — every editable piece of static copy
// on the public pages (accueil, à propos, FAQ, contact, pied de page) plus
// the main sitewide CTA button, so Oceane can rewrite them from the admin
// space without a code deploy. Does NOT cover provider profile text (bio,
// services, tagline...) — that already lives on `users` and is edited from
// the provider's own "Mon profil" space.
//
// `cle` is the stable identifier the frontend looks up by (never shown to
// the admin); `page` groups entries for the admin page selector; `nom` is
// the human-readable French label shown in the admin form (e.g. "Titre
// principal"). Anyone can read; only an admin can write.
migrate(
  (app) => {
    const collection = new Collection({
      type: "base",
      name: "textes_site",
      listRule: "",
      viewRule: "",
      createRule: '@request.auth.role = "admin"',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"',
      fields: [
        { name: "cle", type: "text", required: true, max: 150 },
        {
          name: "page",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["accueil", "a-propos", "faq", "contact", "pied-de-page", "global"],
        },
        { name: "nom", type: "text", required: true, max: 200 },
        { name: "valeur", type: "text", required: true, max: 5000 },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX IF NOT EXISTS `idx_textes_site_cle` ON `textes_site` (`cle`)",
        "CREATE INDEX IF NOT EXISTS `idx_textes_site_page` ON `textes_site` (`page`)",
      ],
    });
    app.save(collection);
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("textes_site");
      app.delete(collection);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
  },
);
