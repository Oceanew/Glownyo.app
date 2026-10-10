/// <reference path="../pb_data/types.d.ts" />

// Transient bool flags set by the admin /providers/toggle-active route to
// trigger exactly one notification email to the provider when her account
// is paused or reactivated, then cleared right after — same pattern as
// provider_activated_notify / provider_request_notify
// (1787827548_add_provider_request_status.js).
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    if (!users.fields.getByName("provider_paused_notify")) {
      users.fields.add(
        new BoolField({ name: "provider_paused_notify", required: false }),
      );
    }
    if (!users.fields.getByName("provider_reactivated_notify")) {
      users.fields.add(
        new BoolField({ name: "provider_reactivated_notify", required: false }),
      );
    }

    app.save(users);
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId("users");
      ["provider_paused_notify", "provider_reactivated_notify"].forEach((name) =>
        users.fields.removeByName(name),
      );
      app.save(users);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
  },
);
