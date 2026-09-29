// The bookings/providers/reviews/FedaPay/email routes are registered
// directly on the PocketBase instance (see apps/pocketbase/pb_hooks/api-*.pb.js),
// at the same paths a standalone Express API used to serve — so this shares
// PocketBase's own base URL by default. Override with VITE_API_URL only if
// you still run those routes on a separate server.
const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || '/hcgi/platform';

export const API_SERVER_URL = import.meta.env.VITE_API_URL || POCKETBASE_API_URL;

const apiServerClient = {
    fetch: async (url, options = {}) => {
        return await window.fetch(API_SERVER_URL + url, options);
    }
};

export default apiServerClient;

export { apiServerClient };
