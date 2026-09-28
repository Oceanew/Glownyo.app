import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getUser } from '../utils/userAuth.js';
import logger from '../utils/logger.js';

// GET /reviews/eligible?provider=<name>
//
// Returns the completed bookings of the logged-in caller with the given
// provider that do NOT yet have a review. The provider profile uses this to
// show the "leave a review" form only for genuine, reviewable bookings — and
// to let the client pick which completed reservation to review. Each item
// includes the booking id, service, date and time so the form can display
// context. Requires authentication; non-logged-in callers get 401.
export default async (req, res) => {
	const user = await getUser(req);
	if (!user) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	const provider = String(req.query?.provider || '').trim();
	if (!provider) {
		return res.status(422).json({ error: 'provider is required' });
	}

	try {
		// Fetch the caller's bookings for this provider. The superuser client
		// bypasses listRule, so we filter manually by ownership + provider.
		const bookings = await pocketbaseClient
			.collection('bookings')
			.getFullList({
				filter: pocketbaseClient.filter(
					'provider = {:provider} && (owner = {:uid} || email = {:email}) && booking_status = "completed"',
					{ provider, uid: user.id, email: user.email },
				),
				sort: '-created',
			});

		if (bookings.length === 0) {
			return res.json({ eligible: [] });
		}

		// Find which of these bookings already have a review, so we only
		// return the ones still open for review.
		const bookingIds = bookings.map((b) => b.id);
		const reviewed = await pocketbaseClient
			.collection('reviews')
			.getFullList({
				filter: bookingIds
					.map((id) => pocketbaseClient.filter('booking = {:id}', { id }))
					.join(' || '),
				fields: 'booking',
			});
		const reviewedSet = new Set(reviewed.map((r) => r.booking));

		const eligible = bookings
			.filter((b) => !reviewedSet.has(b.id))
			.map((b) => ({
				id: b.id,
				service: b.service || '',
				date: b.date || '',
				time: b.time || '',
				created: b.created,
			}));

		return res.json({ eligible });
	} catch (err) {
		logger.error(
			'failed to list eligible bookings:',
			'provider', provider,
			'user', user.id,
			'err', err.message,
		);
		throw new Error('failed to list eligible bookings');
	}
};
