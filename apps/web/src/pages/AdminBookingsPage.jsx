import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Clock, Check, XCircle, RefreshCw, Users } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';

const STATUS_META = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-[#C9922A]/10 text-gold border-[#C9922A]/30' },
  paid: { label: 'Payé', icon: Check, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  failed: { label: 'Échoué', icon: XCircle, className: 'bg-red-500/10 text-red-400 border-red-500/30' }
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${meta.className}`}>
    <Icon size={12} /> {meta.label}
  </span>;
};

const AdminBookingsPage = () => {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = () => ({
    Authorization: pb.authStore.token || '',
  });

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiServerClient.fetch('/bookings', {
        headers: authHeaders(),
      });
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
  };

  useEffect(() => {
    if (isAdmin) loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 mx-auto max-w-md px-5 sm:px-8 text-center">
        <Helmet>
          <title>Administration — GlowNyo</title>
        </Helmet>
        <p className="text-[#F5F0E6]/70">
          Cet espace est réservé aux administrateurs GlowNyo.
        </p>
        <Link
          to="/connexion"
          className="mt-5 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[72rem] px-5 sm:px-8">
      <Helmet>
        <title>Réservations — Administration GlowNyo</title>
      </Helmet>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs tracking-widest uppercase text-gold">Administration</span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold leading-tight">Réservations</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/prestataires" className="inline-flex items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition text-sm">
            <Users size={16} /> Demandes prestataires
          </Link>
          <button onClick={() => loadBookings()} disabled={loading} className="inline-flex items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition disabled:opacity-60">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      <div className="mt-8 overflow-x-auto rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#C9922A]/15 text-left text-[#F5F0E6]/50 uppercase text-xs tracking-wide">
              <th className="px-5 py-4">Nom</th>
              <th className="px-5 py-4">Téléphone</th>
              <th className="px-5 py-4">Prestation</th>
              <th className="px-5 py-4">Prestataire</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Statut acompte</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && !loading && <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-[#F5F0E6]/50">Aucune réservation pour le moment.</td>
            </tr>}
            {bookings.map(b => <tr key={b.id} className="border-b border-[#C9922A]/10 last:border-0">
              <td className="px-5 py-4">{b.name}</td>
              <td className="px-5 py-4">{b.phone}</td>
              <td className="px-5 py-4">{b.service || '—'}</td>
              <td className="px-5 py-4">{b.provider || '—'}</td>
              <td className="px-5 py-4">{b.date || '—'} {b.time || ''}</td>
              <td className="px-5 py-4"><StatusBadge status={b.payment_status || 'pending'} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
