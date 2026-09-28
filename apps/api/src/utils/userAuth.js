import Pocketbase from 'pocketbase';

const POCKETBASE_HOST = process.env.POCKETBASE_URL || 'http://localhost:8090';

// Verifies the caller's PocketBase JWT (sent as `Authorization: <token>`)
// and returns the user record on success, or null when the token is missing
// or invalid. Unlike getAdminUser, this does NOT require a specific role —
// any authenticated user passes. Used by the reviews create / eligible
// routes so a logged-in client can publish a review tied to their booking.
export async function getUser(req) {
	const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
	if (!token) return null;

	const pb = new Pocketbase(POCKETBASE_HOST);
	pb.autoCancellation(false);
	pb.authStore.save(token, null);

	try {
		const authData = await pb.collection('users').authRefresh();
		return authData?.record || null;
	} catch (_) {
		return null;
	}
}
