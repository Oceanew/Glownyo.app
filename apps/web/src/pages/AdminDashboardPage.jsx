import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  MailCheck,
  MailX,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Star,
  TrendingUp,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { EMAIL, TEAM_WHATSAPP, teamWaLink } from '@/data/site';

const PAYMENT_META = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-[#C9922A]/10 text-gold border-[#C9922A]/30' },
  paid: { label: 'Payé', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  failed: { label: 'Échoué', icon: XCircle, className: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

const StatCard = ({ icon: Icon, label, value, hint, accent }) => (
  <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
    <div className="flex items-center gap-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accent || 'bg-[#C9922A]/10'}`}>
        <Icon size={20} className="text-gold" />
      </div>
      <div>
        <p className="text-3xl font-display font-semibold leading-none">{value}</p>
        <p className="mt-1.5 text-xs uppercase tracking-wide text-[#F5F0E6]/50">{label}</p>
      </div>
    </div>
    {hint && <p className="mt-3 text-sm text-[#F5F0E6]/55">{hint}</p>}
  </div>
);

const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [activeProviders, setActiveProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [brevo, setBrevo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = () => ({
    Authorization: pb.authStore.token || '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bkRes, ppRes, apRes, brRes, rvRes] = await Promise.all([
        apiServerClient.fetch('/bookings', { headers: authHeaders() }),
        apiServerClient.fetch('/providers/pending', { headers: authHeaders() }),
        apiServerClient.fetch('/providers/active', { headers: authHeaders() }),
        apiServerClient.fetch('/admin/brevo-status', { headers: authHeaders() }),
        apiServerClient.fetch('/admin/reviews', { headers: authHeaders() }),
      ]);
      if (bkRes.status === 401 || ppRes.status === 401) {
        setError("Accès refusé : votre compte n'est pas administrateur.");
        return;
      }
      const [bk, pp, ap, br, rv] = await Promise.all([
        bkRes.ok ? bkRes.json() : [],
        ppRes.ok ? ppRes.json() : [],
        apRes.ok ? apRes.json() : [],
        brRes.ok ? brRes.json() : null,
        rvRes.ok ? rvRes.json() : { items: [] },
      ]);
      setBookings(bk);
      setPendingProviders(pp);
      setActiveProviders(ap);
      setBrevo(br);
      setReviews(Array.isArray(rv.items) ? rv.items : []);
    } catch (err) {
      console.error('admin dashboard load failed', err);
      setError('Impossible de charger le tableau de bord pour le moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

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

  const todayStr = new Date().toISOString().slice(0, 10);
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => (b.booking_status || 'pending') === 'pending').length,
    confirmed: bookings.filter((b) => b.booking_status === 'confirmed').length,
    completed: bookings.filter((b) => b.booking_status === 'completed').length,
    cancelled: bookings.filter((b) => b.booking_status === 'cancelled').length,
    today: bookings.filter((b) => b.date === todayStr).length,
    paid: bookings.filter((b) => b.payment_status === 'paid').length,
    emailSent: bookings.filter((b) => b.email_status === 'sent').length,
    emailFailed: bookings.filter((b) => b.email_status === 'failed').length,
  };
  const pendingCount = pendingProviders.filter(
    (p) => p.provider_request_status !== 'refused',
  ).length;
  const activeCount = activeProviders.filter((p) => p.active).length;

  const recent = [...bookings]
    .sort((a, b) => (b.created || '').localeCompare(a.created || ''))
    .slice(0, 5);

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[90rem] px-5 sm:px-8">
      <Helmet>
        <title>Tableau de bord — Administration GlowNyo</title>
        <meta
          name="description"
          content="Espace administrateur GlowNyo : vue d'ensemble des réservations, demandes prestataires et état des emails transactionnels."
        />
      </Helmet>

      <AdminNav
        onRefresh={load}
        refreshing={loading}
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité GlowNyo — réservations, prestataires et état des emails transactionnels."
      />

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="mt-12 flex items-center justify-center text-[#F5F0E6]/50">
          <Loader2 size={22} className="animate-spin text-gold" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={CalendarDays}
              label="Réservations"
              value={stats.total}
              hint={`${stats.today} aujourd'hui`}
            />
            <StatCard
              icon={Clock}
              label="En attente"
              value={stats.pending}
              hint="À confirmer par l'équipe"
              accent="bg-[#C9922A]/15"
            />
            <StatCard
              icon={CheckCircle2}
              label="Confirmées"
              value={stats.confirmed}
              hint={`${stats.completed} terminées · ${stats.cancelled} annulées`}
              accent="bg-emerald-500/10"
            />
            <StatCard
              icon={Users}
              label="Prestataires actifs"
              value={activeCount}
              hint={`${pendingCount} demande(s) en attente`}
            />
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {/* Recent bookings */}
            <div className="lg:col-span-2 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Dernières réservations</h2>
                <Link
                  to="/admin/reservations"
                  className="text-sm text-gold hover:brightness-110 transition"
                >
                  Tout voir →
                </Link>
              </div>
              <div className="mt-5 divide-y divide-[#C9922A]/10">
                {recent.length === 0 && (
                  <p className="py-8 text-center text-sm text-[#F5F0E6]/50">
                    Aucune réservation pour le moment.
                  </p>
                )}
                {recent.map((b) => {
                  const pm = PAYMENT_META[b.payment_status || 'pending'] || PAYMENT_META.pending;
                  const PIcon = pm.icon;
                  return (
                    <div key={b.id} className="py-3.5 flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {b.name} · {b.service || 'Prestation'}
                        </p>
                        <p className="text-xs text-[#F5F0E6]/50 truncate">
                          {b.provider || '—'} — {b.date || '—'} {b.time || ''}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${pm.className}`}>
                        <PIcon size={11} /> {pm.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brevo status + contact */}
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-gold" />
                  <h2 className="font-display text-lg font-semibold">Emails transactionnels</h2>
                </div>
                {brevo ? (
                  <>
                    <div className={`mt-4 flex items-center gap-2.5 rounded-2xl border px-4 py-3 ${brevo.configured ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-[#C9922A]/30 bg-[#C9922A]/10'}`}>
                      {brevo.configured ? (
                        <MailCheck size={18} className="text-emerald-400" />
                      ) : (
                        <MailX size={18} className="text-gold" />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${brevo.configured ? 'text-emerald-300' : 'text-gold'}`}>
                          {brevo.configured ? 'Brevo configuré' : 'Brevo non configuré'}
                        </p>
                        <p className="text-xs text-[#F5F0E6]/55">
                          Expéditeur : {brevo.sender?.name || '—'} &lt;{brevo.sender?.email || '—'}&gt;
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-[#0A0A0A] border border-[#C9922A]/10 px-3 py-2.5">
                        <p className="text-xs text-[#F5F0E6]/50">Emails envoyés</p>
                        <p className="mt-0.5 font-display text-lg text-emerald-300">{stats.emailSent}</p>
                      </div>
                      <div className="rounded-xl bg-[#0A0A0A] border border-[#C9922A]/10 px-3 py-2.5">
                        <p className="text-xs text-[#F5F0E6]/50">Échecs d'envoi</p>
                        <p className="mt-0.5 font-display text-lg text-red-400">{stats.emailFailed}</p>
                      </div>
                    </div>
                    {!brevo.configured && (
                      <p className="mt-3 text-xs text-[#F5F0E6]/50">
                        Ajoutez la clé <code className="text-gold">{brevo.envKey}</code> dans la configuration serveur pour activer l'envoi.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-sm text-[#F5F0E6]/50">État indisponible pour le moment.</p>
                )}
              </div>

              <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-gold" />
                  <h2 className="font-display text-lg font-semibold">Contact équipe</h2>
                </div>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex items-center gap-2 text-[#F5F0E6]/80 hover:text-gold transition"
                  >
                    <Mail size={15} className="text-gold" /> {EMAIL}
                  </a>
                  <a
                    href={teamWaLink('Bonjour, je me connecte depuis l\'espace administration GlowNyo.')}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[#25D366] hover:brightness-110 transition"
                  >
                    <MessageCircle size={15} /> WhatsApp équipe
                  </a>
                  <p className="text-xs text-[#F5F0E6]/45">
                    WhatsApp Business : +{TEAM_WHATSAPP}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-8 grid sm:grid-cols-3 gap-5">
            <Link
              to="/admin/reservations"
              className="group rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 hover:border-[#C9922A]/40 transition"
            >
              <div className="flex items-center gap-3">
                <TrendingUp size={20} className="text-gold" />
                <h3 className="font-display text-lg font-semibold">Gérer les réservations</h3>
              </div>
              <p className="mt-2 text-sm text-[#F5F0E6]/60">
                Filtrer par statut, date, client ou prestataire. Confirmer, annuler ou marquer comme terminée.
              </p>
            </Link>
            <Link
              to="/admin/prestataires"
              className="group rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 hover:border-[#C9922A]/40 transition"
            >
              <div className="flex items-center gap-3">
                <Users size={20} className="text-gold" />
                <h3 className="font-display text-lg font-semibold">Gérer les prestataires</h3>
              </div>
              <p className="mt-2 text-sm text-[#F5F0E6]/60">
                Valider ou refuser les demandes. Activer ou désactiver les comptes prestataires.
              </p>
            </Link>
            <Link
              to="/admin/avis"
              className="group rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 hover:border-[#C9922A]/40 transition"
            >
              <div className="flex items-center gap-3">
                <Star size={20} className="text-gold" />
                <h3 className="font-display text-lg font-semibold">Modérer les avis</h3>
              </div>
              <p className="mt-2 text-sm text-[#F5F0E6]/60">
                {reviews.length} avis vérifiés. Masquer, restaurer ou supprimer un avis sans en modifier le contenu.
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
