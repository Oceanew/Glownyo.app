/// <reference path="../pb_data/types.d.ts" />

// Sends a confirmation email to the customer after a successful booking
// record creation. Only fires after the record is persisted, so a failed
// save never triggers an email. No-op when the customer left no email.
onRecordAfterCreateSuccess((e) => {
  const recipient = e.record.get("email");
  if (!recipient) {
    e.next();
    return;
  }

  const name = e.record.get("name") || "—";
  const phone = e.record.get("phone") || "—";
  const service = e.record.get("service") || "—";
  const provider = e.record.get("provider") || "—";
  const date = e.record.get("date") || "—";
  const time = e.record.get("time") || "—";
  const message = e.record.get("message") || "—";
  const paymentStatus = e.record.get("payment_status") || "pending";

  const statusLabel =
    paymentStatus === "paid"
      ? "Acompte payé"
      : paymentStatus === "failed"
        ? "Paiement échoué"
        : "En attente de paiement";

  const html = `
    <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Confirmation de votre réservation</h1>
      <p style="color: #F5F0E6; opacity: 0.8;">Bonjour ${name},</p>
      <p style="color: #F5F0E6; opacity: 0.8;">Nous avons bien reçu votre demande de réservation chez GlowNyo. Voici le récapitulatif de votre rendez-vous :</p>

      <table cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 16px 0; color: #F5F0E6;">
        <tr><td style="color: #C9922A; font-weight: 600;">Prestataire</td><td>${provider}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Prestation</td><td>${service}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Date</td><td>${date}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Heure</td><td>${time}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Téléphone</td><td>${phone}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Message</td><td>${message}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Statut</td><td>${statusLabel}</td></tr>
      </table>

      <p style="color: #F5F0E6; opacity: 0.7; font-size: 14px;">
        Notre équipe vous contactera rapidement pour confirmer votre créneau. Pour toute question, répondez à cet email ou contactez-nous sur WhatsApp.
      </p>

      <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">Merci de votre confiance — GlowNyo</p>
      <p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
    </div>
  `;

  const msg = new MailerMessage({
    from: { name: "GlowNyo Réservations" },
    to: [{ address: recipient }],
    subject: `Confirmation de votre réservation GlowNyo — ${service}`,
    html: html,
  });

  try {
    $app.newMailClient().send(msg);
    // Mark the confirmation email as sent so the confirmation screen can
    // report success to the client. Best-effort: a failure here must never
    // abort the booking, which is already persisted.
    try {
      e.record.set("email_status", "sent");
      $app.save(e.record);
    } catch (saveErr) {
      $app.logger().error("email_status update (sent) failed", "err", String(saveErr));
    }
  } catch (err) {
    $app.logger().error("booking confirmation email failed", "to", recipient, "err", String(err));
    // The booking stays recorded — only flag the email as failed so the
    // client is clearly told the situation.
    try {
      e.record.set("email_status", "failed");
      $app.save(e.record);
    } catch (saveErr) {
      $app.logger().error("email_status update (failed) failed", "err", String(saveErr));
    }
  }

  e.next();
}, "bookings");
