import logger from '../utils/logger.js';
import { sendBrevoEmail, isBrevoConfigured } from '../utils/brevo.js';

// POST /emails/provider-activation  { recipient, name, link }
//
// Internal endpoint called by the PocketBase `onMailerRecordPasswordResetSend`
// hook (provider-activation-email.pb.js) right after it receives the
// password-reset token. The hook forwards the recipient, the provider name and
// the secure activation link; this route sends the branded activation email
// through Brevo so the Brevo API key stays only in the Express environment.
//
// The account is already validated by the time this runs, so a Brevo failure
// never blocks activation — it is logged (non-sensitive info only) and the
// provider can still request a fresh password-reset link later.
export default async (req, res) => {
	const { recipient, name, link } = req.body ?? {};
	if (!recipient || !link) {
		return res.status(422).json({ error: 'recipient and link are required' });
	}

	if (!isBrevoConfigured()) {
		logger.error('provider activation email skipped: Brevo not configured');
		return res.status(503).json({ ok: false, configured: false });
	}

	const displayName = name || '';

	const html = `
		<div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
			<h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Bienvenue chez GlowNyo !</h1>
			<p style="color: #F5F0E6; opacity: 0.8;">Bonjour${displayName ? ' ' + displayName : ''},</p>
			<p style="color: #F5F0E6; opacity: 0.8;">Bonne nouvelle : votre demande a été validée par l'équipe GlowNyo. Votre compte prestataire est désormais actif.</p>
			<p style="color: #F5F0E6; opacity: 0.8;">Pour accéder à votre espace, définissez votre mot de passe via le lien sécurisé ci-dessous (valable une heure) :</p>
			<p style="margin: 24px 0;">
				<a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #E8C877, #C9922A); color: #0A0A0A; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 999px;">Définir mon mot de passe & accéder à mon espace</a>
			</p>
			<p style="color: #F5F0E6; opacity: 0.6; font-size: 13px;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>${link}</p>
			<p style="color: #F5F0E6; opacity: 0.7; font-size: 14px;">Une fois votre mot de passe défini, vous pourrez vous connecter à votre espace prestataire sur GlowNyo.</p>
			<p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">Merci de votre confiance — GlowNyo</p>
			<p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
		</div>`;

	try {
		await sendBrevoEmail({
			to: recipient,
			subject: 'Votre compte prestataire GlowNyo est activé 🎉',
			html,
		});
		return res.json({ ok: true });
	} catch (err) {
		// Non-sensitive log only: Brevo status detail, no API key, no address.
		logger.error('brevo provider activation email failed', 'err', err.message);
		return res.status(502).json({ ok: false });
	}
};
