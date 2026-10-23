/// <reference path="../pb_data/types.d.ts" />

// Security: when someone signs in with Google for the first time, PocketBase
// auto-creates a new `users` record from the OAuth2 response plus whatever
// `createData` the client included in the request body — same shape of risk
// as the plain self-registration endpoint (see provider-create-defaults.pb.js):
// a crafted request like {"createData": {"role": "admin"}} would otherwise be
// accepted as-is. This hook runs on every Google sign-in/sign-up request and,
// whenever a brand-new account is about to be created, force-resets every
// privilege-sensitive field regardless of what the client sent — a Google
// sign-in can only ever produce a new "client" account, never a provider or
// an admin.
//
// Linking is unaffected: when the signed-in Google account's email already
// matches an existing `users` record, PocketBase reuses that record instead
// of creating a new one (e.isNewRecord is false) — this hook does nothing in
// that case, so an existing provider or admin account keeps its own role
// when it links to or signs in with Google.
onRecordAuthWithOAuth2Request((e) => {
  if (e.isNewRecord) {
    e.createData.role = "client";
    e.createData.validated = false;
    e.createData.pending_activation = false;
    e.createData.provider_request_status = "none";
    e.createData.provider_request_notify = false;
    e.createData.provider_activated_notify = false;
    e.createData.provider_paused_notify = false;
    e.createData.provider_reactivated_notify = false;
    e.createData.emailVisibility = false;
    // Google already verified this exact email address.
    e.createData.verified = true;
  }
  e.next();
}, "users");
