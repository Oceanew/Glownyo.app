import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  BadgeCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useReviews } from '@/lib/useReviews';

const PER_PAGE = 5;

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const Stars = ({ value, size = 16 }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= value ? 'text-gold' : 'text-[#F5F0E6]/20'}
        fill={n <= value ? 'currentColor' : 'none'}
      />
    ))}
  </span>
);

const StarPicker = ({ value, onChange, disabled }) => (
  <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Note">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={disabled}
        onClick={() => onChange(n)}
        aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        className="p-0.5 transition disabled:opacity-50"
      >
        <Star
          size={26}
          className={n <= value ? 'text-gold' : 'text-[#F5F0E6]/25 hover:text-gold/60'}
          fill={n <= value ? 'currentColor' : 'none'}
        />
      </button>
    ))}
  </div>
);

const ReviewForm = ({ eligible, onSubmit, submitting }) => {
  const [bookingId, setBookingId] = useState(eligible[0]?.id || '');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);

  const selected = eligible.find((b) => b.id === bookingId) || eligible[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!bookingId || rating < 1 || !comment.trim()) return;
    onSubmit({ booking_id: bookingId, rating, comment: comment.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#C9922A]/20 bg-[#0F0F0F] p-6"
    >
      <h3 className="font-display text-xl font-semibold">Laisser un avis</h3>
      <p className="mt-1.5 text-sm text-[#F5F0E6]/60">
        Votre avis sera publié avec le badge « Réservation vérifiée ».
      </p>

      {eligible.length > 1 && (
        <div className="mt-5">
          <label className="block text-xs uppercase tracking-widest text-gold mb-2">
            Réservation concernée
          </label>
          <select
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            disabled={submitting}
            className="w-full rounded-xl border border-[#C9922A]/25 bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F0E6] focus:border-gold outline-none"
          >
            {eligible.map((b) => (
              <option key={b.id} value={b.id}>
                {b.service || 'Prestation'} — {b.date} {b.time}
              </option>
            ))}
          </select>
        </div>
      )}

      {selected && eligible.length <= 1 && (
        <p className="mt-4 text-sm text-[#F5F0E6]/70">
          Réservation : <span className="text-gold">{selected.service || 'Prestation'}</span>
          {' — '}{selected.date} {selected.time}
        </p>
      )}

      <div className="mt-5">
        <label className="block text-xs uppercase tracking-widest text-gold mb-2">
          Votre note
        </label>
        <StarPicker value={rating} onChange={setRating} disabled={submitting} />
        {touched && rating < 1 && (
          <p className="mt-1.5 text-xs text-red-400">Veuillez sélectionner une note de 1 à 5.</p>
        )}
      </div>

      <div className="mt-5">
        <label className="block text-xs uppercase tracking-widest text-gold mb-2">
          Votre commentaire
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
          rows={4}
          maxLength={2000}
          placeholder="Décrivez votre expérience…"
          className="w-full rounded-xl border border-[#C9922A]/25 bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:border-gold outline-none resize-none"
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-[#F5F0E6]/40">{comment.length}/2000</span>
          {touched && !comment.trim() && (
            <span className="text-red-400">Le commentaire est obligatoire.</span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex items-center justify-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition disabled:opacity-60"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} fill="currentColor" />}
        Publier mon avis
      </button>
    </form>
  );
};

const ProviderReviews = ({ providerName }) => {
  const {
    isAuthed,
    reviews,
    average,
    count,
    loading,
    error,
    eligible,
    eligibleLoading,
    refresh,
  } = useReviews(providerName);

  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));
  const pageItems = reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSubmit = async ({ booking_id, rating, comment }) => {
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await apiServerClient.fetch('/reviews', {
        method: 'POST',
        headers: {
          Authorization: pb.authStore.token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_id, rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setSubmitMsg({ type: 'error', text: 'Connectez-vous pour publier un avis.' });
      } else if (res.status === 403) {
        const map = {
          not_owner: "Cette réservation ne vous appartient pas.",
          booking_not_completed: "Seules les réservations terminées peuvent être notées.",
        };
        setSubmitMsg({ type: 'error', text: map[data.error] || "Vous n'êtes pas autorisé à publier cet avis." });
      } else if (res.status === 409) {
        setSubmitMsg({ type: 'error', text: 'Un avis a déjà été publié pour cette réservation.' });
      } else if (!res.ok) {
        setSubmitMsg({ type: 'error', text: "Une erreur est survenue. Réessayez dans un instant." });
      } else {
        setSubmitMsg({ type: 'success', text: 'Merci ! Votre avis a été publié.' });
        setPage(1);
        await refresh();
      }
    } catch (err) {
      console.error('submit review failed', err);
      setSubmitMsg({ type: 'error', text: "Une erreur est survenue. Réessayez dans un instant." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-14">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-display text-2xl font-semibold">Avis clients</h2>
        {count > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C9922A]/30 bg-[#C9922A]/10 text-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Star size={12} fill="currentColor" /> {average.toFixed(1)} · {count} avis
          </span>
        )}
      </div>

      {/* Summary */}
      {!loading && count > 0 && (
        <div className="mt-5 flex items-center gap-6 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
          <div className="text-center">
            <p className="font-display text-5xl font-semibold text-gold">{average.toFixed(1)}</p>
            <Stars value={Math.round(average)} size={16} />
          </div>
          <div className="h-12 w-px bg-[#C9922A]/15" />
          <p className="text-sm text-[#F5F0E6]/70">
            Basé sur <span className="text-gold font-semibold">{count}</span> avis vérifiés
            de clients ayant réservé sur GlowNyo.
          </p>
        </div>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-[#F5F0E6]/50">
          <Loader2 size={16} className="animate-spin" /> Chargement des avis…
        </div>
      )}
      {error && !loading && (
        <p className="mt-6 text-sm text-red-400">{error}</p>
      )}

      {/* Review form: only for logged-in clients with a reviewable booking */}
      {!loading && isAuthed && eligible.length > 0 && (
        <div className="mt-8">
          <ReviewForm
            eligible={eligible}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
          {submitMsg && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                submitMsg.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/30 bg-red-500/10 text-red-300'
              }`}
            >
              {submitMsg.text}
            </div>
          )}
        </div>
      )}

      {/* Eligibility hints */}
      {!loading && isAuthed && !eligibleLoading && eligible.length === 0 && count >= 0 && (
        <p className="mt-6 text-sm text-[#F5F0E6]/45">
          Vous n'avez pas de réservation terminée chez cette personne prestataire, ou vous avez déjà
          laissé un avis pour chacune d'elles.
        </p>
      )}
      {!loading && !isAuthed && (
        <div className="mt-6 rounded-2xl border border-[#C9922A]/15 bg-[#0F0F0F] p-5 text-sm text-[#F5F0E6]/65">
          <MessageSquare size={16} className="inline text-gold mr-2" />
          Seules les personnes connectées ayant une réservation terminée peuvent publier un avis.{' '}
          <Link to="/connexion" className="text-gold underline hover:brightness-110">
            Connectez-vous
          </Link>{' '}
          pour partager votre expérience.
        </div>
      )}

      {/* Reviews list (paginated) */}
      {!loading && pageItems.length > 0 && (
        <div className="mt-8 grid gap-5">
          {pageItems.map((r) => (
            <article
              key={r.id}
              className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-display text-lg font-semibold">
                      {r.client_name || 'Client GlowNyo'}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                      <BadgeCheck size={12} /> Réservation vérifiée
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <Stars value={Number(r.rating) || 0} size={15} />
                    <span className="text-xs text-[#F5F0E6]/45">{formatDate(r.created)}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[#F5F0E6]/80 leading-relaxed whitespace-pre-wrap">
                {r.comment}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1.5 border border-[#C9922A]/30 text-[#F5F0E6]/80 px-4 py-2 rounded-full text-sm hover:bg-[#C9922A]/10 transition disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Précédent
          </button>
          <span className="text-sm text-[#F5F0E6]/60">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1.5 border border-[#C9922A]/30 text-[#F5F0E6]/80 px-4 py-2 rounded-full text-sm hover:bg-[#C9922A]/10 transition disabled:opacity-40"
          >
            Suivant <ChevronRight size={15} />
          </button>
        </div>
      )}

      {!loading && count === 0 && !error && (
        <div className="mt-6 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-10 text-center">
          <p className="text-[#F5F0E6]/50">
            Aucun avis pour le moment. Soyez la première personne à partager votre expérience.
          </p>
        </div>
      )}
    </section>
  );
};

export default ProviderReviews;
