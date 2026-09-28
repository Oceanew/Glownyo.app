/// <reference path="../pb_data/types.d.ts" />

// Configures PocketBase's mailer to send through Brevo's SMTP relay.
//
// Without this, PocketBase has no SMTP configured at all, so every
// transactional email — booking confirmation, provider notification,
// provider sign-up alert, provider activation — silently fails to send.
//
// Requires these env vars on the PocketBase process itself (see
// apps/pocketbase/.env.example — README has the step-by-step for getting
// them from Brevo):
//   BREVO_SMTP_LOGIN     - SMTP login shown on Brevo's SMTP & API page
//   BREVO_SMTP_KEY       - SMTP key (password) generated on that page
//   EMAIL_SENDER_ADDRESS - "from" address; must be a verified sender or
//                          domain in Brevo, otherwise Brevo rejects the send
//   EMAIL_SENDER_NAME    - "from" display name (defaults to "GlowNyo")
//
// If any of the three required vars is missing, SMTP is left disabled
// rather than saved half-configured — safer than emails silently failing
// with a confusing error, and idempotent on redeploy once the vars are set.
migrate(
  (app) => {
    const login = $os.getenv("BREVO_SMTP_LOGIN");
    const key = $os.getenv("BREVO_SMTP_KEY");
    const senderAddress = $os.getenv("EMAIL_SENDER_ADDRESS");

    if (!login || !key || !senderAddress) {
      console.log(
        "configure-smtp: BREVO_SMTP_LOGIN, BREVO_SMTP_KEY and/or EMAIL_SENDER_ADDRESS are not set — leaving SMTP disabled.",
      );
      return;
    }

    const settings = app.settings();

    settings.smtp.enabled = true;
    settings.smtp.host = "smtp-relay.brevo.com";
    settings.smtp.port = 587;
    settings.smtp.username = login;
    settings.smtp.password = key;
    // Port 587 uses STARTTLS: PocketBase sends the STARTTLS command and lets
    // the server upgrade the connection when `tls` is false. Setting it to
    // true is for implicit TLS (port 465), which Brevo also supports but
    // isn't what this migration configures.
    settings.smtp.tls = false;

    settings.meta.senderAddress = senderAddress;
    settings.meta.senderName = $os.getenv("EMAIL_SENDER_NAME") || "GlowNyo";

    app.save(settings);
  },
  (app) => {
    const settings = app.settings();
    settings.smtp.enabled = false;
    app.save(settings);
  },
);
