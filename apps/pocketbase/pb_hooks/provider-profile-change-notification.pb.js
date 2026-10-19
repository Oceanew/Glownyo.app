/// <reference path="../pb_data/types.d.ts" />

// Notifies Oceane (via `notifications_admin`, and by email when her
// attention is actually needed) whenever a provider edits her own public
// profile. Listens on the same request-scoped event as
// provider-self-update-guard.pb.js — `e.hasSuperuserAuth()` is false only
// for a genuine provider self-edit (the admin dashboard and every
// $app.save()-driven admin route, e.g. gallery approval, never reach here).
//
// Diff is computed from `e.record` (the about-to-be-saved values) against
// `e.record.original()` (the pre-request DB values) BEFORE calling e.next(),
// then the notification is only actually written AFTER e.next() returns
// without throwing — so a request that fails validation never produces a
// false notification.
onRecordUpdateRequest((e) => {
  if (e.hasSuperuserAuth()) {
    e.next();
    return;
  }

  // A JSONField's .get() can come back as a Go-backed byte-array wrapper
  // instead of a real JS array/value — same quirk documented in
  // booking-defaults.pb.js and api-providers.pb.js. Crucially, that wrapper
  // can itself report true for Array.isArray() (goja exposes it as an
  // array-like of raw bytes), so the .string()-based unwrap must be tried
  // FIRST — checking Array.isArray() first silently "succeeds" on the byte
  // array and returns its byte count instead of the real element count. An
  // already-real array (FileField values) has no .string() and falls
  // through to the plain Array.isArray() check below.
  const toArray = (v) => {
    if (v && typeof v.string === "function") {
      try {
        const parsed = JSON.parse(v.string() || "null");
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return [];
      }
    }
    if (Array.isArray(v)) return v;
    return [];
  };

  const original = e.record.original();
  const name = e.record.get("name") || "Un ou une prestataire";

  const changes = [];

  const oldAvatar = original.get("avatar") || "";
  const newAvatar = e.record.get("avatar") || "";
  if (oldAvatar !== newAvatar && newAvatar) {
    changes.push("mis à jour sa photo de profil");
  }

  const oldPending = toArray(original.get("gallery_pending"));
  const newPending = toArray(e.record.get("gallery_pending"));
  if (newPending.length > oldPending.length) {
    const added = newPending.length - oldPending.length;
    changes.push(`ajouté ${added} réalisation${added > 1 ? "s" : ""}`);
  }

  const oldGallery = toArray(original.get("gallery"));
  const newGallery = toArray(e.record.get("gallery"));
  if (newGallery.length < oldGallery.length) {
    changes.push("retiré une réalisation");
  }

  const oldServices = toArray(original.get("services"));
  const newServices = toArray(e.record.get("services"));
  const servicesChanged = JSON.stringify(oldServices) !== JSON.stringify(newServices);
  if (servicesChanged && newServices.length > oldServices.length) {
    const added = newServices.length - oldServices.length;
    changes.push(`ajouté ${added} prestation${added > 1 ? "s" : ""}`);
  } else if (servicesChanged) {
    changes.push("modifié ses prestations");
  }

  if ((original.get("bio") || "") !== (e.record.get("bio") || "")) {
    changes.push("modifié sa description");
  }

  const oldSchedule = toArray(original.get("availability_schedule"));
  const newSchedule = toArray(e.record.get("availability_schedule"));
  const scheduleChanged = JSON.stringify(oldSchedule) !== JSON.stringify(newSchedule);
  const availabilityTextChanged =
    (original.get("availability") || "") !== (e.record.get("availability") || "");
  if (scheduleChanged || availabilityTextChanged) {
    changes.push("modifié ses disponibilités");
  }

  // Profile completeness transition — same definition as /providers/public's
  // visibility filter (a photo, native or legacy, and at least one service).
  const wasComplete =
    !!(original.get("avatar") || original.get("avatar_url")) && oldServices.length > 0;
  const isComplete =
    !!(e.record.get("avatar") || e.record.get("avatar_url")) && newServices.length > 0;
  const becameComplete = !wasComplete && isComplete;

  e.next();

  if (changes.length === 0 && !becameComplete) {
    return;
  }

  const joinFrench = (items) => {
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} et ${items[1]}`;
    return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
  };

  try {
    const collection = $app.findCollectionByNameOrId("notifications_admin");

    if (changes.length > 0) {
      const record = new Record(collection, {
        prestataire: e.record.id,
        prestataire_nom: name,
        message: `${name} a ${joinFrench(changes)}`,
        type: "modification",
        lu: false,
      });
      $app.save(record);
    }

    if (becameComplete) {
      const record = new Record(collection, {
        prestataire: e.record.id,
        prestataire_nom: name,
        message: `Le profil de ${name} est maintenant complet et visible sur le site`,
        type: "profil_complet",
        lu: false,
      });
      $app.save(record);
    }
  } catch (err) {
    $app.logger().error("failed to create provider profile notification", "err", String(err));
  }

  if (becameComplete) {
    const notifyTo = "glownyoapp@gmail.com";
    const html = `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Un profil prestataire est maintenant complet 🎉</h1>
        <p style="color: #F5F0E6; opacity: 0.8;">${name} vient d'ajouter sa photo de profil et au moins une prestation : son profil est désormais visible sur le site public.</p>
        <p style="color: #F5F0E6; opacity: 0.8;">Connectez-vous à votre espace administrateur pour y jeter un œil.</p>
        <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">GlowNyo</p>
        <p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
      </div>
    `;
    try {
      $app.newMailClient().send(new MailerMessage({
        from: { name: "GlowNyo" },
        to: [{ address: notifyTo }],
        subject: `Profil complet — ${name}`,
        html: html,
      }));
    } catch (err) {
      $app.logger().error("profile complete notification email failed", "err", String(err));
    }
  }
}, "users");
