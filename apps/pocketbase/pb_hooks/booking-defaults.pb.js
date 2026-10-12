/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  // JS Date#getDay(): 0 = Sunday ... 6 = Saturday — matches the day codes
  // used in users.availability_schedule (see BookingPage.jsx on the
  // frontend, which mirrors this exact rule for the live form warning).
  // Declared inline, not at module top-level: a shared top-level const is
  // not reliably visible inside a hook callback at actual request time in
  // this JSVM runtime (same quirk hit with PROTECTED_FIELDS in
  // provider-self-update-guard.pb.js) — it throws ReferenceError and the
  // whole request fails instead of just skipping the schedule check.
  const BOOKING_DAY_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  // Security: the `bookings` createRule is open (guests book without an
  // account), but that also meant a plain public POST could create a
  // booking already marked payment_status="paid" — skipping FedaPay
  // entirely — or set `owner` to any other user's id, planting a fake
  // reservation in a stranger's "Mes rendez-vous". Both confirmed during
  // the 2026-10 security audit. These fields are now force-reset on every
  // create regardless of what the client sent — payment/email/booking
  // status always start at their real default, fedapay_transaction_id
  // can't be forged, and `owner` can only ever be the actual signed-in
  // visitor (or unset, for a guest booking) — never an arbitrary id.
  if (!e.hasSuperuserAuth()) {
    e.record.set("payment_status", "pending");
    e.record.set("email_status", "pending");
    e.record.set("booking_status", "pending");
    e.record.set("fedapay_transaction_id", "");
    e.record.set("owner", e.auth ? e.auth.id : "");
  }

  // Defense in depth: the booking form already blocks a request outside the
  // provider's own weekly hours client-side, but a direct API call could
  // skip that — so re-check here. `provider` on a booking is free text (the
  // provider's display name, not a relation), same pattern reviews use, so
  // match providers by name. Fails OPEN (no rejection) whenever the
  // provider can't be matched or hasn't set a schedule, so "peu importe"
  // bookings and the still-hardcoded providers (no account yet) are
  // unaffected.
  const date = e.record.get("date");
  const time = e.record.get("time");
  const providerName = e.record.get("provider");
  if (date && time && providerName) {
    // Only the lookup is allowed to fail silently (provider not found by
    // name — a guest typed free text, or a still-hardcoded provider with no
    // account). The schedule check below runs OUTSIDE this try/catch: an
    // earlier version threw BadRequestError from inside it and relied on
    // `err instanceof BadRequestError` to re-throw it, but that check
    // never matched in the JSVM runtime (same cross-realm quirk hit
    // elsewhere in this codebase), so the rejection was silently
    // swallowed and every booking went through regardless of schedule.
    let provider = null;
    try {
      provider = $app.findFirstRecordByFilter(
        "users",
        "name = {:name}",
        { name: providerName },
      );
    } catch (err) {
      provider = null;
    }

    if (provider) {
      // provider.get() on a JSONField returns a Go-backed types.JSONRaw for
      // a record freshly loaded from the DB (as opposed to e.record inside
      // a request hook, which already holds a real parsed JS array) — its
      // JS shape is itself an array of raw JSON bytes, not of day objects,
      // so Array.isArray/.find() on it silently iterate byte numbers
      // instead. .string() + JSON.parse gives the real structured value.
      const rawSchedule = provider.get("availability_schedule");
      const schedule =
        rawSchedule && typeof rawSchedule.string === "function"
          ? JSON.parse(rawSchedule.string() || "null")
          : null;
      if (Array.isArray(schedule) && schedule.length > 0) {
        const parsed = new Date(date + "T00:00:00");
        const dayCode = Number.isNaN(parsed.getTime())
          ? null
          : BOOKING_DAY_CODES[parsed.getDay()];
        const day = schedule.find((d) => d && d.day === dayCode);
        if (!day || !day.enabled) {
          throw new BadRequestError(
            "Cette prestataire ne reçoit pas ce jour-là.",
            null,
          );
        }
        if (time < day.start || time > day.end) {
          throw new BadRequestError(
            `Cette prestataire reçoit de ${day.start} à ${day.end} ce jour-là.`,
            null,
          );
        }
      }
    }
  }

  e.next();
}, "bookings");
