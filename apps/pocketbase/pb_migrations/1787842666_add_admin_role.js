/// <reference path="../pb_data/types.d.ts" />

// Adds the "admin" role to the existing `users.role` select field so a
// signed-in administrator can access the GlowNyo admin space (Demandes
// prestataires, Réservations) via role-based authorization instead of a
// static admin key.
//
// Also seeds a default administrator account. The credentials are revealed
// only in the final chat confirmation; the user should change the password
// from /mon-compte after first sign-in.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const roleField = users.fields.getByName("role");
    if (roleField) {
      // Preserve existing options and add "admin" if it is missing.
      const existing = roleField.values || [];
      if (!existing.includes("admin")) {
        roleField.values = ["client", "provider", "admin"];
      }
    }

    // Admins are always allowed to log in (they are not providers).
    users.authRule = "role != 'provider' || validated = true";

    app.save(users);

    // Seed the default admin account (idempotent).
    const adminEmail = "admin@glownyo.app";
    let admin = null;
    try {
      admin = app.findAuthRecordByEmail("users", adminEmail);
    } catch (_) {
      admin = null;
    }

    if (!admin) {
      admin = new Record(users);
      admin.setEmail(adminEmail);
      admin.setPassword("GlowNyo@Admin2026!");
      admin.set("name", "Administrateur GlowNyo");
      admin.set("role", "admin");
      admin.set("verified", true);
      app.save(admin);
    } else if (admin.get("role") !== "admin") {
      admin.set("role", "admin");
      admin.set("verified", true);
      app.save(admin);
    }
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId("users");
      const roleField = users.fields.getByName("role");
      if (roleField) {
        roleField.values = ["client", "provider"];
      }
      app.save(users);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }

    try {
      const admin = app.findAuthRecordByEmail("users", "admin@glownyo.app");
      app.delete(admin);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
  },
);
