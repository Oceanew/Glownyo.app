/// <reference path="../pb_data/types.d.ts" />

// Note: the FedaPay base URL is computed inline in each handler below rather
// than via a shared top-level helper — a routerAdd callback here does not
// reliably see sibling top-level function declarations at request time.

// POST /fedapay/create-transaction
// { amount, description, customer: { firstname, lastname, email?, phone? }, callbackUrl?, bookingId? }
// Public — called by the booking payment flow.
routerAdd("POST", "/fedapay/create-transaction", (e) => {
  const secretKey = $os.getenv("FEDAPAY_SECRET_KEY");
  if (!secretKey) {
    return e.internalServerError("FEDAPAY_SECRET_KEY is not set", null);
  }

  const body = e.requestInfo().body || {};
  const amount = Number(body.amount);
  const customer = body.customer || {};

  if (!amount || amount <= 0) {
    return e.badRequestError("amount (positive number) is required", null);
  }
  if (!customer.firstname || !customer.lastname) {
    return e.badRequestError("customer.firstname and customer.lastname are required", null);
  }

  const fedapayEnv = $os.getenv("FEDAPAY_ENV") || "sandbox";
  const baseUrl =
    fedapayEnv === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";
  const transactionPayload = {
    description: body.description || "Réservation GlowNyo",
    amount: Math.round(amount),
    currency: { iso: "XOF" },
    customer: {
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email || undefined,
      phone_number: customer.phone ? { number: customer.phone, country: "bj" } : undefined,
    },
    callback_url: body.callbackUrl || undefined,
  };

  let txRes;
  try {
    txRes = $http.send({
      url: baseUrl + "/transactions",
      method: "POST",
      headers: { Authorization: "Bearer " + secretKey, "Content-Type": "application/json" },
      body: JSON.stringify(transactionPayload),
    });
  } catch (err) {
    $app.logger().error("FedaPay transaction request failed", "err", String(err));
    return e.internalServerError("fedapay transaction creation failed", null);
  }

  if (txRes.statusCode < 200 || txRes.statusCode >= 300) {
    $app.logger().error("FedaPay transaction creation failed", "status", txRes.statusCode);
    return e.internalServerError("fedapay transaction creation failed", null);
  }

  const txData = txRes.json || {};
  const transaction = txData["v1/transaction"] || txData.transaction || txData;
  const transactionId = transaction ? transaction.id : null;

  if (!transactionId) {
    return e.internalServerError("fedapay transaction creation failed: missing transaction id", null);
  }

  let tokenRes;
  try {
    tokenRes = $http.send({
      url: baseUrl + "/transactions/" + transactionId + "/token",
      method: "POST",
      headers: { Authorization: "Bearer " + secretKey, "Content-Type": "application/json" },
    });
  } catch (err) {
    $app.logger().error("FedaPay token request failed", "err", String(err));
    return e.internalServerError("fedapay token generation failed", null);
  }

  if (tokenRes.statusCode < 200 || tokenRes.statusCode >= 300) {
    $app.logger().error("FedaPay token generation failed", "status", tokenRes.statusCode);
    return e.internalServerError("fedapay token generation failed", null);
  }

  const tokenData = tokenRes.json || {};

  // Link this transaction to the booking so it can be verified later. The
  // booking's payment_status is NEVER set to "paid" here — only a confirmed
  // FedaPay transaction status (checked in /fedapay/verify-transaction) can
  // do that.
  if (body.bookingId) {
    try {
      const booking = $app.findRecordById("bookings", body.bookingId);
      booking.set("fedapay_transaction_id", String(transactionId));
      booking.set("payment_status", "pending");
      $app.save(booking);
    } catch (err) {
      $app.logger().error("failed to link fedapay transaction to booking", "err", String(err));
    }
  }

  return e.json(200, {
    transactionId: transactionId,
    paymentUrl: tokenData.url,
  });
});

// POST /fedapay/verify-transaction  { transactionId, bookingId? } — public.
// Maps FedaPay's own transaction status vocabulary to our three-state
// booking payment_status. Anything not explicitly "approved" stays pending
// or becomes failed — we never infer "paid" from anything but a confirmed
// FedaPay status.
routerAdd("POST", "/fedapay/verify-transaction", (e) => {
  const secretKey = $os.getenv("FEDAPAY_SECRET_KEY");
  if (!secretKey) {
    return e.internalServerError("FEDAPAY_SECRET_KEY is not set", null);
  }

  const body = e.requestInfo().body || {};
  const transactionId = body.transactionId;
  if (!transactionId) {
    return e.badRequestError("transactionId is required", null);
  }

  const fedapayEnv = $os.getenv("FEDAPAY_ENV") || "sandbox";
  const baseUrl =
    fedapayEnv === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";

  let txRes;
  try {
    txRes = $http.send({
      url: baseUrl + "/transactions/" + transactionId,
      method: "GET",
      headers: { Authorization: "Bearer " + secretKey, "Content-Type": "application/json" },
    });
  } catch (err) {
    $app.logger().error("FedaPay transaction lookup request failed", "err", String(err));
    return e.internalServerError("fedapay transaction lookup failed", null);
  }

  if (txRes.statusCode < 200 || txRes.statusCode >= 300) {
    return e.internalServerError("fedapay transaction lookup failed", null);
  }

  const txData = txRes.json || {};
  const transaction = txData["v1/transaction"] || txData.transaction || txData;
  const fedapayStatus = transaction ? transaction.status : null;

  let paymentStatus = "pending";
  if (fedapayStatus === "approved") {
    paymentStatus = "paid";
  } else if (fedapayStatus === "declined" || fedapayStatus === "canceled") {
    paymentStatus = "failed";
  }

  if (body.bookingId) {
    try {
      const booking = $app.findRecordById("bookings", body.bookingId);
      booking.set("payment_status", paymentStatus);
      booking.set("fedapay_transaction_id", String(transactionId));
      $app.save(booking);
    } catch (err) {
      $app.logger().error("failed to update booking payment status", "err", String(err));
    }
  }

  return e.json(200, {
    transactionId: transactionId,
    fedapayStatus: fedapayStatus,
    paymentStatus: paymentStatus,
  });
});
