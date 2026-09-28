import pocketbaseClient from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { sendBrevoEmail, isBrevoConfigured } from '../utils/brevo.js';
import { respondNotConfigured } from '../utils/integrationConfig.js';

// POST /emails/booking-confirmation  { bookingId, force? }
//
// Sends the booking confirmation email to the client AND a notification email
// to the provider (when the booking has a provider_email), via Brevo, then
// updates the booking's `email_status` to "sent" or "failed".
//
// Idempotent: if the email was already sent and `force` is not true, the route
// returns immediately without resending — this prevents duplicates when the
// visitor clicks "Renvoyer l'email" after a successful send.
//
// The booking itself is already persisted by the time this is called, so a
// Brevo failure never loses the reservation: we only flag the email status.
export default async (req, res) => {
	const { bookingId, force } = req.body ?? {};
	if (!bookingId) {
		return res.status(422).json({ error: 'bookingId is required' });
	}

	let rec;
	try {
		rec = await pocketbaseClient
			.collection('bookings')
			.getOne(bookingId, { requestKey: `email-booking-${bookingId}` });
	} catch (err) {
		logger.error('booking email: booking not found', 'booking', bookingId);
		return res.status(404).json({ error: 'booking not found' });
	}

	// Idempotency guard against duplicate resends.
	if (rec.email_status === 'sent' && !force) {
		return res.json({ ok: true, email_status: 'sent', skipped: true });
	}

	if (!isBrevoConfigured()) {
		// Graceful setup state: the booking stays saved, the email is flagged
		// failed so the visitor is clearly told the situation.
		try {
			await pocketbaseClient
				.collection('bookings')
				.update(bookingId, { email_status: 'failed' }, { requestKey: `email-fail-${bookingId}` });
		} catch (e) {
			logger.error('email_status update (not-configured) failed', 'booking', bookingId);
		}
		return respondNotConfigured(res, { integration: 'Brevo', envKeys: 'BREVO_API_KEY' });
	}

	const name = rec.name || '—';
	const phone = rec.phone || '—';
	const service = rec.service || '—';
	const provider = rec.provider || '—';
	const date = rec.date || '—';
	const time = rec.time || '—';
	const message = rec.message || '—';
	const paymentStatus = rec.payment_status || 'pending';
	const clientEmail = rec.email || '';
	const providerEmail = rec.provider_email || '';

	const statusLabel =
		paymentStatus === 'paid'
			? 'Acompte payé'
			: paymentStatus === 'failed'
				? 'Paiement échoué'
				: 'En attente de paiement';

	const clientHtml = `
		<div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
			<h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Confirmation de votre réservation</h1>
			<p style="color: #F5F0E6; opacity: 0.8;">Bonjour ${name},</p>
			<p style="color: #F5F0E6; opacity: 0.8;">Nous avons bien reçu votre demande de réservation chez GlowNyo. Voici le récapitulatif de votre rendez-vous :</p>
			<table cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 16px 0; color: #F5F0E6;">
				<tr><td style="color: #C9922A; font-weight: 600;">Prestataire</td><td>${provider}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Prestation</td><td>${service}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Date</td><td>${date}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Heure</td><td>${time}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Téléphone</td><td>${phone}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Message</td><td>${message}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Statut</td><td>${statusLabel}</td></tr>
			</table>
			<p style="color: #F5F0E6; opacity: 0.7; font-size: 14px;">Notre équipe vous contactera rapidement pour confirmer votre créneau. Pour toute question, répondez à cet email ou contactez-nous sur WhatsApp.</p>
			<p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">Merci de votre confiance — GlowNyo</p>
			<p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
		</div>`;

	const providerHtml = `
		<div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E6; padding: 32px; border: 1px solid #C9922A33; border-radius: 16px;">
			<h1 style="font-family: 'Playfair Display', Georgia, serif; color: #C9922A; margin: 0 0 8px;">Nouvelle réservation reçue</h1>
			<p style="color: #F5F0E6; opacity: 0.8;">Bonjour ${provider},</p>
			<p style="color: #F5F0E6; opacity: 0.8;">Une nouvelle demande de réservation vous a été adressée sur GlowNyo. Voici les détails du rendez-vous :</p>
			<table cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 16px 0; color: #F5F0E6;">
				<tr><td style="color: #C9922A; font-weight: 600;">Personne cliente</td><td>${name}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Téléphone</td><td>${phone}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Email</td><td>${clientEmail || '—'}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Prestation</td><td>${service}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Date</td><td>${date}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Heure</td><td>${time}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Message</td><td>${message}</td></tr>
				<tr><td style="color: #C9922A; font-weight: 600;">Statut paiement</td><td>${statusLabel}</td></tr>
			</table>
			<p style="color: #F5F0E6; opacity: 0.7; font-size: 14px;">Merci de recontacter la personne qui a réservé rapidement pour confirmer le créneau.</p>
			<p style="color: #C9922A; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-top: 24px;">GlowNyo</p>
			<p style="color: #F5F0E6; opacity: 0.4; font-size: 12px;">Rayonne de l'intérieur, brille de l'extérieur.</p>
		</div>`;

	let clientOk = true;
	let providerOk = true;

	if (clientEmail) {
		try {
			await sendBrevoEmail({
				to: clientEmail,
				subject: `Confirmation de votre réservation GlowNyo — ${service}`,
				html: clientHtml,
			});
		} catch (err) {
			clientOk = false;
			// Log only non-sensitive info: booking id + Brevo status detail.
			// No API key, no recipient address in the log.
			logger.error('brevo client email failed', 'booking', bookingId, 'err', err.message);
		}
	} else {
		clientOk = false;
	}

	if (providerEmail) {
		try {
			await sendBrevoEmail({
				to: providerEmail,
				subject: `Nouvelle réservation GlowNyo — ${service} (${date} ${time})`,
				html: providerHtml,
			});
		} catch (err) {
			providerOk = false;
			logger.error('brevo provider email failed', 'booking', bookingId, 'err', err.message);
		}
	}

	// The client email is the primary confirmation. The provider email is
	// best-effort: a provider without an email on file should not mark the
	// whole confirmation as failed for the client.
	const emailStatus = clientOk ? 'sent' : 'failed';

	try {
		await pocketbaseClient
			.collection('bookings')
			.update(bookingId, { email_status: emailStatus }, { requestKey: `email-status-${bookingId}` });
	} catch (e) {
		logger.error('email_status update failed', 'booking', bookingId);
	}

	return res.json({
		ok: emailStatus === 'sent',
		email_status: emailStatus,
		provider_notified: providerOk,
	});
};
