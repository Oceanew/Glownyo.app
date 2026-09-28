import { isIntegrationConfigured } from '../utils/integrationConfig.js';
import { getAdminUser } from '../utils/adminAuth.js';
import { BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } from '../utils/brevo.js';

// GET /admin/brevo-status
//
// Returns a non-sensitive overview of the Brevo transactional email setup for
// the GlowNyo admin dashboard:
//   - configured: whether BREVO_API_KEY is set in the server environment
//   - sender: the verified sender identity (email + display name) used for
//     every transactional email — these are not secrets
//   - envKey: the name (not the value) of the env var that must be set
//
// No API key, token, or secret is ever returned to the browser. Authorization:
// the caller must be signed in as an administrator (role === 'admin').
export default async (req, res) => {
	const admin = await getAdminUser(req);
	if (!admin) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	return res.json({
		configured: isIntegrationConfigured('BREVO_API_KEY'),
		sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
		envKey: 'BREVO_API_KEY',
	});
};
