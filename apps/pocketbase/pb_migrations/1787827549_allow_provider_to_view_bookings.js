/// <reference path="../pb_data/types.d.ts" />

// Extends the bookings list/view rules so a validated provider can see the
// reservations assigned to them (where provider_email matches their account
// email), in addition to the owner-scoped access clients already have.
//
// Before:  @request.auth.id != '' && @request.auth.id = owner
// After:   @request.auth.id != '' &&
//          (@request.auth.id = owner || provider_email = @request.auth.email)
//
// This is additive and does not leak data: a client still only sees their own
// bookings (owner match), and a provider only sees bookings where they are
// the assigned provider (provider_email match). Existing accounts and the
// client journey are unchanged.
migrate(
  (app) => {
    const bookings = app.findCollectionByNameOrId("bookings");
    bookings.listRule =
      "@request.auth.id != '' && (@request.auth.id = owner || provider_email = @request.auth.email)";
    bookings.viewRule =
      "@request.auth.id != '' && (@request.auth.id = owner || provider_email = @request.auth.email)";
    app.save(bookings);
  },
  (app) => {
    try {
      const bookings = app.findCollectionByNameOrId("bookings");
      bookings.listRule = "@request.auth.id != '' && @request.auth.id = owner";
      bookings.viewRule = "@request.auth.id != '' && @request.auth.id = owner";
      app.save(bookings);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
  },
);
