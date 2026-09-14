/// <reference path="../pb_data/types.d.ts" />

// Adds provider-request lifecycle fields to the existing `users` auth
// collection so an existing client account can request to become a provider
// with the SAME email — without creating a second account.
//
//   provider_request_status : none | pending | validated | refused
//     - "none"     : no provider request (default for all existing accounts;
//                    the field is empty until first set — treated as "none")
//     - "pending"  : a request has been submitted and is awaiting admin review
//     - "validated": admin approved → the account now has provider access
//     - "refused"  : admin refused → the client account stays fully functional
//
//   provider_request_notify / provider_activated_notify : transient bool flags
//     set by the Express providers-admin route (superuser SDK updates) to
//     trigger exactly one notification email from a PocketBase hook, then
//     cleared right after. Mirrors the existing pending_activation pattern.
//
// The `role` field stays single-select ("client" | "provider"). A client who
// becomes a provider keeps role="client" and gains provider access via
// provider_request_status="validated" — so they keep the same login and can
// switch between the client and provider spaces.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    if (!users.fields.getByName("provider_request_status")) {
      users.fields.add(
        new SelectField({
          name: "provider_request_status",
          required: false,
          maxSelect: 1,
          values: ["none", "pending", "validated", "refused"],
        }),
      );
    }

    if (!users.fields.getByName("provider_request_notify")) {
      users.fields.add(
        new BoolField({ name: "provider_request_notify", required: false }),
      );
    }

    if (!users.fields.getByName("provider_activated_notify")) {
      users.fields.add(
        new BoolField({ name: "provider_activated_notify", required: false }),
      );
    }

    app.save(users);
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId("users");
      [
        "provider_request_status",
        "provider_request_notify",
        "provider_activated_notify",
      ].forEach((name) => users.fields.removeByName(name));
      app.save(users);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
  },
);
