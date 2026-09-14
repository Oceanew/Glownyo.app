import Pocketbase from 'pocketbase';

const POCKETBASE_HOST = process.env.POCKETBASE_URL || 'http://localhost:8090';

// Verifies the caller's PocketBase JWT (sent as `Authorization: <token>`)
// and confirms the account has role === 'admin'. Returns the user record on
// success, or null when the token is missing, invalid, or belongs to a
// non-admin account. Used by the admin Express routes as the authorization
// layer instead of a static admin key.
export async function getAdminUser(req) {
	const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
	if (!token) return null;

	const pb = new Pocketbase(POCKETBASE_HOST);
	pb.autoCancellation(false);
	pb.authStore.save(token, null);

	try {
		// authRefresh validates the token server-side and reloads the record.
		const authData = await pb.collection('users').authRefresh();
		const rec = authData?.record;
		if (!rec || rec.role !== 'admin') return null;
		return rec;
	} catch (_) {
		return null;
	}
}
