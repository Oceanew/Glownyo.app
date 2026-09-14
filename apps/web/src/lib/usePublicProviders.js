import { useEffect, useState } from 'react';
import { PROVIDERS } from '@/data/site';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const PLACEHOLDER_IMAGE =
  'https://images.hostinger.com/f0b21b20-700b-4420-9f39-92134a1c6db5.png';

// Build a file URL for a user avatar stored in PocketBase. The frontend
// PocketBase client is rooted at `/hcgi/platform`, so the resulting URL is
// served through the same reverse proxy as the rest of the API.
const avatarUrl = (id, filename) => {
  if (!filename) return PLACEHOLDER_IMAGE;
  return `${pb.baseUrl}/api/files/users/${id}/${filename}`;
};

// Turn the free-form "services" text from the sign-up form into structured
// service entries the provider card / detail page / booking form expect.
const parseServices = (text) => {
  const lines = String(text || '')
    .split(/\r?\n|,|·|;/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return [{ name: 'Prestation sur mesure', price: 'Sur devis', duration: '—' }];
  }
  return lines.map((name) => ({ name, price: 'Sur devis', duration: '—' }));
};

const mapDbProvider = (p) => {
  const bio = p.bio || '';
  const tagline =
    bio.split(/\r?\n/).map((s) => s.trim()).find(Boolean) || p.specialty || 'Prestataire GlowNyo';
  const image = avatarUrl(p.id, p.avatar);
  return {
    slug: `db-${p.id}`,
    dbId: p.id,
    name: p.name || 'Prestataire GlowNyo',
    businessName: p.name || '',
    specialty: p.specialty || '',
    tagline,
    location: p.location || 'Cotonou, Bénin',
    whatsapp: p.phone || '',
    email: p.email || '',
    instagram: p.instagram || null,
    experience: '',
    availability: '',
    startingPrice: null,
    rating: null,
    reviews: 0,
    image,
    bio: bio || tagline,
    services: parseServices(p.services),
    gallery: [image],
    source: 'db',
  };
};

// Returns the merged list of public providers: the seeded static providers
// plus every provider validated by the GlowNyo team (fetched from the
// Express `/providers/public` route). DB providers are appended after the
// seeded ones. `loading` is true only during the initial fetch.
export function usePublicProviders() {
  const [providers, setProviders] = useState(PROVIDERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServerClient.fetch('/providers/public');
        if (!res.ok) throw new Error('load_failed');
        const data = await res.json();
        if (cancelled) return;
        const dbProviders = (Array.isArray(data) ? data : []).map(mapDbProvider);
        // Avoid duplicates: skip DB providers whose slug collides with a
        // static one (shouldn't happen, but be safe).
        const staticSlugs = new Set(PROVIDERS.map((p) => p.slug));
        const extra = dbProviders.filter((p) => !staticSlugs.has(p.slug));
        setProviders([...PROVIDERS, ...extra]);
      } catch (err) {
        // Fail gracefully — the static providers still render.
        console.error('failed to load public providers', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { providers, loading };
}

export default usePublicProviders;
