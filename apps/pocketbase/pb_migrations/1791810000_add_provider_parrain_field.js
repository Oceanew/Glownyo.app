/// <reference path="../pb_data/types.d.ts" />

// Captures who told a new provider about GlowNyo, from the sign-up form's
// "Qui vous a parlé de Glownyo ?" question — free text, optional, admin-only
// (see provider-self-update-guard.pb.js and the /providers/referrals route).
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    if (!users.fields.getByName("parrain")) {
      users.fields.add(new TextField({ name: "parrain", max: 200 }));
    }
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("parrain");
    app.save(users);
  },
);
