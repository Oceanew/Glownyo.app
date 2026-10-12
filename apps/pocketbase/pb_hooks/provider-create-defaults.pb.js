/// <reference path="../pb_data/types.d.ts" />

// Security: the `users` createRule is open (guests can self-register). This
// hook runs before validation on every user create and force-resets every
// privilege-sensitive field, regardless of what the client sent.
//
// FIXED 2026-10 security audit — the previous version only reset
// validated/pending_activation when role === "provider", which left `role`
// itself wide open: a plain unauthenticated POST to
// /api/collections/users/records with {"role":"admin","validated":true}
// was accepted as-is and created a fully working admin account (confirmed
// end-to-end: the resulting account could log in and call admin-only
// routes). Only "client" and "provider" may ever be self-selected now;
// anything else (most importantly "admin") silently falls back to "client".
onRecordCreateRequest((e) => {
  if (!e.hasSuperuserAuth()) {
    const role = e.record.get("role");
    e.record.set("role", role === "provider" ? "provider" : "client");
    e.record.set("validated", false);
    e.record.set("pending_activation", false);
    e.record.set("provider_request_status", "none");
    e.record.set("provider_request_notify", false);
    e.record.set("provider_activated_notify", false);
    e.record.set("provider_paused_notify", false);
    e.record.set("provider_reactivated_notify", false);
    e.record.set("emailVisibility", false);
    e.record.set("verified", false);
  }
  e.next();
}, "users");
