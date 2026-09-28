import crypto from 'node:crypto';
import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getAdminUser } from '../utils/adminAuth.js';
import { sendBrevoEmail, isBrevoConfigured } from '../utils/brevo.js';
import logger from '../utils/logger.js';

// Strong random password for brand-new standalone provider accounts. The
// provider never sees it — they define their own password later via the
// secure activation link sent on validation.
function randomPassword() {
	const base = crypto.randomBytes(15).toString('base64').replace(/[^A-Za-z0-9]/g, '');
	return (base + 'Aa1!').slice(0, 24);
}

// Role-based admin guard. Returns true when the caller is an authenticated
// administrator (role === 'admin'); otherwise responds 401 and returns false.
async function requireAdmin(req, res) {
	const admin = await getAdminUser(req);
	if (!admin) {
		res.status(401).json({ error: 'unauthorized' });
		return false;
	}
	return true;
}

// GET /providers/pending — list provider requests awaiting validation.
// Returns two kinds of pending requests:
//   1. Standalone provider accounts (role="provider", validated=false)
//   2. Existing client accounts that asked to become a provider
//      (provider_request_status="pending")
export async function listPending(req, res) {
	if (!(await requireAdmin(req, res))) return;
	try {
		const providers = await pocketbaseClient
			.collection('users')
			.getFullList({
				filter:
					'(role = "provider" && validated = false) || provider_request_status = "pending" || provider_request_status = "refused"',
				sort: '-created',
			});
		res.json(providers);
	} catch (err) {
		logger.error('failed to list pending providers:', err);
		throw new Error('failed to list pending providers');
	}
}

// POST /providers/request — public endpoint called by the provider sign-up
// form. If the email already belongs to a client account, the request is
// LINKED to that account (no second account created, all client data and
// reservations preserved) and marked "pending". If no account exists, a new
// standalone pending provider account is created. Either way the GlowNyo
// team receives a recap email (via a PocketBase hook).
export async function requestProvider(req, res) {
	const body = req.body ?? {};
	const email = String(body.email || '').trim().toLowerCase();
	if (!email) return res.status(422).json({ error: 'email is required' });

	const profile = {
		phone: String(body.phone || '').trim(),
		specialty: body.specialty || '',
		services: body.services || '',
		location: body.location || '',
		instagram: body.instagram || '',
		bio: body.bio || '',
	};

	try {
		let existing = null;
		try {
			existing = await pocketbaseClient
				.collection('users')
				.getFirstListItem(
					pocketbaseClient.filter('email = {:email}', { email }),
					{ requestKey: `find-user-${email}` },
				);
		} catch (err) {
			// 404 means no existing user — expected for brand-new signups.
			if (err?.status !== 404) throw err;
		}

		if (existing) {
			const role = existing.role;
			const status = existing.provider_request_status;
			const isProvider =
				(role === 'provider' && existing.validated === true) ||
				status === 'validated';

			if (isProvider) {
				return res.json({ ok: true, mode: 'already_provider' });
			}
			if (status === 'pending') {
				return res.json({ ok: true, mode: 'already_pending' });
			}

			// Link the request to the existing client account. Keep name, email,
			// role, bookings and all client info untouched — only set the provider
			// profile fields and mark the request as pending.
			await pocketbaseClient.collection('users').update(
				existing.id,
				{
					...profile,
					provider_request_status: 'pending',
					provider_request_notify: true,
				},
				{ requestKey: `link-provider-${existing.id}` },
			);
			return res.json({ ok: true, mode: 'linked' });
		}

		// No existing account — create a new standalone pending provider.
		const password = randomPassword();
		await pocketbaseClient.collection('users').create(
			{
				email,
				password,
				passwordConfirm: password,
				name: String(body.name || '').trim(),
				role: 'provider',
				validated: false,
				provider_request_status: 'none',
				...profile,
			},
			{ requestKey: `create-provider-${email}` },
		);
		return res.json({ ok: true, mode: 'created' });
	} catch (err) {
		logger.error('failed to submit provider request:', err);
		throw new Error('failed to submit provider request');
	}
}

// POST /providers/validate { id } — approve a provider request.
// Two cases:
//   - Standalone provider account (role="provider"): mark validated and
//     trigger a password-reset email branded as the activation email so they
//     can define their password and log in.
//   - Existing client account: grant provider access on the SAME account
//     (provider_request_status="validated") and send a confirmation email.
//     No password reset — they keep their usual login.
export async function validateProvider(req, res) {
	if (!(await requireAdmin(req, res))) return;
	const { id } = req.body ?? {};
	if (!id) return res.status(422).json({ error: 'id is required' });

	try {
		const record = await pocketbaseClient.collection('users').getOne(id);
		const role = record.role;

		if (role === 'provider') {
			await pocketbaseClient.collection('users').update(
				id,
				{
					validated: true,
					pending_activation: true,
					provider_request_status: 'validated',
				},
				{ requestKey: `validate-${id}` },
			);
			// Trigger the built-in password-reset flow; the activation-email hook
			// forwards the secure token to Express, which sends the activation
			// email via Brevo (pending_activation is true). The account is already
			// validated above, so an email failure never blocks activation.
			let emailSent = true;
			try {
				await pocketbaseClient
					.collection('users')
					.requestPasswordReset(record.email);
			} catch (err) {
				emailSent = false;
				logger.error('provider activation email failed', 'user', id, 'err', err.message);
			}
			return res.json({ ok: true, email_sent: emailSent });
		}

		// Existing client account — add provider access on the same account.
		// No password reset: they keep their usual login. We send the Brevo
		// confirmation email directly here (the PB hook is NOT triggered, so
		// no duplicate send).
		await pocketbaseClient.collection('users').update(
			id,
			{
				validated: true,
				provider_request_status: 'validated',
			},
			{ requestKey: `validate-${id}` },
		);

		let emailSent = false;
		if (isBrevoConfigured()) {
			let appUrl = process.env.WEBSITE_DOMAIN || '';
			if (appUrl && !/^https?:\/\//i.test(appUrl)) appUrl = `https://${appUrl}`;
			const loginUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/connexion` : '/connexion';
			const displayName = record.name || '';
			const html = `
				<div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
					<h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Votre accès prestataire GlowNyo est activé 🎉</h1>
					<p style="color: #F5F0E6; opacity: 0.8;">Bonjour${displayName ? ' ' + displayName : ''},</p>
					<p style="color: #F5F0E6; opacity: 0.8;">Bonne nouvelle : votre demande a été validée par l'équipe GlowNyo. Votre compte dispose désormais de l'espace prestataire, en plus de votre espace client habituel.</p>
					<p style="color: #F5F0E6; opacity: 0.8;">Aucune nouvelle connexion à créer : utilisez simplement <strong>votre email et mot de passe habituels</strong> pour vous connecter, puis basculez entre l'espace client et l'espace prestataire depuis votre compte.</p>
					<p style="margin: 24px 0;">
						<a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #E8C877, #C9922A); color: #0A0A0A; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 999px;">Accéder à mon espace</a>
					</p>
					<p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">Merci de votre confiance — GlowNyo</p>
					<p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
				</div>`;
			try {
				await sendBrevoEmail({
					to: record.email,
					subject: 'Votre accès prestataire GlowNyo est activé 🎉',
					html,
				});
				emailSent = true;
			} catch (err) {
				logger.error('brevo provider activated email failed', 'user', id, 'err', err.message);
			}
		} else {
			logger.error('provider activated email skipped: Brevo not configured', 'user', id);
		}

		return res.json({ ok: true, email_sent: emailSent });
	} catch (err) {
		logger.error('failed to validate provider:', err);
		throw new Error('failed to validate provider');
	}
}

// POST /providers/refuse { id } — refuse a provider request.
//   - Standalone provider account (role="provider"): delete the pending
//     account so the email can reapply later.
//   - Existing client account: mark the request "refused" and clear the
//     provider profile fields, but KEEP the client account fully functional.
export async function refuseProvider(req, res) {
	if (!(await requireAdmin(req, res))) return;
	const { id } = req.body ?? {};
	if (!id) return res.status(422).json({ error: 'id is required' });

	try {
		const record = await pocketbaseClient.collection('users').getOne(id);
		const role = record.role;

		if (role === 'provider') {
			// Keep the account but mark the request as refused so it stays
			// inaccessible as a provider and the admin can still see the
			// "Refusée" status (and reconsider later if needed).
			await pocketbaseClient.collection('users').update(
				id,
				{
					provider_request_status: 'refused',
					validated: false,
					provider_request_notify: false,
				},
				{ requestKey: `refuse-${id}` },
			);
			return res.json({ ok: true });
		}

		// Existing client — refuse the request but keep the account functional.
		await pocketbaseClient.collection('users').update(
			id,
			{
				provider_request_status: 'refused',
				validated: false,
				specialty: '',
				services: '',
				location: '',
				instagram: '',
				bio: '',
				provider_request_notify: false,
			},
			{ requestKey: `refuse-${id}` },
		);
		return res.json({ ok: true });
	} catch (err) {
		logger.error('failed to refuse provider:', err);
		throw new Error('failed to refuse provider');
	}
}
