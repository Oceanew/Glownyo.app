/// <reference path="../pb_data/types.d.ts" />

// Lets Oceane choose the order providers appear in on the public site
// (storefront list + homepage preview), instead of the implicit
// creation-date order used until now. Lower values show first. A provider
// without an explicit value (brand-new signup, before validation) sorts
// after everyone who has one — see provider-create-defaults.pb.js and the
// /providers/validate route, which assign one automatically on validation.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    if (!users.fields.getByName("ordre_affichage")) {
      users.fields.add(new NumberField({ name: "ordre_affichage" }));
    }
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("ordre_affichage");
    app.save(users);
  },
);
