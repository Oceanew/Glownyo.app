import { Router } from 'express';
import healthCheck from './health-check.js';
import fedapayCheckout from './fedapay-checkout.js';
import fedapayVerify from './fedapay-verify.js';
import bookingsList from './bookings-list.js';
import bookingsCheckSlot from './bookings-check-slot.js';
import bookingsStatus from './bookings-status.js';
import bookingsStatusUpdate from './bookings-status-update.js';
import {
	listPending,
	requestProvider,
	validateProvider,
	refuseProvider,
} from './providers-admin.js';
import { listPublicProviders } from './providers-public.js';
import { listActive, toggleActive } from './providers-active.js';
import emailsBooking from './emails-booking.js';
import emailsProviderActivation from './emails-provider-activation.js';
import adminBrevoStatus from './admin-brevo-status.js';
import reviewsCreate from './reviews-create.js';
import reviewsEligible from './reviews-eligible.js';
import reviewsAdminList from './reviews-admin-list.js';
import {
	hideReview,
	restoreReview,
	deleteReview,
} from './reviews-admin-moderate.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.post('/fedapay/create-transaction', fedapayCheckout);
    router.post('/fedapay/verify-transaction', fedapayVerify);
    router.get('/bookings', bookingsList);
    router.post('/bookings/check-slot', bookingsCheckSlot);
    router.get('/bookings/:id/status', bookingsStatus);
    router.post('/bookings/:id/status', bookingsStatusUpdate);

    router.get('/providers/pending', listPending);
    router.get('/providers/public', listPublicProviders);
    router.post('/providers/request', requestProvider);
    router.post('/providers/validate', validateProvider);
    router.post('/providers/refuse', refuseProvider);
    router.get('/providers/active', listActive);
    router.post('/providers/toggle-active', toggleActive);

    router.get('/admin/brevo-status', adminBrevoStatus);

    // Client reviews tied to completed bookings.
    router.post('/reviews', reviewsCreate);
    router.get('/reviews/eligible', reviewsEligible);
    router.get('/admin/reviews', reviewsAdminList);
    router.post('/admin/reviews/:id/hide', hideReview);
    router.post('/admin/reviews/:id/restore', restoreReview);
    router.delete('/admin/reviews/:id', deleteReview);

    // Brevo transactional emails (server-side only; key stays in Express env).
    router.post('/emails/booking-confirmation', emailsBooking);
    router.post('/emails/provider-activation', emailsProviderActivation);

    return router;
};
