import pocketbaseClient from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

// POST /bookings/check-slot  { provider, date, time }
// Public (called by the booking form, including guests). Returns whether the
// given provider+date+time slot is still available. This is a UX pre-check —
// the authoritative race-condition guard is the partial UNIQUE index on
// bookings(provider, date, time), which rejects concurrent creates at the DB
// level. On any internal error we fail OPEN (available: true) so the visitor
// can still submit; the create call is the final arbiter.
export default async (req, res) => {
	const { provider, date, time } = req.body ?? {};

	if (!provider || !date || !time) {
		// No concrete slot to lock (e.g. "Peu importe / à conseiller" or a
		// missing date/time) — nothing to block.
		return res.json({ available: true });
	}

	try {
		const filter = pocketbaseClient.filter(
			'provider = {:provider} && date = {:date} && time = {:time}',
			{ provider, date, time },
		);
		const existing = await pocketbaseClient
			.collection('bookings')
			.getFullList({
				filter,
				requestKey: `check-slot-${provider}-${date}-${time}`,
			});
		return res.json({ available: existing.length === 0 });
	} catch (err) {
		logger.error('check-slot failed:', err);
		return res.json({ available: true });
	}
};
