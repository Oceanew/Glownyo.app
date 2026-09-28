/// <reference path="../pb_data/types.d.ts" />

// Adds a `booking_status` select field to the `bookings` collection so the
// GlowNyo admin team can manage the lifecycle of a reservation independently
// of the FedaPay payment status:
//   - pending   : default, awaiting confirmation by the team
//   - confirmed : the team confirmed the appointment with the client
//   - cancelled : the appointment was cancelled
//   - completed : the appointment was carried out
//
// The field is optional (not required) so existing rows and guest bookings
// keep working unchanged. Updates are performed through the Express admin
// routes (superuser client), which bypass the collection's REST updateRule,
// so no rule change is needed here.
migrate(
  (app) => {
    const bookings = app.findCollectionByNameOrId("bookings");

    if (!bookings.fields.getByName("booking_status")) {
      bookings.fields.add(
        new SelectField({
          name: "booking_status",
          maxSelect: 1,
          values: ["pending", "confirmed", "cancelled", "completed"],
        }),
      );
    }
    app.save(bookings);
  },
  (app) => {
    const bookings = app.findCollectionByNameOrId("bookings");
    if (bookings.fields.getByName("booking_status")) {
      bookings.fields.removeByName("booking_status");
    }
    app.save(bookings);
  },
);
