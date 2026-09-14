import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CalendarClock, Trash2, Loader2, RefreshCw, MessageCircle, CalendarCheck, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentStatusBadge } from './BookingPage';
import { waLink } from '@/data/site';

const MesRendezVousPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // The bookings listRule now also lets an assigned provider see their
      // reservations. In the client space we only want the user's own
      // (owner) bookings, so we filter by owner explicitly.
      const list = await pb.collection('bookings').getFullList({
        sort: '-created',
        filter: pb.filter('owner = {:uid}', { uid: user?.id || '' }),
      });
      setBookings(list);
    } catch (err) {
      console.error('load my bookings failed', err);
      setError('Impossible de charger vos rendez-vous pour le moment.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (id) => {
    if (!window.confirm('Annuler cette réservation ? Cette action est définitive.')) return;
    setCancellingId(id);
    try {
      await pb.collection('bookings').delete(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('cancel booking failed', err);
      setError("L'annulation a échoué. Réessayez dans un instant.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[72rem] px-5 sm:px-8">
      <Helmet>
        <title>Mes rendez-vous — GlowNyo</title>
        <meta
          name="description"
          content="Consultez et gérez vos réservations GlowNyo depuis votre espace personnel."
        />
      </Helmet>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs tracking-widest uppercase text-gold">Espace client</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-tight">
            Mes rendez-vous
          </h1>
          <p className="mt-3 text-[#F5F0E6]/65">
            Bonjour{user?.name ? `, ${user.name}` : ''}. Retrouvez ici toutes vos réservations GlowNyo.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="mt-12 flex items-center justify-center text-[#F5F0E6]/50">
          <Loader2 size={22} className="animate-spin text-gold" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-full gold-gradient flex items-center justify-center">
            <CalendarClock size={24} className="text-[#0A0A0A]" />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold">Aucun rendez-vous pour l'instant</h2>
          <p className="mt-2 text-sm text-[#F5F0E6]/60 max-w-sm mx-auto">
            Vous n'avez pas encore de réservation liée à ce compte. Réservez votre première prestation GlowNyo.
          </p>
          <Link
            to="/reservation"
            className="mt-6 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition"
          >
            <CalendarCheck size={17} /> Réserver un rendez-vous
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{b.service || 'Prestation'}</p>
                  <p className="text-sm text-[#F5F0E6]/60">{b.provider || 'Prestataire à confirmer'}</p>
                </div>
                <PaymentStatusBadge status={b.payment_status || 'pending'} />
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-[#F5F0E6]/75">
                <p className="flex items-center gap-2">
                  <CalendarClock size={14} className="text-gold" />
                  {b.date || 'Date à confirmer'} {b.time ? `— ${b.time}` : ''}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-gold" />
                  Demandé le {new Date(b.created).toLocaleDateString('fr-FR')}
                </p>
                {b.message && (
                  <p className="text-[#F5F0E6]/55 italic">« {b.message} »</p>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2 pt-4 border-t border-[#C9922A]/10">
                <a
                  href={waLink(
                    `Bonjour GlowNyo, j'ai une question concernant ma réservation (${b.service || 'prestation'} du ${b.date || '—'}).`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:brightness-110 transition"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <button
                  onClick={() => cancel(b.id)}
                  disabled={cancellingId === b.id}
                  className="ml-auto inline-flex items-center gap-1.5 text-sm text-red-400/80 hover:text-red-400 transition disabled:opacity-60"
                >
                  {cancellingId === b.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Annuler
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesRendezVousPage;
