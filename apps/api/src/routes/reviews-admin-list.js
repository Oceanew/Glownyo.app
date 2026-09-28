import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getAdminUser } from '../utils/adminAuth.js';
import logger from '../utils/logger.js';

// GET /admin/reviews
//
// Returns every review (including hidden ones) for the GlowNyo admin
// moderation screen, newest first, with the related booking expanded so the
// admin can see the verified reservation context (service, date, time,
// client contact). Authorization: caller must be an administrator
// (role === 'admin'); JWT verified via getAdminUser. Regular users can never
// reach this — the public reviews listRule already hides hidden reviews.
export default async (req, res) => {
	const admin = await getAdminUser(req);
	if (!admin) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	try {
		const reviews = await pocketbaseClient
			.collection('reviews')
			.getFullList({
				sort: '-created',
				expand: 'booking,client',
			});

		const items = reviews.map((r) => {
			const b = r.expand?.booking || null;
			return {
				id: r.id,
				rating: r.rating,
				comment: r.comment,
				provider: r.provider || '',
				client_name: r.client_name || '',
				client_email: b?.email || r.expand?.client?.email || '',
				hidden: r.hidden === true,
				created: r.created,
				booking: b
					? {
							id: b.id,
							service: b.service || '',
							date: b.date || '',
							time: b.time || '',
							booking_status: b.booking_status || '',
							payment_status: b.payment_status || '',
						}
					: null,
			};
		});

		return res.json({ items });
	} catch (err) {
		logger.error('failed to list reviews for admin:', err);
		throw new Error('failed to list reviews');
	}
};
