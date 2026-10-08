/// <reference path="../pb_data/types.d.ts" />

// Adds an optional `cover` photo to the `partners` collection (same text/URL
// convention as the existing `logo` field) and sets both photos for K Elixir,
// the only partner that has one so far — every other partner keeps showing
// just its logo, exactly as today, since `cover` stays empty for them.
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("partners");

    if (!collection.fields.getByName("cover")) {
      collection.fields.add(new TextField({ name: "cover", max: 500 }));
      app.save(collection);
    }

    const record = app.findFirstRecordByFilter("partners", "name = 'K Elixir'");
    record.set("logo", "/images/partners/k-elixir-logo.jpg");
    record.set("cover", "/images/partners/k-elixir-cover.jpg");
    app.save(record);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("partners");

    try {
      const record = app.findFirstRecordByFilter("partners", "name = 'K Elixir'");
      record.set(
        "logo",
        "https://images.hostinger.com/dfdf7e17-7c4d-4a89-a5b8-a40cdd9d451b.png",
      );
      record.set("cover", "");
      app.save(record);
    } catch (e) {
      // record gone — fine.
    }

    collection.fields.removeByName("cover");
    app.save(collection);
  },
);
