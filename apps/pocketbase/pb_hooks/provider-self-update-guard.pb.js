/// <reference path="../pb_data/types.d.ts" />

// Security: `users.updateRule` allows self-update (id = @request.auth.id) so
// providers can edit their own public profile (bio, services, photos)
// directly through the SDK, without a dedicated server route for every field.
//
// That rule has no concept of "which fields" — a self-update request could
// just as easily try to set role="admin" or validated=true. This hook runs
// before every update to the `users` collection and force-resets every
// privilege-sensitive field back to its value before the request, regardless
// of what the client sent. Admin-only changes to these fields still go
// through the superuser SDK (Express/pb_hooks admin routes), which saves
// records directly and never goes through this request-scoped hook.
//
// The field list is inlined inside the handler (not a shared top-level
// const) — a top-level binding referenced from inside a routerAdd/hook
// callback is not reliably visible in this JSVM runtime at actual request
// time (same issue already hit and fixed in api-fedapay.pb.js).
onRecordUpdateRequest((e) => {
  // Superuser-authenticated requests (the Admin Dashboard, or any API call
  // made with a superuser token) are explicitly trusted and skip this guard
  // — otherwise Oceane couldn't validate/edit providers from the dashboard.
  if (!e.hasSuperuserAuth()) {
    const protectedFields = [
      "role",
      "validated",
      "pending_activation",
      "provider_request_status",
      "provider_request_notify",
      "provider_activated_notify",
      "email",
      "emailVisibility",
      "verified",
    ];
    const original = e.record.original();
    for (const field of protectedFields) {
      e.record.set(field, original.get(field));
    }
  }
  e.next();
}, "users");
