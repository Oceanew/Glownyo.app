/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("bookings");

    if (!collection.fields.getByName("payment_status")) {
      collection.fields.add(
        new SelectField({
          name: "payment_status",
          required: false,
          maxSelect: 1,
          values: ["pending", "paid", "failed"],
        }),
      );
    }

    if (!collection.fields.getByName("fedapay_transaction_id")) {
      collection.fields.add(
        new TextField({
          name: "fedapay_transaction_id",
          required: false,
          max: 100,
        }),
      );
    }

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("bookings");

    if (collection.fields.getByName("payment_status")) {
      collection.fields.removeByName("payment_status");
    }
    if (collection.fields.getByName("fedapay_transaction_id")) {
      collection.fields.removeByName("fedapay_transaction_id");
    }

    app.save(collection);
  },
);
