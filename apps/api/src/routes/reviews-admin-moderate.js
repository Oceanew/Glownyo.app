import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getAdminUser } from '../utils/adminAuth.js';
import logger from '../utils/logger.js';

// Admin moderation of reviews. The admin can hide, restore, or delete a
// review, but can NEVER edit a client's rating or comment — these routes
// only touch the `hidden` flag or remove the record. Authorization: caller
// must be an administrator (role === 'admin'); JWT verified via getAdminUser.
// All mutations run through the superuser client (updateRule / deleteRule
// are null on the collection), so ordinary users cannot moderate via REST.

async function requireAdmin(req, res) {
	const admin = await getAdminUser(req);
	if (!admin) {
		res.status(401).json({ error: 'unauthorized' });
		return false;
	}
	return true;
}

// POST /admin/reviews/:id/hide  — hide a review from the public profile.
export async function hideReview(req, res) {
	if (!(await requireAdmin(req, res))) return;
	const { id } = req.params;
	if (!id) return res.status(422).json({ error: 'id is required' });
	try {
		const rec = await pocketbaseClient.collection('reviews').update(
			id,
			{ hidden: true },
			{ requestKey: `review-hide-${id}` },
		);
		return res.json({ ok: true, id: rec.id, hidden: rec.hidden });
	} catch (err) {
		logger.error('failed to hide review:', 'review', id, 'err', err.message);
		throw new Error('failed to hide review');
	}
}

// POST /admin/reviews/:id/restore  — un-hide a previously hidden review.
export async function restoreReview(req, res) {
	if (!(await requireAdmin(req, res))) return;
	const { id } = req.params;
	if (!id) return res.status(422).json({ error: 'id is required' });
	try {
		const rec = await pocketbaseClient.collection('reviews').update(
			id,
			{ hidden: false },
			{ requestKey: `review-restore-${id}` },
		);
		return res.json({ ok: true, id: rec.id, hidden: rec.hidden });
	} catch (err) {
		logger.error('failed to restore review:', 'review', id, 'err', err.message);
		throw new Error('failed to restore review');
	}
}

// DELETE /admin/reviews/:id  — permanently delete a review.
export async function deleteReview(req, res) {
	if (!(await requireAdmin(req, res))) return;
	const { id } = req.params;
	if (!id) return res.status(422).json({ error: 'id is required' });
	try {
		await pocketbaseClient.collection('reviews').delete(
			id,
			{ requestKey: `review-delete-${id}` },
		);
		return res.json({ ok: true, id });
	} catch (err) {
		logger.error('failed to delete review:', 'review', id, 'err', err.message);
		throw new Error('failed to delete review');
	}
}
