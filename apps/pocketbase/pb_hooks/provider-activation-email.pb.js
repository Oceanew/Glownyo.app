/// <reference path="../pb_data/types.d.ts" />

// Provider activation email — sent directly by PocketBase's own mailer
// (Brevo SMTP, configured via the configure-smtp migration), instead of
// forwarding to a separate Express service.
//
// When the admin validate route sets `pending_activation=true` and then calls
// `requestPasswordReset`, PocketBase generates a secure one-time token and
// fires this hook, which customizes the outgoing message before PocketBase
// sends it — same single-send mechanism used for a standard password reset.
//
// The account is already validated by the time this runs, so an email
// failure never blocks activation; a failed send is PocketBase's own concern
// here, same as any other mailer send.
onMailerRecordPasswordResetSend((e) => {
  // $app.settings().meta.appURL is a stale value left over from the old
  // Hostinger hosting (never updated after moving to PocketBase Cloud), so
  // it's not used here. PB_PUBLIC_URL is this PocketBase instance's own
  // public address — set it as an env var if the instance ever moves to a
  // custom domain; the fallback below is today's actual address.
  const appUrl = $os.getenv("PB_PUBLIC_URL") || "https://quhwg47byahipxz.ba7w.pocketbasecloud.com";
  const link = `${appUrl}/_/#/auth/confirm-password-reset/${e.meta.token}`;
  const isActivation = e.record.get("pending_activation") === true;

  if (isActivation) {
    const name = e.record.get("name") || "";

    e.message.from.name = "GlowNyo";
    e.message.subject = "Votre compte prestataire GlowNyo est activé 🎉";
    e.message.html = `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Bienvenue chez GlowNyo !</h1>
        <p style="color: #F5F0E6; opacity: 0.8;">Bonjour${name ? " " + name : ""},</p>
        <p style="color: #F5F0E6; opacity: 0.8;">Bonne nouvelle : votre demande a été validée par l'équipe GlowNyo. Votre compte prestataire est désormais actif.</p>
        <p style="color: #F5F0E6; opacity: 0.8;">Pour accéder à votre espace, définissez votre mot de passe via le lien sécurisé ci-dessous (valable une heure) :</p>
        <p style="margin: 24px 0;">
          <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #E8C877, #C9922A); color: #0A0A0A; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 999px;">Définir mon mot de passe &amp; accéder à mon espace</a>
        </p>
        <p style="color: #F5F0E6; opacity: 0.6; font-size: 13px;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>${link}</p>
        <p style="color: #F5F0E6; opacity: 0.7; font-size: 14px;">Une fois votre mot de passe défini, vous pourrez vous connecter à votre espace prestataire sur GlowNyo.</p>
        <p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">Merci de votre confiance — GlowNyo</p>
        <p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
      </div>
    `;

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
    // Standard password reset — e.g. "mot de passe oublié" from the login
    // page. Existing behaviour preserved unchanged.
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
