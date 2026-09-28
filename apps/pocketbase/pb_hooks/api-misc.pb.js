/// <reference path="../pb_data/types.d.ts" />

// GET /admin/brevo-status
//
// Returns a non-sensitive overview of the transactional email setup for the
// GlowNyo admin dashboard: whether PocketBase's own SMTP relay (Brevo) is
// enabled, and the verified sender identity used for every transactional
// email. No password or secret is ever returned. Admin only.
routerAdd("GET", "/admin/brevo-status", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  const settings = $app.settings();
  return e.json(200, {
    configured: settings.smtp.enabled === true,
    sender: {
      email: settings.meta.senderAddress || "",
      name: settings.meta.senderName || "",
    },
    envKey: "BREVO_SMTP_LOGIN / BREVO_SMTP_KEY",
  });
}, $apis.requireAuth("users"));

// POST /emails/booking-confirmation  { bookingId, force? }
//
// Sends the booking confirmation email to the client AND a notification email
// to the provider (when the booking has a provider_email), via PocketBase's
// own mailer, then updates the booking's `email_status` to "sent" or
// "failed". Public — used by the "Renvoyer l'email" button on the booking
// confirmation screen.
//
// Idempotent: if the email was already sent and `force` is not true, the
// route returns immediately without resending.
routerAdd("POST", "/emails/booking-confirmation", (e) => {
  const body = e.requestInfo().body || {};
  const bookingId = body.bookingId;
  const force = body.force === true;

  if (!bookingId) {
    return e.badRequestError("bookingId is required", null);
  }

  let rec;
  try {
    rec = $app.findRecordById("bookings", bookingId);
  } catch (err) {
    return e.notFoundError("booking not found", null);
  }

  if (rec.get("email_status") === "sent" && !force) {
    return e.json(200, { ok: true, email_status: "sent", skipped: true });
  }

  const name = rec.get("name") || "—";
  const phone = rec.get("phone") || "—";
  const service = rec.get("service") || "—";
  const provider = rec.get("provider") || "—";
  const date = rec.get("date") || "—";
  const time = rec.get("time") || "—";
  const message = rec.get("message") || "—";
  const paymentStatus = rec.get("payment_status") || "pending";
  const clientEmail = rec.get("email") || "";
  const providerEmail = rec.get("provider_email") || "";

  let statusLabel = "En attente de paiement";
  if (paymentStatus === "paid") {
    statusLabel = "Acompte payé";
  } else if (paymentStatus === "failed") {
    statusLabel = "Paiement échoué";
  }

  const clientHtml = `
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
      <p style="color: #F5F0E6; opacity: 0.7; font-size: 14px;">Notre équipe vous contactera rapidement pour confirmer votre créneau. Pour toute question, répondez à cet email ou contactez-nous sur WhatsApp.</p>
      <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">Merci de votre confiance — GlowNyo</p>
      <p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
    </div>`;

  const providerHtml = `
    <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Nouvelle réservation reçue</h1>
      <p style="color: #F5F0E6; opacity: 0.8;">Bonjour ${provider},</p>
      <p style="color: #F5F0E6; opacity: 0.8;">Une nouvelle demande de réservation vous a été adressée sur GlowNyo. Voici les détails du rendez-vous :</p>
      <table cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 16px 0; color: #F5F0E6;">
        <tr><td style="color: #C9922A; font-weight: 600;">Personne cliente</td><td>${name}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Téléphone</td><td>${phone}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Email</td><td>${clientEmail || "—"}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Prestation</td><td>${service}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Date</td><td>${date}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Heure</td><td>${time}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Message</td><td>${message}</td></tr>
        <tr><td style="color: #C9922A; font-weight: 600;">Statut paiement</td><td>${statusLabel}</td></tr>
      </table>
      <p style="color: #F5F0E6; opacity: 0.7; font-size: 14px;">Merci de recontacter la personne qui a réservé rapidement pour confirmer le créneau.</p>
      <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">GlowNyo</p>
      <p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
    </div>`;

  let clientOk = false;
  if (clientEmail) {
    try {
      $app.newMailClient().send(new MailerMessage({
        from: { name: "GlowNyo Réservations" },
        to: [{ address: clientEmail }],
        subject: `Confirmation de votre réservation GlowNyo — ${service}`,
        html: clientHtml,
      }));
      clientOk = true;
    } catch (err) {
      $app.logger().error("client confirmation email failed", "booking", bookingId, "err", String(err));
    }
  }

  // The client email is the primary confirmation. The provider email is
  // best-effort: a provider without an email on file should not mark the
  // whole confirmation as failed for the client.
  let providerOk = true;
  if (providerEmail) {
    try {
      $app.newMailClient().send(new MailerMessage({
        from: { name: "GlowNyo Réservations" },
        to: [{ address: providerEmail }],
        subject: `Nouvelle réservation GlowNyo — ${service} (${date} ${time})`,
        html: providerHtml,
      }));
    } catch (err) {
      providerOk = false;
      $app.logger().error("provider notification email failed", "booking", bookingId, "err", String(err));
    }
  }

  const emailStatus = clientOk ? "sent" : "failed";
  try {
    rec.set("email_status", emailStatus);
    $app.save(rec);
  } catch (err) {
    $app.logger().error("email_status update failed", "booking", bookingId, "err", String(err));
  }

  return e.json(200, {
    ok: emailStatus === "sent",
    email_status: emailStatus,
    provider_notified: providerOk,
  });
});
