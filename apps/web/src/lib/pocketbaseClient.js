import Pocketbase from 'pocketbase';

// Defaults to `/hcgi/platform`, the reverse-proxy path used by the current
// hosting setup. Override with VITE_POCKETBASE_URL for any other deployment
// (e.g. a standalone PocketBase instance on its own domain).
const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || '/hcgi/platform';

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };
