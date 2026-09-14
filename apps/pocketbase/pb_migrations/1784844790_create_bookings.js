/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    let collection;
    try {
      collection = app.findCollectionByNameOrId("bookings");
    } catch (_) {
      collection = new Collection({
        type: "base",
        name: "bookings",
        // Public booking form: anyone can submit a request (createRule ""),
        // but only server-side/superuser code can read, update or delete —
        // this is sensitive customer data with no owning user account.
        listRule: null,
        viewRule: null,
        createRule: "",
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: "name", type: "text", required: true, max: 200 },
          { name: "phone", type: "text", required: true, max: 60 },
          { name: "email", type: "email", required: false },
          { name: "service", type: "text", required: false, max: 200 },
          { name: "provider", type: "text", required: false, max: 200 },
          { name: "date", type: "text", required: false, max: 40 },
          { name: "time", type: "text", required: false, max: 40 },
          { name: "message", type: "text", required: false, max: 3000 },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(collection);
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("bookings");
      app.delete(collection);
    } catch (e) {
      if (e.message.includes("no rows in result set")) {
        return;
      }
      throw e;
    }
  },
);
