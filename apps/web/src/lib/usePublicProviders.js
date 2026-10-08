import { useEffect, useState } from 'react';
import { PROVIDERS } from '@/data/site';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const PLACEHOLDER_IMAGE =
  'https://images.hostinger.com/f0b21b20-700b-4420-9f39-92134a1c6db5.png';

// Build a file URL for a file stored on a `users` record (avatar or gallery
// item). The frontend PocketBase client is rooted at `/hcgi/platform`, so
// the resulting URL is served through the same reverse proxy as the rest of
// the API.
const fileUrl = (id, filename) => `${pb.baseUrl}/api/files/users/${id}/${filename}`;

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm)$/i;

// A gallery item uploaded by the provider themselves (native PocketBase
// file) is just a filename; a legacy item ported from the hardcoded
// PROVIDERS list (gallery_urls) is already a full URL string or a
// { type: "video", src } object — same shape ProviderDetailPage expects.
const toGalleryItem = (id, filename) => {
  const src = fileUrl(id, filename);
  return VIDEO_EXTENSIONS.test(filename) ? { type: 'video', src } : src;
};

// Turn the free-form "services" text from the sign-up form (or a missing
// value on an older record) into structured service entries. Real signups
// now store a structured JSON array directly (see
// pb_migrations/1790897932_add_provider_self_service_fields.js).
const parseServices = (services) => {
  if (Array.isArray(services) && services.length > 0) return services;
  if (typeof services === 'string' && services.trim()) {
    return services
      .split(/\r?\n|,|·|;/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, price: 'Sur devis', duration: '—' }));
  }
  return [{ name: 'Prestation sur mesure', price: 'Sur devis', duration: '—' }];
};

const mapDbProvider = (p) => {
  const bio = p.bio || '';
  const tagline =
    p.tagline ||
    bio.split(/\r?\n/).map((s) => s.trim()).find(Boolean) ||
    p.specialty ||
    'Prestataire GlowNyo';
  // A provider's own uploaded avatar takes priority; fall back to the
  // static URL ported over for providers migrated from the hardcoded list.
  const image = p.avatar ? fileUrl(p.id, p.avatar) : p.avatar_url || PLACEHOLDER_IMAGE;
  const legacyGallery = Array.isArray(p.gallery_urls) ? p.gallery_urls : [];
  const ownGallery = Array.isArray(p.gallery) ? p.gallery.map((f) => toGalleryItem(p.id, f)) : [];
  const gallery = [...legacyGallery, ...ownGallery];
  return {
    // A stable slug (set for providers migrated from the hardcoded list, or
    // chosen later for self-signups) keeps the same public URL working;
    // otherwise fall back to the id-based one used since launch.
    slug: p.slug || `db-${p.id}`,
    dbId: p.id,
    name: p.name || 'Prestataire GlowNyo',
    businessName: p.name || '',
    specialty: p.specialty || '',
    tagline,
    location: p.location || 'Cotonou, Bénin',
    whatsapp: p.phone || '',
    whatsappSecondary: p.whatsapp_secondary || '',
    email: p.email || '',
    instagram: p.instagram || null,
    experience: p.experience || '',
    availability: p.availability || '',
    startingPrice: p.starting_price_override || null,
    avatarShape: p.avatar_shape || undefined,
    rating: p.rating || null,
    reviews: p.review_count || 0,
    image,
    bio: bio || tagline,
    services: parseServices(p.services),
    gallery: gallery.length > 0 ? gallery : [image],
    source: 'db',
  };
};

// Reviews are public to read (collection listRule: hidden = false) and each
// one stores the provider's exact display name (copied from the booking at
// creation time — see api-reviews.pb.js), so a single query lets us compute
// every provider's real average/count by name, client-side, in one pass.
const fetchRatingsByProviderName = async () => {
  try {
    const reviews = await pb.collection('reviews').getFullList({ fields: 'provider,rating' });
    const totals = {};
    for (const r of reviews) {
      if (!r.provider) continue;
      const bucket = (totals[r.provider] ||= { sum: 0, count: 0 });
      bucket.sum += Number(r.rating) || 0;
      bucket.count += 1;
    }
    const byName = {};
    for (const [name, { sum, count }] of Object.entries(totals)) {
      byName[name] = { average: sum / count, count };
    }
    return byName;
  } catch (err) {
    console.error('failed to load review ratings', err);
    return {};
  }
};

// A provider's displayed rating/review count defaults to whatever was seeded
// (a historic marketing number for the hardcoded PROVIDERS, or 0 for a fresh
// DB signup) until real Glownyo reviews exist for them — at which point the
// genuine average/count takes over everywhere (listing cards, homepage,
// detail page header), so the badge can never show a stale number once a
// provider has actual reviews.
const applyRealRatings = (list, ratingsByName) =>
  list.map((p) => {
    const real = ratingsByName[p.name];
    if (real && real.count > 0) {
      return { ...p, rating: real.average, reviews: real.count };
    }
    return p;
  });

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
        const [res, ratingsByName] = await Promise.all([
          apiServerClient.fetch('/providers/public'),
          fetchRatingsByProviderName(),
        ]);
        if (!res.ok) throw new Error('load_failed');
        const data = await res.json();
        if (cancelled) return;
        const dbProviders = (Array.isArray(data) ? data : []).map(mapDbProvider);
        // Avoid duplicates: skip DB providers whose slug collides with a
        // static one (shouldn't happen, but be safe).
        const staticSlugs = new Set(PROVIDERS.map((p) => p.slug));
        const extra = dbProviders.filter((p) => !staticSlugs.has(p.slug));
        setProviders(applyRealRatings([...PROVIDERS, ...extra], ratingsByName));
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
