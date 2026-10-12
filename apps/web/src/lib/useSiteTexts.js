import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';

// Module-level cache: every page sharing one SPA session fetches the
// `textes_site` collection at most once, and every call to the hook shares
// the same in-flight request instead of firing one per page.
let cache = null;
let cachePromise = null;

const fetchSiteTexts = async () => {
  if (cache) return cache;
  if (!cachePromise) {
    cachePromise = pb
      .collection('textes_site')
      .getFullList({ fields: 'cle,valeur' })
      .then((records) => {
        const map = {};
        for (const r of records) map[r.cle] = r.valeur;
        cache = map;
        return map;
      })
      .catch((err) => {
        console.error('failed to load site texts', err);
        cachePromise = null;
        return {};
      });
  }
  return cachePromise;
};

// Called after the admin saves a text so the next page visited in this same
// tab re-fetches the fresh values instead of serving the stale cache.
export const invalidateSiteTextsCache = () => {
  cache = null;
  cachePromise = null;
};

// `t(cle, repli)` returns the text stored in the database for `cle`, or
// `repli` (the current hardcoded copy) while loading or if the key is
// missing — so a load failure or an unseeded key never breaks a page.
export function useSiteTexts() {
  const [map, setMap] = useState(cache || {});

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    fetchSiteTexts().then((m) => {
      if (!cancelled) setMap(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const t = (cle, repli) => (map && map[cle]) || repli;

  return { t, textes: map };
}

export default useSiteTexts;
