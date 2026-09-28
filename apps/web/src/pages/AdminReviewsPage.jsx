import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Star,
  EyeOff,
  Eye,
  Trash2,
  Loader2,
  BadgeCheck,
  MessageSquare,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const Stars = ({ value }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={13}
        className={n <= value ? 'text-gold' : 'text-[#F5F0E6]/20'}
        fill={n <= value ? 'currentColor' : 'none'}
      />
    ))}
  </span>
);

const AdminReviewsPage = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [filter, setFilter] = useState('all'); // all | visible | hidden

  const authHeaders = () => ({
    Authorization: pb.authStore.token || '',
    'Content-Type': 'application/json',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiServerClient.fetch('/admin/reviews', {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        setError("Accès refusé : votre compte n'est pas administrateur.");
        return;
      }
      if (!res.ok) throw new Error('load_failed');
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('failed to load reviews', err);
      setError('Impossible de charger les avis pour le moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const moderate = async (id, action) => {
    setActingId(id);
    setActionMsg(null);
    try {
      let res;
      if (action === 'hide') {
        res = await apiServerClient.fetch(`/admin/reviews/${id}/hide`, {
          method: 'POST',
          headers: authHeaders(),
        });
      } else if (action === 'restore') {
        res = await apiServerClient.fetch(`/admin/reviews/${id}/restore`, {
          method: 'POST',
          headers: authHeaders(),
        });
      } else if (action === 'delete') {
        res = await apiServerClient.fetch(`/admin/reviews/${id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
      }
      if (!res.ok) throw new Error('moderate_failed');
      const data = await res.json().catch(() => ({}));
      if (action === 'delete') {
        setItems((prev) => prev.filter((r) => r.id !== id));
        setActionMsg({ type: 'success', text: 'Avis supprimé définitivement.' });
      } else {
        setItems((prev) =>
          prev.map((r) => (r.id === id ? { ...r, hidden: data.hidden } : r)),
        );
        setActionMsg({
          type: 'success',
          text: action === 'hide' ? 'Avis masqué du profil public.' : 'Avis restauré et de nouveau visible.',
        });
      }
    } catch (err) {
      console.error('moderate failed', err);
      setActionMsg({ type: 'error', text: "L'action a échoué. Réessayez dans un instant." });
    } finally {
      setActingId(null);
    }
  };

  const onHide = (id) => moderate(id, 'hide');
  const onRestore = (id) => moderate(id, 'restore');
  const onDelete = (id) => {
    if (
      !window.confirm(
        'Supprimer définitivement cet avis ? Cette action est irréversible et le contenu du client sera effacé.',
      )
    )
      return;
    moderate(id, 'delete');
  };

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 mx-auto max-w-md px-5 sm:px-8 text-center">
        <Helmet>
          <title>Avis — Administration GlowNyo</title>
        </Helmet>
        <p className="text-[#F5F0E6]/70">Cet espace est réservé aux administrateurs GlowNyo.</p>
        <Link to="/connexion" className="mt-5 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition">
          Se connecter
        </Link>
      </div>
    );
  }

  const filtered = items.filter((r) => {
    if (filter === 'visible') return !r.hidden;
    if (filter === 'hidden') return r.hidden;
    return true;
  });
  const hiddenCount = items.filter((r) => r.hidden).length;

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[90rem] px-5 sm:px-8">
      <Helmet>
        <title>Avis clients — Administration GlowNyo</title>
        <meta name="description" content="Modération des avis clients GlowNyo : masquer, restaurer ou supprimer un avis vérifié." />
      </Helmet>

      <AdminNav onRefresh={load} refreshing={loading} title="Avis clients" subtitle="Modérez les avis vérifiés : masquez, restaurez ou supprimez un avis. Le contenu rédigé par un client ne peut jamais être modifié." />

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {actionMsg && (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            actionMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Filters */}
      <div className="mt-8 flex items-center gap-2 flex-wrap">
        {[
          { key: 'all', label: `Tous (${items.length})` },
          { key: 'visible', label: `Visibles (${items.length - hiddenCount})` },
          { key: 'hidden', label: `Masqués (${hiddenCount})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-1.5 border px-4 py-2 rounded-full text-sm transition ${
              filter === f.key
                ? 'border-[#C9922A] text-gold bg-[#C9922A]/10'
                : 'border-[#C9922A]/25 text-[#F5F0E6]/75 hover:bg-[#C9922A]/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-sm text-[#F5F0E6]/50">
          <Loader2 size={16} className="animate-spin" /> Chargement des avis…
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-12 text-center">
          <MessageSquare size={28} className="mx-auto text-gold/60" />
          <p className="mt-3 text-[#F5F0E6]/50">Aucun avis dans cette catégorie pour le moment.</p>
        </div>
      )}

      <div className="mt-8 grid gap-5">
        {filtered.map((r) => (
          <article
            key={r.id}
            className={`rounded-3xl border bg-[#0F0F0F] p-6 ${
              r.hidden ? 'border-[#F5F0E6]/10 opacity-75' : 'border-[#C9922A]/15'
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="font-display text-lg font-semibold">
                    {r.client_name || 'Client GlowNyo'}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                    <BadgeCheck size={12} /> Vérifié
                  </span>
                  {r.hidden && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#F5F0E6]/20 bg-[#F5F0E6]/5 text-[#F5F0E6]/55 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                      <EyeOff size={12} /> Masqué
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <Stars value={Number(r.rating) || 0} />
                  <span className="text-xs text-[#F5F0E6]/45">{formatDate(r.created)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {r.hidden ? (
                  <button
                    onClick={() => onRestore(r.id)}
                    disabled={actingId === r.id}
                    className="inline-flex items-center gap-1.5 border border-emerald-500/40 text-emerald-300 font-semibold px-4 py-2 rounded-full text-sm hover:bg-emerald-500/10 transition disabled:opacity-60"
                  >
                    {actingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    Restaurer
                  </button>
                ) : (
                  <button
                    onClick={() => onHide(r.id)}
                    disabled={actingId === r.id}
                    className="inline-flex items-center gap-1.5 border border-[#C9922A]/40 text-gold font-semibold px-4 py-2 rounded-full text-sm hover:bg-[#C9922A]/10 transition disabled:opacity-60"
                  >
                    {actingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />}
                    Masquer
                  </button>
                )}
                <button
                  onClick={() => onDelete(r.id)}
                  disabled={actingId === r.id}
                  className="inline-flex items-center gap-1.5 border border-red-500/40 text-red-400 font-semibold px-4 py-2 rounded-full text-sm hover:bg-red-500/10 transition disabled:opacity-60"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>

            <p className="mt-4 text-[#F5F0E6]/80 leading-relaxed whitespace-pre-wrap">
              {r.comment}
            </p>

            <div className="mt-4 pt-4 border-t border-[#C9922A]/10 grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
              <p className="text-[#F5F0E6]/65">
                <span className="text-gold">Prestataire :</span> {r.provider || '—'}
              </p>
              <p className="text-[#F5F0E6]/65">
                <span className="text-gold">Client :</span> {r.client_email || '—'}
              </p>
              {r.booking && (
                <>
                  <p className="text-[#F5F0E6]/65">
                    <span className="text-gold">Prestation :</span> {r.booking.service || '—'}
                  </p>
                  <p className="text-[#F5F0E6]/65">
                    <span className="text-gold">Réservation :</span> {r.booking.date} {r.booking.time}
                    {' · '}{r.booking.booking_status || '—'}
                  </p>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
