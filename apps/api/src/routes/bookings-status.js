import pocketbaseClient from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

// GET /bookings/:id/status
// Public, returns only non-sensitive status fields. Used by the booking
// confirmation screen to report whether the confirmation email was sent.
// The booking id is a 15-char random, unguessable token. No PII is exposed.
export default async (req, res) => {
	const { id } = req.params;
	if (!id) return res.status(422).json({ error: 'id is required' });

	try {
		const rec = await pocketbaseClient
			.collection('bookings')
			.getOne(id, { requestKey: `booking-status-${id}` });
		return res.json({
			payment_status: rec.payment_status || 'pending',
			email_status: rec.email_status || 'pending',
		});
	} catch (err) {
		logger.error('booking status lookup failed:', err);
		return res.status(404).json({ error: 'not found' });
	}
};
