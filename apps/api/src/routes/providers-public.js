import pocketbaseClient from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

// GET /providers/public — public, no admin key required.
// Returns the public profile fields of every validated provider so the
// storefront can list them alongside the seeded providers. A user counts
// as a validated provider when:
//   - standalone provider account: role="provider" && validated=true
//   - existing client granted provider access: provider_request_status="validated"
// Only public-facing fields are exposed (no email/password/token/etc.).
// `avatar` is returned as a filename; the frontend builds the file URL from
// the PocketBase client base (`/hcgi/platform/api/files/users/<id>/<file>`).
export async function listPublicProviders(req, res) {
	try {
		const records = await pocketbaseClient
			.collection('users')
			.getFullList({
				filter:
					'(role = "provider" && validated = true) || provider_request_status = "validated"',
				sort: 'created',
			});

		const providers = records.map((r) => ({
			id: r.id,
			name: r.name || '',
			specialty: r.specialty || '',
			services: r.services || '',
			location: r.location || '',
			phone: r.phone || '',
			email: r.email || '',
			instagram: r.instagram || '',
			bio: r.bio || '',
			avatar: r.avatar || '',
			source: 'db',
		}));

		res.json(providers);
	} catch (err) {
		logger.error('failed to list public providers:', err);
		throw new Error('failed to list public providers');
	}
}
