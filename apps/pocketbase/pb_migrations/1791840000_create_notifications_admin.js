/// <reference path="../pb_data/types.d.ts" />

// Notifications Oceane sees in her admin space whenever a provider updates
// her public profile (photo, réalisations, prestations, tarifs, description,
// disponibilités), plus a highlighted one the moment a profile becomes
// complete and therefore visible on the public site — see
// provider-profile-change-notification.pb.js, the only place that ever
// writes to this collection. createRule is null: nothing creates a
// notification except that server-side hook (via the superuser SDK, which
// bypasses collection rules entirely).
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const collection = new Collection({
      type: "base",
      name: "notifications_admin",
      listRule: '@request.auth.role = "admin"',
      viewRule: '@request.auth.role = "admin"',
      createRule: null,
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"',
      fields: [
        {
          name: "prestataire",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: false,
        },
        // Denormalized so the notification's wording never changes after
        // the fact if the provider later renames her profile.
        { name: "prestataire_nom", type: "text", required: true, max: 200 },
        { name: "message", type: "text", required: true, max: 500 },
        {
          name: "type",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["modification", "profil_complet"],
        },
        { name: "lu", type: "bool" },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      ],
      indexes: [
        "CREATE INDEX IF NOT EXISTS `idx_notifications_admin_created` ON `notifications_admin` (`created`)",
        "CREATE INDEX IF NOT EXISTS `idx_notifications_admin_lu` ON `notifications_admin` (`lu`)",
      ],
    });
    app.save(collection);
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("notifications_admin");
      app.delete(collection);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
  },
);
