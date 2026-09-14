import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getAdminUser } from '../utils/adminAuth.js';

// GET /bookings — returns every reservation (for the GlowNyo admin team).
// Authorization: the caller must be signed in as an administrator
// (role === 'admin'); the JWT is verified via getAdminUser.
export default async (req, res) => {
	const admin = await getAdminUser(req);
	if (!admin) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	const bookings = await pocketbaseClient.collection('bookings').getFullList({
		sort: '-created',
	});

	res.json(bookings);
};
