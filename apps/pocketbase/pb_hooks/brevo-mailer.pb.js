/// <reference path="../pb_data/types.d.ts" />

// Sends every outgoing PocketBase email — booking confirmation, provider
// notification, provider sign-up alert, activation/password-reset — through
// Brevo's transactional email API (https://api.brevo.com/v3/smtp/email).
//
// This is the primary email path: it only needs BREVO_API_KEY and
// EMAIL_SENDER_ADDRESS (see apps/pocketbase/.env.example — README has the
// step-by-step). If BREVO_API_KEY isn't set, this falls through to
// PocketBase's own SMTP mailer instead (configured, if at all, by
// pb_migrations/1789403173_configure_smtp.js) — so a Brevo SMTP key still
// works as an alternative to the API key.
onMailerSend((e) => {
  const apiKey = $os.getenv("BREVO_API_KEY");
  if (!apiKey) {
    return e.next();
  }

  const senderAddress = $os.getenv("EMAIL_SENDER_ADDRESS");
  if (!senderAddress) {
    $app.logger().error("brevo-mailer: EMAIL_SENDER_ADDRESS is not set, cannot send");
    throw new ApiError(500, "EMAIL_SENDER_ADDRESS is not configured");
  }

  const payload = {
    sender: {
      name: e.message.from?.name || $os.getenv("EMAIL_SENDER_NAME") || "GlowNyo",
      email: senderAddress,
    },
    to: (e.message.to || []).map((r) => ({ email: r.address, name: r.name || undefined })),
    subject: e.message.subject,
    ...(e.message.html
      ? { htmlContent: e.message.html }
      : { textContent: e.message.text }),
  };

  const response = $http.send({
    url: "https://api.brevo.com/v3/smtp/email",
    method: "POST",
    headers: {
      "api-key": apiKey,
      "accept": "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.statusCode >= 300) {
    $app.logger().error("brevo-mailer: send failed", "status", response.statusCode, "body", response.json);
    throw new ApiError(500, response.json?.message || "Failed to send email via Brevo");
  }
})
