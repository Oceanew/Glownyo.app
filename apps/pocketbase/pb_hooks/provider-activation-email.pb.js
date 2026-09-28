/// <reference path="../pb_data/types.d.ts" />

// Provider activation email — sent via Brevo through the Express backend.
//
// When the admin validate route sets `pending_activation=true` and then calls
// `requestPasswordReset`, PocketBase generates a secure one-time token and
// fires this hook. The hook forwards the recipient, the provider name and the
// secure activation link to the Express `/emails/provider-activation` route,
// which sends the branded activation email via Brevo. The Brevo API key stays
// only in the Express environment — this hook never touches it.
//
// The account is already validated by the time this runs, so an email failure
// never blocks activation: it is logged (non-sensitive info only) and the
// provider can request a fresh reset link later.
//
// A standard (non-activation) password reset — e.g. "mot de passe oublié" from
// the login page — is still sent through the PocketBase built-in mailer so that
// existing behaviour is preserved unchanged.
onMailerRecordPasswordResetSend((e) => {
  const appUrl = $app.settings().meta.appURL;
  const link = `${appUrl}/_/#/auth/confirm-password-reset/${e.meta.token}`;
  const isActivation = e.record.get("pending_activation") === true;

  if (isActivation) {
    const recipient = e.record.get("email");
    const name = e.record.get("name") || "";
    const payload = JSON.stringify({ recipient: recipient, name: name, link: link });

    try {
      $http.send({
        url: "http://localhost:3001/emails/provider-activation",
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });
    } catch (err) {
      $app.logger().error(
        "activation email forward to Express failed",
        "err",
        String(err),
      );
    }

    // Clear the transient flag so a future reset request is handled as a
    // standard password reset (sent via the PocketBase mailer below).
    try {
      e.record.set("pending_activation", false);
      $app.save(e.record);
    } catch (err) {
      $app.logger().error(
        "failed to clear pending_activation flag",
        "err",
        String(err),
      );
    }
  } else {
    // Standard password reset — keep the existing PocketBase mailer flow.
    e.message.from.name = "GlowNyo";
    e.message.subject = "Réinitialisez votre mot de passe GlowNyo";
    e.message.html = `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Réinitialisation de votre mot de passe</h1>
        <p style="color: #F5F0E6; opacity: 0.8;">Vous avez demandé à réinitialiser votre mot de passe GlowNyo. Cliquez sur le lien ci-dessous pour en définir un nouveau (valable une heure) :</p>
        <p style="margin: 24px 0;">
          <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #E8C877, #C9922A); color: #0A0A0A; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 999px;">Réinitialiser mon mot de passe</a>
        </p>
        <p style="color: #F5F0E6; opacity: 0.6; font-size: 13px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">GlowNyo</p>
      </div>
    `;
  }

  e.next();
}, "users");
