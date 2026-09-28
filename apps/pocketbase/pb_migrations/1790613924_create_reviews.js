// apps/pocketbase/pb_migrations/1790613924_create_reviews.js
/// <reference path="../pb_data/types.d.ts" />

// Creates the `reviews` collection — authentic client reviews linked to a
// completed booking. One review per booking is enforced both server-side
// (Express validates ownership + completed status) and at the DB level
// (unique index on `booking`). Public reads see only non-hidden reviews;
// writes are locked to the superuser (Express) so no client can forge or
// edit a review through the REST API. Admin moderation (hide / restore /
// delete) also runs through the superuser client.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const bookings = app.findCollectionByNameOrId("bookings");

    const collection = new Collection({
      type: "base",
      name: "reviews",
      // Public can read only visible (non-hidden) reviews. Anonymous reads
      // are allowed so provider profiles show reviews to everyone.
      listRule: "hidden = false",
      viewRule: "hidden = false",
      // No direct REST writes/edits/deletes — only the Express superuser
      // client (which bypasses rules) creates and moderates reviews.
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "rating",
          type: "number",
          required: true,
          min: 1,
          max: 5,
          onlyInt: true,
        },
        { name: "comment", type: "text", required: true, min: 1, max: 2000 },
        {
          name: "booking",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: bookings.id,
          cascadeDelete: false,
        },
        { name: "provider", type: "text", required: true, max: 200 },
        {
          name: "client",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: false,
        },
        { name: "client_name", type: "text", required: true, max: 200 },
        { name: "hidden", type: "bool" },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX IF NOT EXISTS `idx_reviews_booking` ON `reviews` (`booking`) WHERE `booking` != ''",
        "CREATE INDEX IF NOT EXISTS `idx_reviews_provider` ON `reviews` (`provider`)",
      ],
    });
    app.save(collection);
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("reviews");
      app.delete(collection);
    } catch (e) {
      if (e.message.includes("no rows in result set")) {
        console.log("reviews collection not found, skipping revert");
        return;
      }
      throw e;
    }
  },
);
