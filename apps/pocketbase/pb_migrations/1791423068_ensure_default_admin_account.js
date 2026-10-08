/// <reference path="../pb_data/types.d.ts" />

// Safety net: 1787842666_add_admin_role.js was supposed to seed a default
// admin account, but it never actually ran on the PocketBase Cloud instance
// (confirmed missing from the `users` collection there) — root cause
// unconfirmed, possibly an earlier migration failing and the runner not
// continuing past it. This migration is idempotent and only creates the
// account if it's still missing, so it's safe to apply regardless of what
// happened before.
//
// Password comes from an env var (never hardcoded/committed) — same
// pattern as PB_SUPERUSER_PASSWORD in 1764579159_create_superuser.js and
// the PROVIDER_SEED_PASSWORD_* vars in
// 1790898910_seed_historic_provider_accounts.js. Unset: skipped with a log
// line rather than failing the migration.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  const roleField = users.fields.getByName("role");
  if (roleField) {
    const existing = roleField.values || [];
    if (!existing.includes("admin")) {
      roleField.values = [...existing, "admin"];
      app.save(users);
    }
  }

  const adminEmail = $os.getenv("ADMIN_SEED_EMAIL") || "admin@glownyo.app";
  const adminPassword = $os.getenv("ADMIN_SEED_PASSWORD");

  let admin = null;
  try {
    admin = app.findAuthRecordByEmail("users", adminEmail);
  } catch (_) {
    admin = null;
  }

  if (!admin) {
    if (!adminPassword) {
      app.logger().warn(
        "skipping default admin seed — ADMIN_SEED_PASSWORD env var not set",
      );
      return;
    }
    admin = new Record(users);
    admin.setEmail(adminEmail);
    admin.setPassword(adminPassword);
    admin.set("name", "Administrateur GlowNyo");
    admin.set("role", "admin");
    admin.set("verified", true);
    app.save(admin);
  } else if (admin.get("role") !== "admin") {
    admin.set("role", "admin");
    admin.set("verified", true);
    app.save(admin);
  }
}, (app) => {
  try {
    const adminEmail = $os.getenv("ADMIN_SEED_EMAIL") || "admin@glownyo.app";
    const admin = app.findAuthRecordByEmail("users", adminEmail);
    app.delete(admin);
  } catch (e) {
    if (e.message.includes("no rows in result set")) return;
    throw e;
  }
});
