/// <reference path="../pb_data/types.d.ts" />

// Adds provider-validation fields to the existing `users` auth collection and
// tightens the authRule so that a provider account cannot log in (and therefore
// cannot access its space) until an admin validates it.
//
// Flow:
//   - Provider submits the sign-up form → account created with role="provider"
//     and validated=false. A PocketBase hook emails the GlowNyo team a summary.
//   - Admin clicks "Valider" → Express sets validated=true + pending_activation
//     and triggers a password reset, which the activation-email hook brands as
//     an activation message with a secure link to define the password.
//   - Until validated=true, the authRule below blocks provider login.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    // role: distinguish regular clients from providers going through validation.
    if (!users.fields.getByName("role")) {
      users.fields.add(
        new SelectField({
          name: "role",
          required: false,
          maxSelect: 1,
          values: ["client", "provider"],
        }),
      );
    }

    // validated: only true after an admin approves the provider request.
    if (!users.fields.getByName("validated")) {
      users.fields.add(new BoolField({ name: "validated", required: false }));
    }

    // pending_activation: transient flag set by the validate route so the
    // password-reset mailer hook knows to render the activation email instead
    // of a normal reset email. Cleared right after the email is sent.
    if (!users.fields.getByName("pending_activation")) {
      users.fields.add(
        new BoolField({ name: "pending_activation", required: false }),
      );
    }

    // Provider profile fields captured by the sign-up form.
    if (!users.fields.getByName("specialty")) {
      users.fields.add(new TextField({ name: "specialty", max: 150 }));
    }
    if (!users.fields.getByName("services")) {
      users.fields.add(new TextField({ name: "services", max: 2000 }));
    }
    if (!users.fields.getByName("location")) {
      users.fields.add(new TextField({ name: "location", max: 200 }));
    }
    if (!users.fields.getByName("phone")) {
      users.fields.add(new TextField({ name: "phone", max: 60 }));
    }
    if (!users.fields.getByName("bio")) {
      users.fields.add(new TextField({ name: "bio", max: 3000 }));
    }
    if (!users.fields.getByName("instagram")) {
      users.fields.add(new URLField({ name: "instagram" }));
    }

    // Block provider login until validated. Clients (role != "provider",
    // including the empty default) are always allowed.
    users.authRule = "role != 'provider' || validated = true";

    app.save(users);
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId("users");
      [
        "role",
        "validated",
        "pending_activation",
        "specialty",
        "services",
        "location",
        "phone",
        "bio",
        "instagram",
      ].forEach((name) => users.fields.removeByName(name));
      users.authRule = "";
      app.save(users);
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
  },
);
