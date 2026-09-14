import logger from '../utils/logger.js';
import pocketbaseClient from '../utils/pocketbaseClient.js';

const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
const FEDAPAY_ENV = process.env.FEDAPAY_ENV || 'sandbox';
const FEDAPAY_BASE_URL =
	FEDAPAY_ENV === 'live'
		? 'https://api.fedapay.com/v1'
		: 'https://sandbox-api.fedapay.com/v1';

// Maps FedaPay's own transaction status vocabulary to our three-state
// booking payment_status. Anything not explicitly "approved" stays pending
// or becomes failed — we never infer "paid" from anything but a confirmed
// FedaPay status.
function mapFedapayStatus(fedapayStatus) {
	if (fedapayStatus === 'approved') return 'paid';
	if (fedapayStatus === 'declined' || fedapayStatus === 'canceled') return 'failed';
	return 'pending';
}

export default async (req, res) => {
	const { transactionId, bookingId } = req.body ?? {};

	if (!transactionId) {
		return res.status(422).json({ error: 'transactionId is required' });
	}

	if (!FEDAPAY_SECRET_KEY) {
		throw new Error('FEDAPAY_SECRET_KEY is not set in apps/api/.env');
	}

	const txResponse = await fetch(`${FEDAPAY_BASE_URL}/transactions/${transactionId}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
			'Content-Type': 'application/json',
		},
	});

	if (!txResponse.ok) {
		throw new Error(`fedapay transaction lookup failed: ${txResponse.status} ${txResponse.statusText}`);
	}

	const txData = await txResponse.json();
	const transaction = txData['v1/transaction'] || txData.transaction || txData;
	const fedapayStatus = transaction?.status;
	const paymentStatus = mapFedapayStatus(fedapayStatus);

	if (bookingId) {
		try {
			await pocketbaseClient.collection('bookings').update(bookingId, {
				payment_status: paymentStatus,
				fedapay_transaction_id: String(transactionId),
			});
		} catch (err) {
			logger.error('failed to update booking payment status:', err);
		}
	}

	res.json({
		transactionId,
		fedapayStatus,
		paymentStatus,
	});
};
