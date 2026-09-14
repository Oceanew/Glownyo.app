import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Scissors,
  MapPin,
  Phone,
  Instagram,
  Loader2,
  RefreshCw,
  CalendarClock,
  Clock,
  MessageCircle,
  CalendarCheck,
  UserCircle,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentStatusBadge } from './BookingPage';
import SpaceSwitcher from '@/components/SpaceSwitcher';
import { waLink } from '@/data/site';

const ProviderSpacePage = () => {
  const { user, isProvider, isDualRole } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only accounts with provider access can view this space. Everyone else is
  // redirected to the client account page.
  useEffect(() => {
    if (!isProvider) navigate('/mon-compte', { replace: true });
  }, [isProvider, navigate]);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    try {
      // The bookings listRule lets an assigned provider see reservations where
      // provider_email matches their account email.
      const list = await pb.collection('bookings').getFullList({
        sort: '-created',
        filter: pb.filter('provider_email = {:email}', { email: user.email }),
      });
      setBookings(list);
    } catch (err) {
      console.error('load provider bookings failed', err);
      setError('Impossible de charger vos réservations pour le moment.');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (isProvider) load();
  }, [isProvider, load]);

  if (!isProvider) return null;

  const profile = [
    { icon: Scissors, label: 'Spécialité', value: user?.specialty },
    { icon: MapPin, label: 'Localisation', value: user?.location },
    { icon: Phone, label: 'Téléphone / WhatsApp', value: user?.phone },
  ].filter((r) => r.value);

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[72rem] px-5 sm:px-8">
      <Helmet>
        <title>Espace prestataire — GlowNyo</title>
        <meta
          name="description"
          content="Votre espace prestataire GlowNyo : consultez vos réservations et votre profil."
        />
      </Helmet>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs tracking-widest uppercase text-gold">
            Espace prestataire
          </span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-tight">
            Bonjour{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-3 text-[#F5F0E6]/65">
            Retrouvez ici les réservations qui vous ont été attribuées et votre
            profil prestataire.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {isDualRole && <SpaceSwitcher />}
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {/* Provider profile */}
      <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center shrink-0">
            <Scissors size={24} className="text-[#0A0A0A]" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold truncate">
              {user?.name || 'Prestataire GlowNyo'}
            </p>
            <p className="text-sm text-[#F5F0E6]/60 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
          {profile.map((r) => (
            <div key={r.label} className="flex items-start gap-2.5">
              <r.icon size={16} className="text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-[#F5F0E6]/50 text-xs uppercase tracking-wide">
                  {r.label}
                </p>
                <p className="text-[#F5F0E6]/85">{r.value}</p>
              </div>
            </div>
          ))}
        </div>

        {user?.services && (
          <div className="mt-5">
            <p className="text-gold font-medium text-sm">Services proposés</p>
            <p className="mt-1 text-sm text-[#F5F0E6]/75 whitespace-pre-wrap">
              {user.services}
            </p>
          </div>
        )}
        {user?.bio && (
          <div className="mt-4">
            <p className="text-gold font-medium text-sm">Présentation</p>
            <p className="mt-1 text-sm text-[#F5F0E6]/75 whitespace-pre-wrap">
              {user.bio}
            </p>
          </div>
        )}
        {user?.instagram && (
          <a
            href={user.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm text-[#F5F0E6]/80 hover:text-gold transition"
          >
            <Instagram size={16} className="text-gold" /> Voir le profil Instagram
          </a>
        )}
      </div>

      {/* Assigned bookings */}
      <div className="mt-8">
        <h2 className="font-display text-2xl font-semibold">
          Réservations reçues
        </h2>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <div className="mt-10 flex items-center justify-center text-[#F5F0E6]/50">
            <Loader2 size={22} className="animate-spin text-gold" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full gold-gradient flex items-center justify-center">
              <CalendarClock size={24} className="text-[#0A0A0A]" />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">
              Aucune réservation pour l'instant
            </h3>
            <p className="mt-2 text-sm text-[#F5F0E6]/60 max-w-sm mx-auto">
              Dès qu'une cliente réservera une prestation chez vous, la demande
              apparaîtra ici.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 gap-5">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {b.service || 'Prestation'}
                    </p>
                    <p className="text-sm text-[#F5F0E6]/60 flex items-center gap-1.5">
                      <UserCircle size={13} className="text-gold" />
                      {b.name || 'Cliente'}
                    </p>
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
                  {b.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-gold" />
                      {b.phone}
                    </p>
                  )}
                  {b.message && (
                    <p className="text-[#F5F0E6]/55 italic">« {b.message} »</p>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-2 pt-4 border-t border-[#C9922A]/10">
                  {b.phone && (
                    <a
                      href={waLink(
                        `Bonjour ${b.name || ''}, c'est ${user?.name || 'votre prestataire'} GlowNyo concernant votre réservation (${b.service || 'prestation'} du ${b.date || '—'}).`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:brightness-110 transition"
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Link
          to="/reservation"
          className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition"
        >
          <CalendarCheck size={17} /> Réserver une prestation
        </Link>
      </div>
    </div>
  );
};

export default ProviderSpacePage;
