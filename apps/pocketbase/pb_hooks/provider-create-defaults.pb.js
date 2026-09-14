/// <reference path="../pb_data/types.d.ts" />

// Security: the `users` createRule is open (guests can self-register). A
// provider signing up must never be able to set validated=true or
// pending_activation=true themselves — that would bypass admin validation.
// This hook runs before validation on every user create and force-resets those
// flags when role="provider", regardless of what the client sent.
onRecordCreateRequest((e) => {
  const role = e.record.get("role");
  if (role === "provider") {
    e.record.set("validated", false);
    e.record.set("pending_activation", false);
  }
  e.next();
}, "users");
