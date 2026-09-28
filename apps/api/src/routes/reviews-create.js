import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getUser } from '../utils/userAuth.js';
import logger from '../utils/logger.js';

// POST /reviews  { booking_id, rating, comment }
//
// Creates an authentic client review tied to a completed booking.
// Server-side validation enforces every rule:
//   - caller must be a logged-in user (JWT verified via getUser)
//   - the booking must exist and belong to this user
//     (booking.owner = user.id OR booking.email = user.email)
//   - the booking must be completed (booking_status = 'completed')
//   - the booking must not already have a review (unique index + explicit
//     check, so a duplicate returns a clear 409 instead of a raw 400)
// The review stores the provider name (copied from the booking) so it can be
// filtered on the provider profile, plus a snapshot of the client's display
// name. Writes go through the superuser client (createRule is null), so no
// client can forge a review through the public REST API.
export default async (req, res) => {
	const user = await getUser(req);
	if (!user) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	const { booking_id, rating, comment } = req.body ?? {};
	if (!booking_id) {
		return res.status(422).json({ error: 'booking_id is required' });
	}

	const r = Number(rating);
	if (!Number.isInteger(r) || r < 1 || r > 5) {
		return res.status(422).json({ error: 'invalid_rating' });
	}
	const text = String(comment || '').trim();
	if (!text) {
		return res.status(422).json({ error: 'comment_required' });
	}
	if (text.length > 2000) {
		return res.status(422).json({ error: 'comment_too_long' });
	}

	try {
		let booking;
		try {
			booking = await pocketbaseClient
				.collection('bookings')
				.getOne(booking_id);
		} catch (err) {
			if (err?.status === 404) {
				return res.status(404).json({ error: 'booking_not_found' });
			}
			throw err;
		}

		// Ownership: the booking must belong to this user. Accept either the
		// owner relation or a matching email (covers bookings made before the
		// account was created with the same email).
		const ownerId = booking.owner || '';
		const ownerMatch = ownerId === user.id;
		const emailMatch =
			(booking.email || '').toLowerCase() === (user.email || '').toLowerCase();
		if (!ownerMatch && !emailMatch) {
			return res.status(403).json({ error: 'not_owner' });
		}

		// Only completed bookings can be reviewed — not pending, confirmed,
		// or cancelled.
		if (booking.booking_status !== 'completed') {
			return res.status(403).json({ error: 'booking_not_completed' });
		}

		// Duplicate guard: one review per booking. The unique index is the
		// last line of defense; this check returns a clear 409 first.
		let existing = null;
		try {
			existing = await pocketbaseClient
				.collection('reviews')
				.getFirstListItem(
					pocketbaseClient.filter('booking = {:id}', { id: booking_id }),
					{ requestKey: `find-review-${booking_id}` },
				);
		} catch (err) {
			if (err?.status !== 404) throw err;
		}
		if (existing) {
			return res.status(409).json({ error: 'already_reviewed' });
		}

		const displayName = user.name || user.email || 'Client GlowNyo';
		const review = await pocketbaseClient.collection('reviews').create(
			{
				rating: r,
				comment: text,
				booking: booking_id,
				provider: booking.provider || '',
				client: user.id,
				client_name: displayName,
				hidden: false,
			},
			{ requestKey: `create-review-${booking_id}` },
		);

		return res.json({
			ok: true,
			id: review.id,
			rating: review.rating,
			comment: review.comment,
			client_name: review.client_name,
			created: review.created,
		});
	} catch (err) {
		logger.error(
			'failed to create review:',
			'booking', booking_id,
			'user', user.id,
			'err', err.message,
		);
		throw new Error('failed to create review');
	}
};
