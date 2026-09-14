/// <reference path="../pb_data/types.d.ts" />

// Notifies the concerned provider by email when a new booking is created.
// Only fires after the record is persisted. No-op when the booking has no
// provider email on file (e.g. "Peu importe / à conseiller" selection).
onRecordAfterCreateSuccess((e) => {
  const providerEmail = e.record.get("provider_email");
  if (!providerEmail) {
    e.next();
    return;
  }

  const name = e.record.get("name") || "—";
  const phone = e.record.get("phone") || "—";
  const email = e.record.get("email") || "—";
  const service = e.record.get("service") || "—";
  const provider = e.record.get("provider") || "—";
  const date = e.record.get("date") || "—";
  const time = e.record.get("time") || "—";
  const message = e.record.get("message") || "—";

  const html = `
    <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Nouvelle réservation reçue</h1>
      <p style="color: #F5F0E6; opacity: 0.8;">Bonjour ${provider},</p>
      <p style="color: #F5F0E6; opacity: 0.8;">Une cliente vient de réserver une prestation chez vous via GlowNyo. Voici les détails du rendez-vous :</p>

      <table cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 16px 0; color: #F5F0E6;">
        <tr><td style="color: #C9922A; font-weight: 600;">Cliente</td><td>${name}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Téléphone</td><td>${phone}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Email</td><td>${email}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Prestation</td><td>${service}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Date souhaitée</td><td>${date}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Heure souhaitée</td><td>${time}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Message</td><td>${message}</td></tr>
      </table>

      <p style="color: #F5F0E6; opacity: 0.7; font-size: 14px;">
        Contactez rapidement la cliente pour confirmer le créneau. Pour toute question, répondez à cet email
        ou contactez l'équipe GlowNyo sur WhatsApp.
      </p>

      <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">— L'équipe GlowNyo</p>
      <p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
    </div>
  `;

  const msg = new MailerMessage({
    from: { name: "GlowNyo Réservations" },
    to: [{ address: providerEmail }],
    subject: `Nouvelle réservation reçue — ${service}`,
    html: html,
  });

  try {
    $app.newMailClient().send(msg);
  } catch (err) {
    $app.logger().error("provider notification email failed", "to", providerEmail, "err", String(err));
  }

  e.next();
}, "bookings");
