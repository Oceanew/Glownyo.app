/// <reference path="../pb_data/types.d.ts" />

// Adds the "admin" role to the existing `users.role` select field so a
// signed-in administrator can access the GlowNyo admin space (Demandes
// prestataires, Réservations) via role-based authorization instead of a
// static admin key.
//
// SECURITY FIX (2026-10 audit): this migration used to also seed the
// default admin account with a password hardcoded directly in this file —
// a real, working credential, committed in plaintext and publicly visible
// in the GitHub repo's history ever since. That account-creation block is
// removed here; 1791423068_ensure_default_admin_account.js already fully
// supersedes it (same account, same idempotent "create if missing" logic,
// but the password comes from the ADMIN_SEED_PASSWORD env var instead of
// being committed). If admin@glownyo.app's password is still
// "GlowNyo@Admin2026!" anywhere, treat it as compromised and change it —
// it was public.
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
  },
);
