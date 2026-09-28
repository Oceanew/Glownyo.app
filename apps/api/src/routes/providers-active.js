import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getAdminUser } from '../utils/adminAuth.js';
import logger from '../utils/logger.js';

// Admin management of active provider accounts.
//
// A "provider" here is any account that can appear on the storefront:
//   - standalone provider account: role="provider"
//   - existing client granted provider access: provider_request_status="validated"
// "Active" means the account is currently visible and usable as a provider:
//   - standalone: validated=true
//   - linked client: provider_request_status="validated"
// Deactivating sets validated=false (standalone) or provider_request_status="none"
// (linked client) so the profile disappears from the storefront and the
// provider space, without deleting the account or its client data.

function isProviderActive(r) {
	return (
		(r.role === 'provider' && r.validated === true) ||
		r.provider_request_status === 'validated'
	);
}

// GET /providers/active — list every active provider with the public profile
// fields plus an `active` flag and the account type. Admin-only.
export async function listActive(req, res) {
	const admin = await getAdminUser(req);
	if (!admin) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	try {
		const records = await pocketbaseClient
			.collection('users')
			.getFullList({
				filter:
					'role = "provider" || provider_request_status = "validated" || provider_request_status = "refused"',
				sort: 'created',
			});

		const providers = records
			.filter((r) => r.role === 'provider' || r.provider_request_status === 'validated')
			.map((r) => ({
				id: r.id,
				name: r.name || '',
				email: r.email || '',
				phone: r.phone || '',
				specialty: r.specialty || '',
				location: r.location || '',
				instagram: r.instagram || '',
				active: isProviderActive(r),
				accountType: r.role === 'provider' ? 'standalone' : 'linked_client',
			}));

		res.json(providers);
	} catch (err) {
		logger.error('failed to list active providers:', err.message);
		throw new Error('failed to list active providers');
	}
}

// POST /providers/toggle-active  { id, active }
// active=true  → reactivate the provider (validated=true / status="validated")
// active=false → deactivate the provider (validated=false / status="none")
// Admin-only. Runs through the superuser client so it bypasses the users
// updateRule, and never touches the privileged `role` field.
export async function toggleActive(req, res) {
	const admin = await getAdminUser(req);
	if (!admin) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	const { id, active } = req.body ?? {};
	if (!id) {
		return res.status(422).json({ error: 'id is required' });
	}
	if (typeof active !== 'boolean') {
		return res.status(422).json({ error: 'active (boolean) is required' });
	}

	try {
		const record = await pocketbaseClient.collection('users').getOne(id);
		const isStandalone = record.role === 'provider';

		const patch = isStandalone
			? { validated: active }
			: { provider_request_status: active ? 'validated' : 'none' };

		await pocketbaseClient.collection('users').update(id, patch, {
			requestKey: `toggle-active-${id}`,
		});

		return res.json({ ok: true, id, active });
	} catch (err) {
		logger.error('failed to toggle provider active:', 'user', id, 'err', err.message);
		throw new Error('failed to toggle provider active');
	}
}
