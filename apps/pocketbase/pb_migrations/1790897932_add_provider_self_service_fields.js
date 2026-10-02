/// <reference path="../pb_data/types.d.ts" />

// Adds the fields needed for providers to manage their own public profile
// (bio, prices, photos) from their account, and turns on self-update for the
// `users` collection. Privilege-sensitive fields (role, validated, etc.) are
// protected separately by the onRecordUpdateRequest guard in
// provider-self-update-guard.pb.js — this migration only shapes the schema.
//
// `services` moves from a free-text field (parsed into fake "Sur devis"
// entries by the frontend) to a real JSON list of { name, price, duration },
// so providers can set actual prices. Any existing free-text value is
// converted to the new shape so no data is lost.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    // Stable slug for the public profile URL (/prestataires/<slug>). Optional:
    // providers without one keep falling back to `db-<id>` in the frontend.
    if (!users.fields.getByName("slug")) {
      users.fields.add(new TextField({ name: "slug", max: 150 }));
    }

    if (!users.fields.getByName("experience")) {
      users.fields.add(new TextField({ name: "experience", max: 150 }));
    }
    if (!users.fields.getByName("availability")) {
      users.fields.add(new TextField({ name: "availability", max: 300 }));
    }
    if (!users.fields.getByName("whatsapp_secondary")) {
      users.fields.add(new TextField({ name: "whatsapp_secondary", max: 60 }));
    }
    // Optional manual override; otherwise the frontend derives the
    // "starting at" price shown on cards from the cheapest service price.
    if (!users.fields.getByName("starting_price_override")) {
      users.fields.add(
        new TextField({ name: "starting_price_override", max: 60 }),
      );
    }
    // "circle" for a logo-style photo, "rect" (default/empty) for a portrait.
    if (!users.fields.getByName("avatar_shape")) {
      users.fields.add(
        new SelectField({
          name: "avatar_shape",
          maxSelect: 1,
          values: ["rect", "circle"],
        }),
      );
    }
    if (!users.fields.getByName("rating")) {
      users.fields.add(new NumberField({ name: "rating", min: 0, max: 5 }));
    }
    if (!users.fields.getByName("review_count")) {
      users.fields.add(new NumberField({ name: "review_count", min: 0 }));
    }

    // Legacy static assets (already deployed under apps/web/public/) for
    // providers migrated from the hardcoded PROVIDERS list — no re-upload
    // needed. Used as a fallback only when the native `avatar`/`gallery`
    // file fields below are empty (i.e. the provider hasn't uploaded their
    // own photo yet).
    if (!users.fields.getByName("avatar_url")) {
      users.fields.add(new TextField({ name: "avatar_url", max: 500 }));
    }
    if (!users.fields.getByName("gallery_urls")) {
      users.fields.add(new JSONField({ name: "gallery_urls", maxSize: 20000 }));
    }

    // Native multi-file gallery for self-service uploads (photos + short
    // video clips, matching the gallery video support already shipped).
    if (!users.fields.getByName("gallery")) {
      users.fields.add(
        new FileField({
          name: "gallery",
          maxSelect: 20,
          maxSize: 15 * 1024 * 1024,
          mimeTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/quicktime",
          ],
        }),
      );
    }

    // Convert the old free-text `services` field to a structured JSON list.
    const servicesField = users.fields.getByName("services");
    if (servicesField && servicesField.type() === "text") {
      const records = app.findRecordsByFilter("users", "services != ''", "", 0, 0);
      const parsed = {};
      for (const record of records) {
        const raw = record.get("services");
        const lines = String(raw || "")
          .split(/\r?\n|,|·|;/)
          .map((s) => s.trim())
          .filter(Boolean);
        parsed[record.id] = lines.length
          ? lines.map((name) => ({ name, price: "Sur devis", duration: "—" }))
          : [];
      }

      users.fields.removeByName("services");
      users.fields.add(new JSONField({ name: "services", maxSize: 20000 }));
      app.save(users);

      for (const record of records) {
        record.set("services", parsed[record.id] || []);
        app.save(record);
      }
    } else if (!servicesField) {
      users.fields.add(new JSONField({ name: "services", maxSize: 20000 }));
    }

    // Providers (and clients) can update their own account. The guard hook
    // in provider-self-update-guard.pb.js locks down role/validated/etc so
    // this can never be used to self-promote.
    users.updateRule = "id = @request.auth.id";

    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const servicesField = users.fields.getByName("services");
    if (servicesField && servicesField.type() === "json") {
      const records = app.findRecordsByFilter("users", "", "", 0, 0);
      const flattened = {};
      for (const record of records) {
        const list = record.get("services");
        flattened[record.id] = Array.isArray(list)
          ? list.map((s) => (s && s.name) || "").filter(Boolean).join("\n")
          : "";
      }

      users.fields.removeByName("services");
      users.fields.add(new TextField({ name: "services", max: 2000 }));
      app.save(users);

      for (const record of records) {
        record.set("services", flattened[record.id] || "");
        app.save(record);
      }
    }

    [
      "slug",
      "experience",
      "availability",
      "whatsapp_secondary",
      "starting_price_override",
      "avatar_shape",
      "rating",
      "review_count",
      "avatar_url",
      "gallery_urls",
      "gallery",
    ].forEach((name) => users.fields.removeByName(name));

    users.updateRule = null;

    app.save(users);
  },
);
