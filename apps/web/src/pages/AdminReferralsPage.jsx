import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, Heart, Clock, Check, XCircle } from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';

const authHeaders = () => ({
  Authorization: pb.authStore.token || '',
  'Content-Type': 'application/json',
});

const STATUS = {
  validated: { label: 'Validé', icon: Check, cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  pending: { label: 'En attente', icon: Clock, cls: 'border-[#C9922A]/30 bg-[#C9922A]/10 text-gold' },
  refused: { label: 'Refusé', icon: XCircle, cls: 'border-red-500/40 bg-red-500/10 text-red-400' },
  none: { label: 'En attente', icon: Clock, cls: 'border-[#C9922A]/30 bg-[#C9922A]/10 text-gold' },
};

const AdminReferralsPage = () => {
  const { isAdmin } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiServerClient.fetch('/providers/referrals', { headers: authHeaders() });
      if (res.status === 401) {
        setError("Accès refusé : votre compte n'est pas administrateur.");
        return;
      }
      if (!res.ok) throw new Error('load_failed');
      setReferrals(await res.json());
    } catch (err) {
      console.error('failed to load referrals', err);
      setError('Impossible de charger les parrainages pour le moment.');
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
          <title>Parrainages — Administration GlowNyo</title>
        </Helmet>
        <p className="text-[#F5F0E6]/70">Cet espace est réservé aux administrateurs GlowNyo.</p>
        <Link to="/connexion" className="mt-5 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[72rem] px-5 sm:px-8">
      <Helmet>
        <title>Parrainages — Administration GlowNyo</title>
      </Helmet>

      <AdminNav
        onRefresh={load}
        refreshing={loading}
        title="Parrainages"
        subtitle="Pour chaque personne citée en réponse à « Qui vous a parlé de Glownyo ? », la liste des prestataires qu'elle a fait venir. Visible uniquement par l'administrateur."
      />

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-sm text-[#F5F0E6]/50">
          <Loader2 size={16} className="animate-spin" /> Chargement…
        </div>
      )}

      {!loading && error && <p className="mt-8 text-sm text-red-400">{error}</p>}

      {!loading && !error && referrals.length === 0 && (
        <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-12 text-center">
          <Heart size={28} className="mx-auto text-gold/60" />
          <p className="mt-3 text-[#F5F0E6]/50">Aucun parrainage renseigné pour le moment.</p>
        </div>
      )}

      {!loading && !error && referrals.length > 0 && (
        <div className="mt-8 grid gap-5">
          {referrals.map((r) => (
            <div key={r.parrain} className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
              <div className="flex items-center gap-2.5">
                <Heart size={16} className="text-gold" />
                <h3 className="font-display text-lg font-semibold">{r.parrain}</h3>
                <span className="text-xs text-[#F5F0E6]/45">
                  {r.prestataires.length} prestataire{r.prestataires.length > 1 ? 's' : ''} amené{r.prestataires.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {r.prestataires.map((p) => {
                  const status = STATUS[p.provider_request_status] || STATUS.none;
                  const StatusIcon = status.icon;
                  return (
                    <span
                      key={p.id}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${status.cls}`}
                    >
                      <StatusIcon size={12} /> {p.name || '—'}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReferralsPage;
