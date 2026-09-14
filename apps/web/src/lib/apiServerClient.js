// Defaults to `/hcgi/api`, the reverse-proxy path used by the current
// hosting setup. Override with VITE_API_URL for any other deployment
// (e.g. a standalone Express API on its own domain).
export const API_SERVER_URL = import.meta.env.VITE_API_URL || '/hcgi/api';

const apiServerClient = {
    fetch: async (url, options = {}) => {
        return await window.fetch(API_SERVER_URL + url, options);
    }
};

export default apiServerClient;

export { apiServerClient };
