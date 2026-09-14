/// <reference path="../pb_data/types.d.ts" />

// When a new client account is created (the optional sign-up offered after a
// booking), link any existing guest bookings that share the same email to the
// new account so the client can view and manage them from "Mes rendez-vous".
// Best-effort: failures are logged and never abort the account creation.
onRecordAfterCreateSuccess((e) => {
  const userEmail = e.record.get("email");
  if (!userEmail) {
    e.next();
    return;
  }

  try {
    const safeEmail = String(userEmail).replace(/"/g, "");
    const existing = $app.findRecordsByFilter(
      "bookings",
      `email = "${safeEmail}"`,
    );

    existing.forEach((b) => {
      if (!b.get("owner")) {
        b.set("owner", e.record.id);
        $app.save(b);
      }
    });
  } catch (err) {
    $app
      .logger()
      .error(
        "backfill booking owner on signup failed",
        "email",
        String(userEmail),
        "err",
        String(err),
      );
  }

  e.next();
}, "users");
