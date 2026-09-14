/// <reference path="../pb_data/types.d.ts" />

// Finalizes the booking system:
//  1. Adds a partial UNIQUE index on (provider, date, time) so a given
//     provider cannot be double-booked at the same date+time. The index is
//     partial (WHERE provider/date/time are non-empty) so "Peu importe / à
//     conseiller" bookings (no specific provider) and incomplete date/time
//     submissions are still allowed. This is the authoritative race-condition
//     guard: even if two visitors submit the same slot simultaneously, only
//     the first create succeeds; the second gets a 400.
//  2. Adds an `email_status` select field (pending/sent/failed) so the
//     confirmation screen can tell the client whether the confirmation email
//     was sent, while keeping the booking recorded regardless of email outcome.
//
// Before creating the unique index we remove any pre-existing duplicate slot
// rows (keeping the newest one per provider+date+time) so the index creation
// cannot fail on legacy test data.
migrate(
  (app) => {
    const bookings = app.findCollectionByNameOrId("bookings");

    // 1. email_status field
    if (!bookings.fields.getByName("email_status")) {
      bookings.fields.add(
        new SelectField({
          name: "email_status",
          maxSelect: 1,
          values: ["pending", "sent", "failed"],
        }),
      );
    }
    app.save(bookings);

    // 2. Remove duplicate slot rows, keeping only the newest (max created) per
    //    provider+date+time. A row is deleted when a newer row exists for the
    //    same slot. Standard correlated EXISTS — valid in all SQLite versions.
    try {
      app
        .db()
        .newQuery(
          `DELETE FROM bookings
           WHERE \`rowid\` IN (
             SELECT b1.\`rowid\` FROM bookings b1
             WHERE b1.\`provider\` != '' AND b1.\`date\` != '' AND b1.\`time\` != ''
               AND EXISTS (
                 SELECT 1 FROM bookings b2
                 WHERE b2.\`provider\` = b1.\`provider\`
                   AND b2.\`date\`      = b1.\`date\`
                   AND b2.\`time\`      = b1.\`time\`
                   AND b2.\`created\`   > b1.\`created\`
               )
           )`,
        )
        .execute();
    } catch (err) {
      // Non-fatal: if there are no duplicates the DELETE is a no-op. A real
      // syntax issue still surfaces below at index creation.
      console.log("dedup delete skipped:", String(err));
    }

    // 3. Partial unique index (idempotent).
    const indexSql =
      "CREATE UNIQUE INDEX IF NOT EXISTS `idx_bookings_slot` ON `bookings` (`provider`, `date`, `time`) WHERE `provider` != '' AND `date` != '' AND `time` != ''";
    if (!bookings.indexes.some((i) => i.includes("idx_bookings_slot"))) {
      bookings.indexes.push(indexSql);
    }
    app.save(bookings);
  },
  (app) => {
    const bookings = app.findCollectionByNameOrId("bookings");
    bookings.indexes = bookings.indexes.filter(
      (i) => !i.includes("idx_bookings_slot"),
    );
    if (bookings.fields.getByName("email_status")) {
      bookings.fields.removeByName("email_status");
    }
    app.save(bookings);
  },
);
