import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getAdminUser } from '../utils/adminAuth.js';
import logger from '../utils/logger.js';

// POST /bookings/:id/status  { status }
//
// Lets the GlowNyo admin team manage a reservation's lifecycle independently
// of the FedaPay payment status. Allowed values: confirmed, cancelled,
// completed (and pending to revert). Authorization: the caller must be signed
// in as an administrator (role === 'admin'); the JWT is verified via
// getAdminUser. The update runs through the superuser PocketBase client, which
// bypasses the collection's REST updateRule (null) — so the booking stays
// immutable to ordinary users via the public API.
export default async (req, res) => {
	const admin = await getAdminUser(req);
	if (!admin) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	const { id } = req.params;
	const { status } = req.body ?? {};
	const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
	if (!id) {
		return res.status(422).json({ error: 'id is required' });
	}
	if (!allowed.includes(status)) {
		return res.status(422).json({ error: 'invalid status' });
	}

	try {
		const rec = await pocketbaseClient.collection('bookings').update(
			id,
			{ booking_status: status },
			{ requestKey: `booking-status-${id}` },
		);
		return res.json({
			ok: true,
			id: rec.id,
			booking_status: rec.booking_status,
		});
	} catch (err) {
		logger.error('failed to update booking status:', 'booking', id, 'err', err.message);
		throw new Error('failed to update booking status');
	}
};
