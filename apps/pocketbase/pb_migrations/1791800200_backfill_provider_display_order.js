/// <reference path="../pb_data/types.d.ts" />

// One-time backfill for the new `ordre_affichage` field: gives every
// currently-published provider a value that preserves today's actual
// display order (their current creation-date order), so nothing moves
// visually — except Queen's Beauty by Laure, who Oceane asked to be placed
// in first position right away.
migrate(
  (app) => {
    const providers = app.findRecordsByFilter(
      "users",
      '(role = "provider" && validated = true) || provider_request_status = "validated"',
      "created",
      0,
      0,
    );

    providers.forEach((record, index) => {
      record.set("ordre_affichage", index + 1);
      app.save(record);
    });

    try {
      const laure = app.findFirstRecordByFilter("users", "slug = {:slug}", {
        slug: "queens-beauty-by-laure",
      });
      laure.set("ordre_affichage", 0);
      app.save(laure);
    } catch (e) {
      app.logger().warn("queens-beauty-by-laure account not found — skipping first-position placement");
    }
  },
  (app) => {
    const providers = app.findRecordsByFilter(
      "users",
      '(role = "provider" && validated = true) || provider_request_status = "validated"',
      "",
      0,
      0,
    );
    providers.forEach((record) => {
      record.set("ordre_affichage", 0);
      app.save(record);
    });
  },
);
