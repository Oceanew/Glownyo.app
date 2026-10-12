/// <reference path="../pb_data/types.d.ts" />

// Creates the `actualites` collection (GlowNyo news/announcements).
//
// Public visitors (and guests) can only ever see published items
// (statut = "publie"); only a signed-in admin can see drafts too, and only
// an admin can create, edit or delete — enforced directly by PocketBase's
// own collection rules (@request.auth.role references the `role` field on
// the authenticated `users` record), so a client or provider account has no
// way to write here even via a direct API call, exactly like the existing
// `role != "admin"` checks used throughout the custom pb_hooks routes.
migrate(
  (app) => {
    const collection = new Collection({
      type: "base",
      name: "actualites",
      listRule: 'statut = "publie" || @request.auth.role = "admin"',
      viewRule: 'statut = "publie" || @request.auth.role = "admin"',
      createRule: '@request.auth.role = "admin"',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"',
      fields: [
        { name: "titre", type: "text", required: true, max: 200 },
        { name: "texte", type: "text", required: true, max: 10000 },
        {
          name: "image",
          type: "file",
          required: false,
          maxSelect: 1,
          maxSize: 8 * 1024 * 1024,
          mimeTypes: ["image/jpeg", "image/png", "image/webp"],
        },
        { name: "date_publication", type: "date", required: true },
        {
          name: "statut",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["brouillon", "publie"],
        },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX IF NOT EXISTS `idx_actualites_date_publication` ON `actualites` (`date_publication`)",
        "CREATE INDEX IF NOT EXISTS `idx_actualites_statut` ON `actualites` (`statut`)",
      ],
    });
    app.save(collection);
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("actualites");
      app.delete(collection);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
  },
);
