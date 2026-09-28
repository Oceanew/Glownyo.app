/// <reference path="../pb_data/types.d.ts" />

// POST /reviews  { booking_id, rating, comment }
//
// Creates an authentic client review tied to a completed booking. Requires a
// logged-in user. Server-side validation enforces every rule:
//   - the booking must exist and belong to this user
//     (booking.owner = user.id OR booking.email = user.email)
//   - the booking must be completed (booking_status = 'completed')
//   - the booking must not already have a review (unique index + explicit
//     check, so a duplicate returns a clear 409 instead of a raw 400)
// The review stores the provider name (copied from the booking) so it can be
// filtered on the provider profile, plus a snapshot of the client's display
// name. Writes go through $app.save (bypasses createRule=null), so no client
// can forge a review through the public REST API.
routerAdd("POST", "/reviews", (e) => {
  if (!e.auth) {
    return e.unauthorizedError("unauthorized", null);
  }

  const body = e.requestInfo().body || {};
  const bookingId = body.booking_id;
  if (!bookingId) {
    return e.badRequestError("booking_id is required", null);
  }

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return e.badRequestError("invalid_rating", null);
  }
  const text = String(body.comment || "").trim();
  if (!text) {
    return e.badRequestError("comment_required", null);
  }
  if (text.length > 2000) {
    return e.badRequestError("comment_too_long", null);
  }

  let booking;
  try {
    booking = $app.findRecordById("bookings", bookingId);
  } catch (err) {
    return e.notFoundError("booking_not_found", null);
  }

  // Ownership: the booking must belong to this user. Accept either the owner
  // relation or a matching email (covers bookings made before the account
  // was created with the same email).
  const ownerId = booking.get("owner") || "";
  const ownerMatch = ownerId === e.auth.id;
  const bookingEmail = String(booking.get("email") || "").toLowerCase();
  const authEmail = String(e.auth.get("email") || "").toLowerCase();
  if (!ownerMatch && bookingEmail !== authEmail) {
    return e.forbiddenError("not_owner", null);
  }

  // Only completed bookings can be reviewed — not pending, confirmed, or
  // cancelled.
  if (booking.get("booking_status") !== "completed") {
    return e.forbiddenError("booking_not_completed", null);
  }

  // Duplicate guard: one review per booking. The unique index is the last
  // line of defense; this check returns a clear 409 first.
  try {
    $app.findFirstRecordByFilter("reviews", "booking = {:id}", { id: bookingId });
    return e.json(409, { error: "already_reviewed" });
  } catch (err) {
    // not found — no existing review, continue.
  }

  try {
    const displayName = e.auth.get("name") || e.auth.get("email") || "Client GlowNyo";
    const collection = $app.findCollectionByNameOrId("reviews");
    const review = new Record(collection, {
      rating: rating,
      comment: text,
      booking: bookingId,
      provider: booking.get("provider") || "",
      client: e.auth.id,
      client_name: displayName,
      hidden: false,
    });
    $app.save(review);

    return e.json(200, {
      ok: true,
      id: review.id,
      rating: review.get("rating"),
      comment: review.get("comment"),
      client_name: review.get("client_name"),
      created: review.get("created"),
    });
  } catch (err) {
    $app.logger().error("failed to create review", "booking", bookingId, "err", String(err));
    return e.internalServerError("failed to create review", null);
  }
}, $apis.requireAuth("users"));

// GET /reviews/eligible?provider=<name>
//
// Returns the completed bookings of the logged-in caller with the given
// provider that do NOT yet have a review. The provider profile uses this to
// show the "leave a review" form only for genuine, reviewable bookings.
// Requires authentication.
routerAdd("GET", "/reviews/eligible", (e) => {
  if (!e.auth) {
    return e.unauthorizedError("unauthorized", null);
  }

  const provider = String((e.requestInfo().query || {}).provider || "").trim();
  if (!provider) {
    return e.badRequestError("provider is required", null);
  }

  try {
    const bookings = $app.findRecordsByFilter(
      "bookings",
      'provider = {:provider} && (owner = {:uid} || email = {:email}) && booking_status = "completed"',
      "-created",
      0,
      0,
      { provider: provider, uid: e.auth.id, email: e.auth.get("email") },
    );

    if (bookings.length === 0) {
      return e.json(200, { eligible: [] });
    }

    const reviewed = {};
    for (const b of bookings) {
      try {
        $app.findFirstRecordByFilter("reviews", "booking = {:id}", { id: b.id });
        reviewed[b.id] = true;
      } catch (err) {
        // no review for this booking yet
      }
    }

    const eligible = bookings
      .filter((b) => !reviewed[b.id])
      .map((b) => ({
        id: b.id,
        service: b.get("service") || "",
        date: b.get("date") || "",
        time: b.get("time") || "",
        created: b.get("created"),
      }));

    return e.json(200, { eligible: eligible });
  } catch (err) {
    $app.logger().error("failed to list eligible bookings", "provider", provider, "err", String(err));
    return e.internalServerError("failed to list eligible bookings", null);
  }
}, $apis.requireAuth("users"));

// GET /admin/reviews
//
// Returns every review (including hidden ones) for the GlowNyo admin
// moderation screen, newest first, with the related booking/client expanded
// so the admin can see the verified reservation context. Admin only.
routerAdd("GET", "/admin/reviews", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }

  try {
    const reviews = $app.findRecordsByFilter("reviews", "", "-created", 0, 0);
    $app.expandRecords(reviews, ["booking", "client"], null);

    const items = reviews.map((r) => {
      const b = r.expandedOne("booking");
      const client = r.expandedOne("client");
      return {
        id: r.id,
        rating: r.get("rating"),
        comment: r.get("comment"),
        provider: r.get("provider") || "",
        client_name: r.get("client_name") || "",
        client_email: (b && b.get("email")) || (client && client.get("email")) || "",
        hidden: r.get("hidden") === true,
        created: r.get("created"),
        booking: b
          ? {
              id: b.id,
              service: b.get("service") || "",
              date: b.get("date") || "",
              time: b.get("time") || "",
              booking_status: b.get("booking_status") || "",
              payment_status: b.get("payment_status") || "",
            }
          : null,
      };
    });

    return e.json(200, { items: items });
  } catch (err) {
    $app.logger().error("failed to list reviews for admin", "err", String(err));
    return e.internalServerError("failed to list reviews", null);
  }
}, $apis.requireAuth("users"));

// Admin moderation of reviews. The admin can hide, restore, or delete a
// review, but can NEVER edit a client's rating or comment — these routes
// only touch the `hidden` flag or remove the record. All mutations run
// through $app.save/$app.delete (bypass updateRule/deleteRule = null), so
// ordinary users cannot moderate via REST.

// POST /admin/reviews/{id}/hide — hide a review from the public profile.
routerAdd("POST", "/admin/reviews/{id}/hide", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }
  const id = e.request.pathValue("id");
  if (!id) {
    return e.badRequestError("id is required", null);
  }
  try {
    const rec = $app.findRecordById("reviews", id);
    rec.set("hidden", true);
    $app.save(rec);
    return e.json(200, { ok: true, id: rec.id, hidden: rec.get("hidden") });
  } catch (err) {
    $app.logger().error("failed to hide review", "review", id, "err", String(err));
    return e.internalServerError("failed to hide review", null);
  }
}, $apis.requireAuth("users"));

// POST /admin/reviews/{id}/restore — un-hide a previously hidden review.
routerAdd("POST", "/admin/reviews/{id}/restore", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }
  const id = e.request.pathValue("id");
  if (!id) {
    return e.badRequestError("id is required", null);
  }
  try {
    const rec = $app.findRecordById("reviews", id);
    rec.set("hidden", false);
    $app.save(rec);
    return e.json(200, { ok: true, id: rec.id, hidden: rec.get("hidden") });
  } catch (err) {
    $app.logger().error("failed to restore review", "review", id, "err", String(err));
    return e.internalServerError("failed to restore review", null);
  }
}, $apis.requireAuth("users"));

// DELETE /admin/reviews/{id} — permanently delete a review.
routerAdd("DELETE", "/admin/reviews/{id}", (e) => {
  if (!e.auth || e.auth.get("role") !== "admin") {
    return e.unauthorizedError("unauthorized", null);
  }
  const id = e.request.pathValue("id");
  if (!id) {
    return e.badRequestError("id is required", null);
  }
  try {
    const rec = $app.findRecordById("reviews", id);
    $app.delete(rec);
    return e.json(200, { ok: true, id: id });
  } catch (err) {
    $app.logger().error("failed to delete review", "review", id, "err", String(err));
    return e.internalServerError("failed to delete review", null);
  }
}, $apis.requireAuth("users"));
