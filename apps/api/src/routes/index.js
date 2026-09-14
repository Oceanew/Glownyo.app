import { Router } from 'express';
import healthCheck from './health-check.js';
import fedapayCheckout from './fedapay-checkout.js';
import fedapayVerify from './fedapay-verify.js';
import bookingsList from './bookings-list.js';
import bookingsCheckSlot from './bookings-check-slot.js';
import bookingsStatus from './bookings-status.js';
import {
	listPending,
	requestProvider,
	validateProvider,
	refuseProvider,
} from './providers-admin.js';
import { listPublicProviders } from './providers-public.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.post('/fedapay/create-transaction', fedapayCheckout);
    router.post('/fedapay/verify-transaction', fedapayVerify);
    router.get('/bookings', bookingsList);
    router.post('/bookings/check-slot', bookingsCheckSlot);
    router.get('/bookings/:id/status', bookingsStatus);

    router.get('/providers/pending', listPending);
    router.get('/providers/public', listPublicProviders);
    router.post('/providers/request', requestProvider);
    router.post('/providers/validate', validateProvider);
    router.post('/providers/refuse', refuseProvider);

    return router;
};

