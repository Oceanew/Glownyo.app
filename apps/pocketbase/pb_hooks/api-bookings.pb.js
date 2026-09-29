/// <reference path="../pb_data/types.d.ts" />

// GET /bookings — every reservation, newest first. Admin only.
routerAdd("GET", "/bookings", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  const bookings = $app.findRecordsByFilter("bookings", "", "-created", 0, 0);
  return e.json(200, bookings);
}, $apis.requireAuth("users"));

// POST /bookings/check-slot  { provider, date, time }
// Public (called by the booking form, including guests). Returns whether the
// given provider+date+time slot is still available. This is a UX pre-check —
// the authoritative race-condition guard is the partial UNIQUE index on
// bookings(provider, date, time), which rejects concurrent creates at the DB
// level. On any internal error we fail OPEN (available: true) so the visitor
// can still submit; the create call is the final arbiter.
routerAdd("POST", "/bookings/check-slot", (e) => {
  const body = e.requestInfo().body || {};
  const provider = body.provider;
  const date = body.date;
  const time = body.time;

  if (!provider || !date || !time) {
    return e.json(200, { available: true });
  }

  try {
    const existing = $app.findRecordsByFilter(
      "bookings",
      "provider = {:provider} && date = {:date} && time = {:time}",
      "",
      0,
      0,
      { provider: provider, date: date, time: time },
    );
    return e.json(200, { available: existing.length === 0 });
  } catch (err) {
    $app.logger().error("check-slot failed", "err", String(err));
    return e.json(200, { available: true });
  }
});

// GET /bookings/{id}/status
// Public, returns only non-sensitive status fields. Used by the booking
// confirmation screen to report whether the confirmation email was sent.
// The booking id is a 15-char random, unguessable token. No PII is exposed.
routerAdd("GET", "/bookings/{id}/status", (e) => {
  const id = e.request.pathValue("id");
  if (!id) {
    return e.badRequestError("id is required", null);
  }

  try {
    const rec = $app.findRecordById("bookings", id);
    return e.json(200, {
      payment_status: rec.get("payment_status") || "pending",
      email_status: rec.get("email_status") || "pending",
    });
  } catch (err) {
    return e.notFoundError("not found", null);
  }
});

// POST /bookings/{id}/status  { status }
//
// Lets the GlowNyo admin team manage a reservation's lifecycle independently
// of the FedaPay payment status. Allowed values: confirmed, cancelled,
// completed (and pending to revert). Admin only. Runs through $app.save,
// which bypasses the collection's REST updateRule (null) — so the booking
// stays immutable to ordinary users via the public API.
routerAdd("POST", "/bookings/{id}/status", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  const id = e.request.pathValue("id");
  const body = e.requestInfo().body || {};
  const status = body.status;
  const allowed = ["pending", "confirmed", "cancelled", "completed"];

  if (!id) {
    return e.badRequestError("id is required", null);
  }
  if (!allowed.includes(status)) {
    return e.badRequestError("invalid status", null);
  }

  try {
    const rec = $app.findRecordById("bookings", id);
    rec.set("booking_status", status);
    $app.save(rec);
    return e.json(200, { ok: true, id: rec.id, booking_status: rec.get("booking_status") });
  } catch (err) {
    $app.logger().error("failed to update booking status", "booking", id, "err", String(err));
    return e.internalServerError("failed to update booking status", null);
  }
}, $apis.requireAuth("users"));
