import { useEffect, useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';

// Fetches the public (non-hidden) reviews for a provider straight from
// PocketBase — the collection listRule (`hidden = false`) guarantees only
// visible reviews come back, even to an anonymous visitor. The hook also
// computes the average rating and total count, and paginates the recent
// reviews client-side. `eligible` lists the caller's completed, not-yet-
// reviewed bookings with this provider so the profile can show the review
// form only to genuine reviewers.
export function useReviews(providerName) {
  const { user, isAuthed } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eligible, setEligible] = useState([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!providerName) {
      setReviews([]);
      setAverage(0);
      setCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const list = await pb
        .collection('reviews')
        .getFullList({
          filter: pb.filter('provider = {:p}', { p: providerName }),
          sort: '-created',
        });
      setReviews(list);
      setCount(list.length);
      if (list.length > 0) {
        const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        setAverage(sum / list.length);
      } else {
        setAverage(0);
      }
    } catch (err) {
      console.error('failed to load reviews', err);
      setError('Impossible de charger les avis pour le moment.');
    } finally {
      setLoading(false);
    }
  }, [providerName]);

  const loadEligible = useCallback(async () => {
    if (!isAuthed || !providerName) {
      setEligible([]);
      return;
    }
    setEligibleLoading(true);
    try {
      const res = await apiServerClient.fetch(
        `/reviews/eligible?provider=${encodeURIComponent(providerName)}`,
        {
          headers: { Authorization: pb.authStore.token || '' },
        },
      );
      if (!res.ok) {
        setEligible([]);
        return;
      }
      const data = await res.json();
      setEligible(Array.isArray(data.eligible) ? data.eligible : []);
    } catch (err) {
      console.error('failed to load eligible bookings', err);
      setEligible([]);
    } finally {
      setEligibleLoading(false);
    }
  }, [isAuthed, providerName]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    loadEligible();
  }, [loadEligible]);

  // After a successful submit, refresh both the public list and the
  // eligible bookings (the reviewed booking leaves the eligible list).
  const refresh = useCallback(async () => {
    await Promise.all([loadReviews(), loadEligible()]);
  }, [loadReviews, loadEligible]);

  return {
    user,
    isAuthed,
    reviews,
    average,
    count,
    loading,
    error,
    eligible,
    eligibleLoading,
    refresh,
  };
}

export default useReviews;
