/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
  const notifyTo = "glownyoapp@gmail.com";

  const name = e.record.get("name") || "—";
  const phone = e.record.get("phone") || "—";
  const email = e.record.get("email") || "—";
  const service = e.record.get("service") || "—";
  const provider = e.record.get("provider") || "—";
  const date = e.record.get("date") || "—";
  const time = e.record.get("time") || "—";
  const message = e.record.get("message") || "—";

  const html = `
    <h2>Nouvelle demande de réservation — GlowNyo</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      <tr><td><strong>Nom</strong></td><td>${name}</td></tr>
      <tr><td><strong>Téléphone</strong></td><td>${phone}</td></tr>
      <tr><td><strong>Email</strong></td><td>${email}</td></tr>
      <tr><td><strong>Service</strong></td><td>${service}</td></tr>
      <tr><td><strong>Prestataire</strong></td><td>${provider}</td></tr>
      <tr><td><strong>Date</strong></td><td>${date}</td></tr>
      <tr><td><strong>Heure</strong></td><td>${time}</td></tr>
      <tr><td><strong>Message</strong></td><td>${message}</td></tr>
    </table>
  `;

  const message1 = new MailerMessage({
    from: { name: "GlowNyo Réservations" },
    to: [{ address: notifyTo }],
    subject: `Nouvelle réservation — ${name}`,
    html: html,
  });

  try {
    $app.newMailClient().send(message1);
  } catch (err) {
    $app.logger().error("booking notification email failed", "err", String(err));
  }

  e.next();
}, "bookings");
