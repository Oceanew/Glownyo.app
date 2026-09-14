/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("bookings");
    collection.fields.add(new TextField({ name: "provider_email", max: 200 }));
    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("bookings");
    collection.fields.removeByName("provider_email");
    app.save(collection);
  },
);
