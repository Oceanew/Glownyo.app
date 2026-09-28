// Brevo (Sendinblue) transactional email helper.
//
// The API key is a USER-SUPPLIED secret kept ONLY in the server environment
// (apps/api/.env → process.env.BREVO_API_KEY). It is never returned to the
// browser, never logged, and never interpolated into a response body.
//
// Sender: verified address contact@glownyo.app, display name "Glownyo".
// All transactional emails sent through this helper use that single sender.

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_SENDER_EMAIL = 'contact@glownyo.app';
const BREVO_SENDER_NAME = 'Glownyo';

// True only when the key is present and non-empty. Fails closed so a missing
// key reads as "not configured" rather than crashing every email attempt.
export function isBrevoConfigured() {
	return String(BREVO_API_KEY ?? '').trim() !== '';
}

// Sends a single transactional email via Brevo. Resolves to the Brevo response
// body on success. Throws an Error whose message contains ONLY the HTTP status,
// reason phrase and a short Brevo detail string — never the API key, never the
// full raw body, never the recipient address.
export async function sendBrevoEmail({ to, subject, html }) {
	if (!isBrevoConfigured()) {
		throw new Error('brevo send failed: BREVO_API_KEY is not set');
	}

	const response = await fetch(BREVO_API_URL, {
		method: 'POST',
		headers: {
			'api-key': BREVO_API_KEY,
			'Content-Type': 'application/json',
			accept: 'application/json',
		},
		body: JSON.stringify({
			sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
			to: [{ email: to }],
			subject,
			htmlContent: html,
		}),
	});

	if (!response.ok) {
		let detail = '';
		try {
			const parsed = await response.json();
			detail = parsed?.message || parsed?.Message || '';
		} catch {
			try {
				detail = (await response.text()).slice(0, 180);
			} catch {
				detail = '';
			}
		}
		throw new Error(
			`brevo send failed: ${response.status} ${response.statusText}${detail ? ' — ' + detail : ''}`,
		);
	}

	return response.json();
}

export { BREVO_SENDER_EMAIL, BREVO_SENDER_NAME };
export default { isBrevoConfigured, sendBrevoEmail, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME };
