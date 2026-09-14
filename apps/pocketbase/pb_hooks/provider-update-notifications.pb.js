/// <reference path="../pb_data/types.d.ts" />

// Notification emails for the "existing client becomes provider" flow.
//
// The Express providers-admin route updates an existing client `users` record
// (via the superuser SDK) to either submit a provider request or activate
// provider access. Because these are updates (not creates), the existing
// provider-signup-notification hook (which fires on create) does not run.
// Instead, the route sets a transient boolean flag and this hook consumes it,
// sends exactly one email, then clears the flag — mirroring the
// pending_activation pattern used for standalone provider activation.
onRecordAfterUpdateSuccess((e) => {
  const record = e.record;

  // 1) An existing client just submitted a provider request → notify the team.
  if (record.get("provider_request_notify") === true) {
    const notifyTo = "glownyoapp@gmail.com";

    const name = record.get("name") || "—";
    const email = record.get("email") || "—";
    const phone = record.get("phone") || "—";
    const specialty = record.get("specialty") || "—";
    const services = record.get("services") || "—";
    const location = record.get("location") || "—";
    const instagram = record.get("instagram") || "—";
    const bio = record.get("bio") || "—";

    const html = `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Demande prestataire (compte client existant)</h1>
        <p style="color: #F5F0E6; opacity: 0.8;">Statut : <strong>Demande prestataire en attente</strong></p>
        <p style="color: #F5F0E6; opacity: 0.8;">Une cliente disposant déjà d'un compte GlowNyo souhaite devenir prestataire avec la même adresse email. Son compte client et ses réservations sont conservés. Connectez-vous à l'espace administrateur pour valider ou refuser sa demande.</p>

        <table cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 16px 0; color: #F5F0E6;">
          <tr><td style="color: #C9922A; font-weight: 600;">Nom / Activité</td><td>${name}</td></tr>
          <tr><td style="color: #C9922A; font-weight: 600;">Email</td><td>${email}</td></tr>
          <tr><td style="color: #C9922A; font-weight: 600;">Téléphone / WhatsApp</td><td>${phone}</td></tr>
          <tr><td style="color: #C9922A; font-weight: 600;">Spécialité</td><td>${specialty}</td></tr>
          <tr><td style="color: #C9922A; font-weight: 600;">Services proposés</td><td>${services}</td></tr>
          <tr><td style="color: #C9922A; font-weight: 600;">Localisation</td><td>${location}</td></tr>
          <tr><td style="color: #C9922A; font-weight: 600;">Instagram</td><td>${instagram}</td></tr>
          <tr><td style="color: #C9922A; font-weight: 600;">Présentation</td><td>${bio}</td></tr>
        </table>

        <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">GlowNyo</p>
        <p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
      </div>
    `;

    const msg = new MailerMessage({
      from: { name: "GlowNyo Inscriptions" },
      to: [{ address: notifyTo }],
      subject: `Demande prestataire (compte client existant) — ${name}`,
      html: html,
    });

    try {
      $app.newMailClient().send(msg);
    } catch (err) {
      $app.logger().error(
        "provider request notification email failed",
        "err",
        String(err),
      );
    }

    try {
      record.set("provider_request_notify", false);
      $app.save(record);
    } catch (err) {
      $app.logger().error(
        "failed to clear provider_request_notify flag",
        "err",
        String(err),
      );
    }
  }

  // 2) Admin just activated provider access on an existing client account →
  //    confirm to the provider. No password reset: they keep their usual login.
  if (record.get("provider_activated_notify") === true) {
    const recipient = record.get("email");
    const name = record.get("name") || "";
    const appUrl = $app.settings().meta.appURL;
    const loginUrl = `${appUrl}/connexion`;

    const html = `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Votre accès prestataire GlowNyo est activé 🎉</h1>
        <p style="color: #F5F0E6; opacity: 0.8;">Bonjour${name ? " " + name : ""},</p>
        <p style="color: #F5F0E6; opacity: 0.8;">Bonne nouvelle : votre demande a été validée par l'équipe GlowNyo. Votre compte dispose désormais de l'espace prestataire, en plus de votre espace client habituel.</p>
        <p style="color: #F5F0E6; opacity: 0.8;">Aucune nouvelle connexion à créer : utilisez simplement <strong>votre email et mot de passe habituels</strong> pour vous connecter, puis basculez entre l'espace client et l'espace prestataire depuis votre compte.</p>
        <p style="margin: 24px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #E8C877, #C9922A); color: #0A0A0A; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 999px;">Accéder à mon espace</a>
        </p>
        <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">Merci de votre confiance — GlowNyo</p>
        <p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
      </div>
    `;

    const msg = new MailerMessage({
      from: { name: "GlowNyo" },
      to: [{ address: recipient }],
      subject: "Votre accès prestataire GlowNyo est activé 🎉",
      html: html,
    });

    try {
      $app.newMailClient().send(msg);
    } catch (err) {
      $app.logger().error(
        "provider activated notification email failed",
        "err",
        String(err),
      );
    }

    try {
      record.set("provider_activated_notify", false);
      $app.save(record);
    } catch (err) {
      $app.logger().error(
        "failed to clear provider_activated_notify flag",
        "err",
        String(err),
      );
    }
  }

  e.next();
}, "users");
