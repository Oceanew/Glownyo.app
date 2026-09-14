import logger from '../utils/logger.js';
import pocketbaseClient from '../utils/pocketbaseClient.js';

const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
const FEDAPAY_ENV = process.env.FEDAPAY_ENV || 'sandbox';
const FEDAPAY_BASE_URL =
	FEDAPAY_ENV === 'live'
		? 'https://api.fedapay.com/v1'
		: 'https://sandbox-api.fedapay.com/v1';

export default async (req, res) => {
	const { amount, description, customer, callbackUrl, bookingId } = req.body ?? {};

	const parsedAmount = Number(amount);
	if (!parsedAmount || parsedAmount <= 0) {
		return res.status(422).json({ error: 'amount (positive number) is required' });
	}
	if (!customer || !customer.firstname || !customer.lastname) {
		return res.status(422).json({ error: 'customer.firstname and customer.lastname are required' });
	}

	if (!FEDAPAY_SECRET_KEY) {
		throw new Error('FEDAPAY_SECRET_KEY is not set in apps/api/.env');
	}

	const transactionPayload = {
		description: description || 'Réservation GlowNyo',
		amount: Math.round(parsedAmount),
		currency: { iso: 'XOF' },
		customer: {
			firstname: customer.firstname,
			lastname: customer.lastname,
			email: customer.email || undefined,
			phone_number: customer.phone
				? { number: customer.phone, country: 'bj' }
				: undefined,
		},
		callback_url: callbackUrl || undefined,
	};

	const txResponse = await fetch(`${FEDAPAY_BASE_URL}/transactions`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(transactionPayload),
	});

	if (!txResponse.ok) {
		const errorBody = await txResponse.text();
		logger.error('FedaPay transaction creation failed:', errorBody);
		throw new Error(`fedapay transaction creation failed: ${txResponse.status} ${txResponse.statusText}`);
	}

	const txData = await txResponse.json();
	const transaction = txData['v1/transaction'] || txData.transaction || txData;
	const transactionId = transaction?.id;

	if (!transactionId) {
		throw new Error('fedapay transaction creation failed: missing transaction id in response');
	}

	const tokenResponse = await fetch(`${FEDAPAY_BASE_URL}/transactions/${transactionId}/token`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
			'Content-Type': 'application/json',
		},
	});

	if (!tokenResponse.ok) {
		const errorBody = await tokenResponse.text();
		logger.error('FedaPay token generation failed:', errorBody);
		throw new Error(`fedapay token generation failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
	}

	const tokenData = await tokenResponse.json();

	// Link this transaction to the booking so it can be verified later. The
	// booking's payment_status is NEVER set to "paid" here — only a confirmed
	// FedaPay transaction status (checked in /fedapay/verify-transaction) can
	// do that.
	if (bookingId) {
		try {
			await pocketbaseClient.collection('bookings').update(bookingId, {
				fedapay_transaction_id: String(transactionId),
				payment_status: 'pending',
			});
		} catch (err) {
			logger.error('failed to link fedapay transaction to booking:', err);
		}
	}

	res.json({
		transactionId,
		paymentUrl: tokenData.url,
	});
};
