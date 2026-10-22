/// <reference path="../pb_data/types.d.ts" />

// Enables Google as an OAuth2 sign-in provider on the `users` collection, so
// clients and providers can log in with one click instead of (or in
// addition to) a classic email/password account.
//
// Requires these env vars on the PocketBase process itself (see
// apps/pocketbase/.env.example — README has the step-by-step for getting
// them from Google Cloud Console):
//   GOOGLE_OAUTH_CLIENT_ID     - OAuth 2.0 Client ID from Google Cloud Console
//   GOOGLE_OAUTH_CLIENT_SECRET - OAuth 2.0 Client secret from the same screen
//
// If either var is missing, Google sign-in is left disabled rather than
// saved half-configured — safer than a broken "Continuer avec Google"
// button, and idempotent on redeploy once the vars are set.
//
// The `name`/`avatar` fields already exist on `users` and are already the
// default oauth2.mappedFields target for name/avatarURL, so Google's name
// and profile photo land there automatically — no field changes needed.
//
// SECURITY: this only turns the provider on. Which role a Google sign-in
// actually gets (always "client", never "admin"/"provider") is enforced in
// pb_hooks/oauth2-create-defaults.pb.js, not here.
migrate(
  (app) => {
    const clientId = $os.getenv("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = $os.getenv("GOOGLE_OAUTH_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      console.log(
        "configure-google-oauth2: GOOGLE_OAUTH_CLIENT_ID and/or GOOGLE_OAUTH_CLIENT_SECRET are not set — leaving Google sign-in disabled.",
      );
      return;
    }

    const users = app.findCollectionByNameOrId("users");

    const providers = (users.oauth2.providers || []).filter((p) => p.name !== "google");
    providers.push({ name: "google", clientId: clientId, clientSecret: clientSecret });

    users.oauth2.providers = providers;
    users.oauth2.enabled = true;

    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const providers = (users.oauth2.providers || []).filter((p) => p.name !== "google");
    users.oauth2.providers = providers;
    users.oauth2.enabled = providers.length > 0;
    app.save(users);
  },
);
