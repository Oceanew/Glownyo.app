import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Clock,
  Check,
  XCircle,
  RefreshCw,
  Loader2,
  Eye,
  CheckCircle2,
  Ban,
  Flag,
  Search,
  X,
  MessageCircle,
  Mail,
  CalendarDays,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { waLink } from '@/data/site';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const PAYMENT_META = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-[#C9922A]/10 text-gold border-[#C9922A]/30' },
  paid: { label: 'Payé', icon: Check, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  failed: { label: 'Échoué', icon: XCircle, className: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

const BOOKING_STATUS_META = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-[#C9922A]/10 text-gold border-[#C9922A]/30' },
  confirmed: { label: 'Confirmée', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Annulée', icon: Ban, className: 'bg-red-500/10 text-red-400 border-red-500/30' },
  completed: { label: 'Terminée', icon: Flag, className: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
};

const Badge = ({ meta, status }) => {
  const m = meta[status] || meta.pending;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${m.className}`}>
      <Icon size={11} /> {m.label}
    </span>
  );
};

const selectCls =
  'rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-3 py-2.5 text-sm text-[#F5F0E6] focus:outline-none focus:border-[#C9922A] transition [color-scheme:dark]';

const AdminBookingsPage = () => {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [selected, setSelected] = useState(null);

  // Filters
  const [fStatus, setFStatus] = useState('all');
  const [fPayment, setFPayment] = useState('all');
  const [fDate, setFDate] = useState('');
  const [fClient, setFClient] = useState('');
  const [fProvider, setFProvider] = useState('');

  const authHeaders = () => ({
    Authorization: pb.authStore.token || '',
    'Content-Type': 'application/json',
  });

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiServerClient.fetch('/bookings', { headers: authHeaders() });
      if (res.status === 401) {
        setError("Accès refusé : votre compte n'est pas administrateur.");
        return;
      }
      if (!res.ok) throw new Error('load_failed');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error('failed to load bookings', err);
      setError('Impossible de charger les réservations pour le moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadBookings();
  }, [isAdmin, loadBookings]);

  const providers = useMemo(() => {
    const set = new Set();
    bookings.forEach((b) => b.provider && set.add(b.provider));
    return Array.from(set).sort();
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => {
        const st = b.booking_status || 'pending';
        if (fStatus !== 'all' && st !== fStatus) return false;
        if (fPayment !== 'all' && (b.payment_status || 'pending') !== fPayment) return false;
        if (fDate && b.date !== fDate) return false;
        if (fClient) {
          const q = fClient.toLowerCase();
          const hit =
            (b.name || '').toLowerCase().includes(q) ||
            (b.email || '').toLowerCase().includes(q) ||
            (b.phone || '').toLowerCase().includes(q);
          if (!hit) return false;
        }
        if (fProvider !== 'all' && b.provider !== fProvider) return false;
        return true;
      })
      .sort((a, b) => (b.created || '').localeCompare(a.created || ''));
  }, [bookings, fStatus, fPayment, fDate, fClient, fProvider]);

  const updateStatus = async (id, status) => {
    const verb = {
      confirmed: 'confirmer',
      cancelled: 'annuler',
      completed: 'marquer comme terminée',
      pending: 'remettre en attente',
    }[status];
    if (!window.confirm(`Voulez-vous vraiment ${verb} cette réservation ?`)) return;
    setActingId(id);
    setActionMsg(null);
    try {
      const res = await apiServerClient.fetch(`/bookings/${id}/status`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('update_failed');
      const data = await res.json().catch(() => ({}));
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, booking_status: data.booking_status || status } : b)),
      );
      setSelected((prev) => (prev && prev.id === id ? { ...prev, booking_status: data.booking_status || status } : prev));
      setActionMsg({ type: 'success', text: `Réservation ${BOOKING_STATUS_META[status].label.toLowerCase()}.` });
    } catch (err) {
      console.error('update booking status failed', err);
      setActionMsg({ type: 'error', text: "L'action a échoué. Réessayez dans un instant." });
    } finally {
      setActingId(null);
    }
  };

  const resendEmail = async (id) => {
    setActingId(`email-${id}`);
    setActionMsg(null);
    try {
      const res = await apiServerClient.fetch('/emails/booking-confirmation', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ bookingId: id, force: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        setActionMsg({ type: 'warn', text: "Brevo n'est pas configuré : l'email n'a pas pu être renvoyé." });
      } else if (!res.ok) {
        throw new Error('resend_failed');
      } else if (data.email_status === 'sent') {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, email_status: 'sent' } : b)));
        setSelected((prev) => (prev && prev.id === id ? { ...prev, email_status: 'sent' } : prev));
        setActionMsg({ type: 'success', text: 'Email de confirmation renvoyé.' });
      } else {
        setActionMsg({ type: 'warn', text: "L'email n'a pas pu être envoyé (service d'email indisponible)." });
      }
    } catch (err) {
      console.error('resend email failed', err);
      setActionMsg({ type: 'error', text: "Le renvoi de l'email a échoué." });
    } finally {
      setActingId(null);
    }
  };

  const resetFilters = () => {
    setFStatus('all');
    setFPayment('all');
    setFDate('');
    setFClient('');
    setFProvider('all');
  };

  const hasFilters =
    fStatus !== 'all' || fPayment !== 'all' || fDate || fClient || fProvider !== 'all';

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 mx-auto max-w-md px-5 sm:px-8 text-center">
        <Helmet>
          <title>Administration — GlowNyo</title>
        </Helmet>
        <p className="text-[#F5F0E6]/70">Cet espace est réservé aux administrateurs GlowNyo.</p>
        <Link to="/connexion" className="mt-5 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[90rem] px-5 sm:px-8">
      <Helmet>
        <title>Réservations — Administration GlowNyo</title>
        <meta name="description" content="Gérez les réservations GlowNyo : filtres par statut, date, client et prestataire, confirmation, annulation et clôture." />
      </Helmet>

      <AdminNav onRefresh={loadBookings} refreshing={loading} title="Réservations" />

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {actionMsg && (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            actionMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : actionMsg.type === 'warn'
                ? 'border-[#C9922A]/30 bg-[#C9922A]/10 text-gold'
                : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Filters */}
      <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[#F5F0E6]/55">Statut réservation</span>
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className={selectCls}>
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
              <option value="completed">Terminée</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[#F5F0E6]/55">Statut acompte</span>
            <select value={fPayment} onChange={(e) => setFPayment(e.target.value)} className={selectCls}>
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="failed">Échoué</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[#F5F0E6]/55">Date</span>
            <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className={selectCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[#F5F0E6]/55">Client (nom, email, tél)</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F5F0E6]/40" />
              <input
                value={fClient}
                onChange={(e) => setFClient(e.target.value)}
                placeholder="Rechercher…"
                className={`${selectCls} pl-8`}
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[#F5F0E6]/55">Prestataire</span>
            <select value={fProvider} onChange={(e) => setFProvider(e.target.value)} className={selectCls}>
              <option value="all">Tous</option>
              {providers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              disabled={!hasFilters}
              className="inline-flex items-center gap-1.5 text-sm text-[#F5F0E6]/60 hover:text-gold transition disabled:opacity-40"
            >
              <X size={14} /> Réinitialiser
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#F5F0E6]/45">
          {filtered.length} réservation{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''} sur {bookings.length}.
        </p>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#C9922A]/15 text-left text-[#F5F0E6]/50 uppercase text-xs tracking-wide">
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Prestation</th>
              <th className="px-5 py-4">Prestataire</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Statut</th>
              <th className="px-5 py-4">Acompte</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[#F5F0E6]/50">
                  <Loader2 size={20} className="animate-spin text-gold inline-block" />
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[#F5F0E6]/50">
                  Aucune réservation ne correspond à ces filtres.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((b) => {
                const st = b.booking_status || 'pending';
                return (
                  <tr key={b.id} className="border-b border-[#C9922A]/10 last:border-0 hover:bg-[#C9922A]/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-[#F5F0E6]/45">{b.phone}</p>
                    </td>
                    <td className="px-5 py-4">{b.service || '—'}</td>
                    <td className="px-5 py-4">{b.provider || '—'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{b.date || '—'} {b.time || ''}</td>
                    <td className="px-5 py-4"><Badge meta={BOOKING_STATUS_META} status={st} /></td>
                    <td className="px-5 py-4"><Badge meta={PAYMENT_META} status={b.payment_status || 'pending'} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelected(b)}
                          className="inline-flex items-center gap-1.5 border border-[#C9922A]/30 text-[#F5F0E6]/80 px-3 py-1.5 rounded-full text-xs hover:bg-[#C9922A]/10 transition"
                        >
                          <Eye size={13} /> Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Details dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg bg-[#0F0F0F] border-[#C9922A]/25 text-[#F5F0E6]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Détails de la réservation</DialogTitle>
            <DialogDescription className="text-[#F5F0E6]/55">
              Informations complètes et actions sur cette réservation.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge meta={BOOKING_STATUS_META} status={selected.booking_status || 'pending'} />
                <Badge meta={PAYMENT_META} status={selected.payment_status || 'pending'} />
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                  selected.email_status === 'sent'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : selected.email_status === 'failed'
                      ? 'border-red-500/30 bg-red-500/10 text-red-300'
                      : 'border-[#F5F0E6]/15 bg-[#F5F0E6]/5 text-[#F5F0E6]/60'
                }`}>
                  <Mail size={11} /> {selected.email_status === 'sent' ? 'Email envoyé' : selected.email_status === 'failed' ? 'Email échoué' : 'Email en attente'}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-[#F5F0E6]/50">Client</dt><dd className="text-right font-medium">{selected.name}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#F5F0E6]/50">Téléphone</dt><dd className="text-right">{selected.phone || '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#F5F0E6]/50">Email</dt><dd className="text-right">{selected.email || '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#F5F0E6]/50">Prestation</dt><dd className="text-right">{selected.service || '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#F5F0E6]/50">Prestataire</dt><dd className="text-right">{selected.provider || '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#F5F0E6]/50 flex items-center gap-1.5"><CalendarDays size={13} className="text-gold" /> Date & heure</dt><dd className="text-right">{selected.date || '—'} {selected.time || ''}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#F5F0E6]/50">Demandé le</dt><dd className="text-right">{selected.created ? new Date(selected.created).toLocaleString('fr-FR') : '—'}</dd></div>
              </dl>

              {selected.message && (
                <div className="mt-4 rounded-2xl bg-[#0A0A0A] border border-[#C9922A]/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-gold mb-1">Message du client</p>
                  <p className="text-sm text-[#F5F0E6]/75 whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-2.5">
                <button
                  onClick={() => updateStatus(selected.id, 'confirmed')}
                  disabled={actingId === selected.id}
                  className="inline-flex items-center gap-1.5 gold-gradient text-[#0A0A0A] font-semibold px-4 py-2 rounded-full text-sm hover:brightness-110 transition disabled:opacity-60"
                >
                  {actingId === selected.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Confirmer
                </button>
                <button
                  onClick={() => updateStatus(selected.id, 'completed')}
                  disabled={actingId === selected.id}
                  className="inline-flex items-center gap-1.5 border border-sky-500/40 text-sky-300 font-semibold px-4 py-2 rounded-full text-sm hover:bg-sky-500/10 transition disabled:opacity-60"
                >
                  <Flag size={14} /> Terminer
                </button>
                <button
                  onClick={() => updateStatus(selected.id, 'cancelled')}
                  disabled={actingId === selected.id}
                  className="inline-flex items-center gap-1.5 border border-red-500/40 text-red-400 font-semibold px-4 py-2 rounded-full text-sm hover:bg-red-500/10 transition disabled:opacity-60"
                >
                  <Ban size={14} /> Annuler
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-[#C9922A]/10">
                <a
                  href={waLink(`Bonjour ${selected.name}, concernant votre réservation GlowNyo (${selected.service || 'prestation'} du ${selected.date || '—'}).`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:brightness-110 transition"
                >
                  <MessageCircle size={15} /> WhatsApp client
                </a>
                <button
                  onClick={() => resendEmail(selected.id)}
                  disabled={actingId === `email-${selected.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-gold hover:brightness-110 transition disabled:opacity-60"
                >
                  {actingId === `email-${selected.id}` ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Renvoyer l'email
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingsPage;
