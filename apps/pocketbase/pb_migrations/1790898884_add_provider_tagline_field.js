/// <reference path="../pb_data/types.d.ts" />

// Short one-line tagline shown on provider cards and the detail page header
// (distinct from `bio`, which is the full paragraph) — needed to carry over
// the exact marketing copy for providers migrated from the hardcoded
// PROVIDERS list, several of whom have a tagline that isn't just their bio's
// first sentence.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    if (!users.fields.getByName("tagline")) {
      users.fields.add(new TextField({ name: "tagline", max: 200 }));
    }
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("tagline");
    app.save(users);
  },
);
