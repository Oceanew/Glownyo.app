/// <reference path="../pb_data/types.d.ts" />

// Adds an optional `owner` relation to the bookings collection so a client
// can (optionally) link a booking to her account and later view/manage it.
// Guest booking stays the default: createRule remains "" (anyone can book
// without an account). Only list/view/delete are scoped to the owner so a
// signed-in client sees just her own appointments. Update stays null — only
// server-side superuser code (FedaPay verify, admin) updates payment status.
migrate(
  (app) => {
    const bookings = app.findCollectionByNameOrId("bookings");
    const users = app.findCollectionByNameOrId("users");

    if (!bookings.fields.getByName("owner")) {
      bookings.fields.add(
        new RelationField({
          name: "owner",
          required: false,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: false,
        }),
      );
    }

    bookings.listRule = "@request.auth.id != '' && @request.auth.id = owner";
    bookings.viewRule = "@request.auth.id != '' && @request.auth.id = owner";
    // createRule stays "" — booking without an account must remain possible.
    bookings.updateRule = null;
    bookings.deleteRule = "@request.auth.id != '' && @request.auth.id = owner";

    app.save(bookings);
  },
  (app) => {
    const bookings = app.findCollectionByNameOrId("bookings");
    if (bookings.fields.getByName("owner")) {
      bookings.fields.removeByName("owner");
    }
    bookings.listRule = null;
    bookings.viewRule = null;
    bookings.deleteRule = null;
    app.save(bookings);
  },
);
