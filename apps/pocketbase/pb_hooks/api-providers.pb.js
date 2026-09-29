/// <reference path="../pb_data/types.d.ts" />

// GET /providers/public — public, no admin key required.
// Returns the public profile fields of every validated provider so the
// storefront can list them alongside the seeded providers. A user counts
// as a validated provider when:
//   - standalone provider account: role="provider" && validated=true
//   - existing client granted provider access: provider_request_status="validated"
// Only public-facing fields are exposed (no email/password/token/etc.).
routerAdd("GET", "/providers/public", (e) => {
  try {
    const records = $app.findRecordsByFilter(
      "users",
      '(role = "provider" && validated = true) || provider_request_status = "validated"',
      "created",
      0,
      0,
    );

    const providers = records.map((r) => ({
      id: r.id,
      name: r.get("name") || "",
      specialty: r.get("specialty") || "",
      services: r.get("services") || "",
      location: r.get("location") || "",
      phone: r.get("phone") || "",
      email: r.get("email") || "",
      instagram: r.get("instagram") || "",
      bio: r.get("bio") || "",
      avatar: r.get("avatar") || "",
      source: "db",
    }));

    return e.json(200, providers);
  } catch (err) {
    $app.logger().error("failed to list public providers", "err", String(err));
    return e.internalServerError("failed to list public providers", null);
  }
});

// Admin management of active provider accounts.
//
// A "provider" here is any account that can appear on the storefront:
//   - standalone provider account: role="provider"
//   - existing client granted provider access: provider_request_status="validated"
// "Active" means the account is currently visible and usable as a provider.
// Deactivating sets validated=false (standalone) or provider_request_status="none"
// (linked client) so the profile disappears from the storefront and the
// provider space, without deleting the account or its client data.

// GET /providers/active — admin only.
routerAdd("GET", "/providers/active", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  try {
    const records = $app.findRecordsByFilter(
      "users",
      'role = "provider" || provider_request_status = "validated" || provider_request_status = "refused"',
      "created",
      0,
      0,
    );

    const providers = records
      .filter((r) => r.get("role") === "provider" || r.get("provider_request_status") === "validated")
      .map((r) => {
        const isStandalone = r.get("role") === "provider";
        const active =
          (isStandalone && r.get("validated") === true) ||
          r.get("provider_request_status") === "validated";
        return {
          id: r.id,
          name: r.get("name") || "",
          email: r.get("email") || "",
          phone: r.get("phone") || "",
          specialty: r.get("specialty") || "",
          location: r.get("location") || "",
          instagram: r.get("instagram") || "",
          active: active,
          accountType: isStandalone ? "standalone" : "linked_client",
        };
      });

    return e.json(200, providers);
  } catch (err) {
    $app.logger().error("failed to list active providers", "err", String(err));
    return e.internalServerError("failed to list active providers", null);
  }
}, $apis.requireAuth("users"));

// POST /providers/toggle-active  { id, active }
// active=true  → reactivate the provider (validated=true / status="validated")
// active=false → deactivate the provider (validated=false / status="none")
// Admin-only. Never touches the privileged `role` field.
routerAdd("POST", "/providers/toggle-active", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  const body = e.requestInfo().body || {};
  const id = body.id;
  const active = body.active;

  if (!id) {
    return e.badRequestError("id is required", null);
  }
  if (typeof active !== "boolean") {
    return e.badRequestError("active (boolean) is required", null);
  }

  try {
    const record = $app.findRecordById("users", id);
    const isStandalone = record.get("role") === "provider";

    if (isStandalone) {
      record.set("validated", active);
    } else {
      record.set("provider_request_status", active ? "validated" : "none");
    }
    $app.save(record);

    return e.json(200, { ok: true, id: id, active: active });
  } catch (err) {
    $app.logger().error("failed to toggle provider active", "user", id, "err", String(err));
    return e.internalServerError("failed to toggle provider active", null);
  }
}, $apis.requireAuth("users"));

// GET /providers/pending — list provider requests awaiting validation.
// Admin only. Returns two kinds of pending requests:
//   1. Standalone provider accounts (role="provider", validated=false)
//   2. Existing client accounts that asked to become a provider
//      (provider_request_status="pending" or "refused")
routerAdd("GET", "/providers/pending", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  try {
    const records = $app.findRecordsByFilter(
      "users",
      '(role = "provider" && validated = false) || provider_request_status = "pending" || provider_request_status = "refused"',
      "-created",
      0,
      0,
    );
    // Manually picked fields: a raw users Record hides the auth `email`
    // field by default (the emailVisibility check) when JSON-serialized
    // outside of a request context, and the admin team needs to see it.
    const providers = records.map((r) => ({
      id: r.id,
      name: r.get("name") || "",
      email: r.get("email") || "",
      phone: r.get("phone") || "",
      role: r.get("role") || "",
      specialty: r.get("specialty") || "",
      location: r.get("location") || "",
      instagram: r.get("instagram") || "",
      services: r.get("services") || "",
      bio: r.get("bio") || "",
      provider_request_status: r.get("provider_request_status") || "",
    }));
    return e.json(200, providers);
  } catch (err) {
    $app.logger().error("failed to list pending providers", "err", String(err));
    return e.internalServerError("failed to list pending providers", null);
  }
}, $apis.requireAuth("users"));

// POST /providers/request — public endpoint called by the provider sign-up
// form. If the email already belongs to a client account, the request is
// LINKED to that account (no second account created, all client data and
// reservations preserved) and marked "pending". If no account exists, a new
// standalone pending provider account is created. Either way the team
// notification email is handled by the existing provider-signup-notification
// (on create) / provider-update-notifications (on link, via
// provider_request_notify) hooks — nothing to send here.
routerAdd("POST", "/providers/request", (e) => {
  const body = e.requestInfo().body || {};
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) {
    return e.badRequestError("email is required", null);
  }

  const phone = String(body.phone || "").trim();
  const specialty = body.specialty || "";
  const services = body.services || "";
  const location = body.location || "";
  const instagram = body.instagram || "";
  const bio = body.bio || "";

  try {
    let existing = null;
    try {
      existing = $app.findFirstRecordByFilter("users", "email = {:email}", { email: email });
    } catch (err) {
      existing = null; // not found — expected for brand-new signups.
    }

    if (existing) {
      const role = existing.get("role");
      const status = existing.get("provider_request_status");
      const isProvider =
        (role === "provider" && existing.get("validated") === true) || status === "validated";

      if (isProvider) {
        return e.json(200, { ok: true, mode: "already_provider" });
      }
      if (status === "pending") {
        return e.json(200, { ok: true, mode: "already_pending" });
      }

      existing.set("phone", phone);
      existing.set("specialty", specialty);
      existing.set("services", services);
      existing.set("location", location);
      existing.set("instagram", instagram);
      existing.set("bio", bio);
      existing.set("provider_request_status", "pending");
      existing.set("provider_request_notify", true);
      $app.save(existing);
      return e.json(200, { ok: true, mode: "linked" });
    }

    const collection = $app.findCollectionByNameOrId("users");
    const record = new Record(collection, {
      email: email,
      name: String(body.name || "").trim(),
      role: "provider",
      validated: false,
      provider_request_status: "none",
      phone: phone,
      specialty: specialty,
      services: services,
      location: location,
      instagram: instagram,
      bio: bio,
    });
    // Strong random password for brand-new standalone provider accounts. The
    // provider never sees it — they define their own password later via the
    // secure activation link sent on validation.
    record.set("password", $security.randomString(24));
    $app.save(record);

    return e.json(200, { ok: true, mode: "created" });
  } catch (err) {
    $app.logger().error("failed to submit provider request", "err", String(err));
    return e.internalServerError("failed to submit provider request", null);
  }
});

// POST /providers/validate { id } — approve a provider request. Admin only.
// Two cases:
//   - Standalone provider account (role="provider"): mark validated and
//     trigger a password-reset email branded as the activation email (via
//     the provider-activation-email hook) so they can define their password.
//   - Existing client account: grant provider access on the SAME account and
//     let the provider-update-notifications hook send the confirmation email
//     (provider_activated_notify). No password reset — they keep their usual
//     login.
routerAdd("POST", "/providers/validate", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  const body = e.requestInfo().body || {};
  const id = body.id;
  if (!id) {
    return e.badRequestError("id is required", null);
  }

  try {
    const record = $app.findRecordById("users", id);
    const role = record.get("role");

    if (role === "provider") {
      record.set("validated", true);
      record.set("pending_activation", true);
      record.set("provider_request_status", "validated");
      $app.save(record);

      let emailSent = true;
      try {
        $mails.sendRecordPasswordReset($app, record);
      } catch (err) {
        emailSent = false;
        $app.logger().error("provider activation email failed", "user", id, "err", String(err));
      }

      return e.json(200, { ok: true, email_sent: emailSent });
    }

    record.set("validated", true);
    record.set("provider_request_status", "validated");
    record.set("provider_activated_notify", true);
    $app.save(record);

    return e.json(200, { ok: true, email_sent: true });
  } catch (err) {
    $app.logger().error("failed to validate provider", "err", String(err));
    return e.internalServerError("failed to validate provider", null);
  }
}, $apis.requireAuth("users"));

// POST /providers/refuse { id } — refuse a provider request. Admin only.
//   - Standalone provider account (role="provider"): keep the account but
//     mark the request refused so it stays inaccessible as a provider.
//   - Existing client account: mark the request "refused" and clear the
//     provider profile fields, but KEEP the client account fully functional.
routerAdd("POST", "/providers/refuse", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  const body = e.requestInfo().body || {};
  const id = body.id;
  if (!id) {
    return e.badRequestError("id is required", null);
  }

  try {
    const record = $app.findRecordById("users", id);
    const role = record.get("role");

    record.set("provider_request_status", "refused");
    record.set("validated", false);
    record.set("provider_request_notify", false);
    if (role !== "provider") {
      record.set("specialty", "");
      record.set("services", "");
      record.set("location", "");
      record.set("instagram", "");
      record.set("bio", "");
    }
    $app.save(record);
    return e.json(200, { ok: true });
  } catch (err) {
    $app.logger().error("failed to refuse provider", "err", String(err));
    return e.internalServerError("failed to refuse provider", null);
  }
}, $apis.requireAuth("users"));
