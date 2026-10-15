/// <reference path="../pb_data/types.d.ts" />

// Adds "reservation" to the `textes_site.page` select field so the booking
// page's copy can be grouped and edited from the admin's "Textes du site"
// the same way accueil/a-propos/faq/contact/pied-de-page already are.
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("textes_site");
    const pageField = collection.fields.getByName("page");
    if (pageField && !pageField.values.includes("reservation")) {
      pageField.values = [...pageField.values, "reservation"];
    }
    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("textes_site");
    const pageField = collection.fields.getByName("page");
    if (pageField) {
      pageField.values = pageField.values.filter((v) => v !== "reservation");
    }
    app.save(collection);
  },
);
