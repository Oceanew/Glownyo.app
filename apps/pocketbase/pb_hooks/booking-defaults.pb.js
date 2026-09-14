/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  const status = e.record.get("payment_status");
  if (!status) {
    e.record.set("payment_status", "pending");
  }
  // email_status is updated by the confirmation-email hook after the record
  // is saved; default to "pending" until then.
  if (!e.record.get("email_status")) {
    e.record.set("email_status", "pending");
  }
  e.next();
}, "bookings");
