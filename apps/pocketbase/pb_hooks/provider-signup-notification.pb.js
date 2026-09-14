/// <reference path="../pb_data/types.d.ts" />

// When a provider submits the sign-up form, a `users` record is created with
// role="provider" and validated=false. This hook fires on every user create,
// but only acts for provider requests: it emails the GlowNyo team a full
// summary so they can review and validate/refuse the request from the admin
// space. No email is sent to the provider at this stage.
onRecordAfterCreateSuccess((e) => {
  const role = e.record.get("role");
  if (role !== "provider") {
    e.next();
    return;
  }

  const notifyTo = "glownyoapp@gmail.com";

  const name = e.record.get("name") || "—";
  const email = e.record.get("email") || "—";
  const phone = e.record.get("phone") || "—";
  const specialty = e.record.get("specialty") || "—";
  const services = e.record.get("services") || "—";
  const location = e.record.get("location") || "—";
  const instagram = e.record.get("instagram") || "—";
  const bio = e.record.get("bio") || "—";

  const html = `
    <div style="font-family: Montserrat, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Nouvelle demande de prestataire</h1>
      <p style="color: #F5F0E6; opacity: 0.8;">Statut : <strong>En attente de validation</strong></p>
      <p style="color: #F5F0E6; opacity: 0.8;">Une nouvelle prestataire souhaite rejoindre GlowNyo. Connectez-vous à l'espace administrateur pour valider ou refuser sa demande.</p>

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
    subject: `Nouvelle demande de prestataire — ${name}`,
    html: html,
  });

  try {
    $app.newMailClient().send(msg);
  } catch (err) {
    $app.logger().error(
      "provider signup notification email failed",
      "err",
      String(err),
    );
  }

  e.next();
}, "users");
