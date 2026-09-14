import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Check,
  XCircle,
  RefreshCw,
  Clock,
  Loader2,
  Calendar,
} from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';

const AdminProvidersPage = () => {
  const { isAdmin } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const authHeaders = () => ({
    Authorization: pb.authStore.token || '',
    'Content-Type': 'application/json',
  });

  const loadProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiServerClient.fetch('/providers/pending', {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        setError("Accès refusé : votre compte n'est pas administrateur.");
        return;
      }
      if (!res.ok) throw new Error('load_failed');
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      console.error('failed to load providers', err);
      setError('Impossible de charger les demandes pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const validate = async (id) => {
    setActingId(id);
    setError('');
    try {
      const res = await apiServerClient.fetch('/providers/validate', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('validate_failed');
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('validate failed', err);
      setError("Impossible de valider cette demande.");
    } finally {
      setActingId(null);
    }
  };

  const refuse = async (id) => {
    const p = providers.find((x) => x.id === id);
    const isExistingClient = p && p.role !== 'provider';
    const msg = isExistingClient
      ? "Refuser cette demande ? Le compte client existant sera conservé et restera fonctionnel ; seule la demande prestataire sera refusée."
      : "Refuser cette demande ? Le compte restera inaccessible en tant que prestataire et la demande affichera le statut « Refusée ».";
    if (!window.confirm(msg)) return;
    setActingId(id);
    setError('');
    try {
      const res = await apiServerClient.fetch('/providers/refuse', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('refuse_failed');
      // Keep the request visible with the « Refusée » status instead of
      // removing it from the list.
      setProviders((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, provider_request_status: 'refused' } : x,
        ),
      );
    } catch (err) {
      console.error('refuse failed', err);
      setError("Impossible de refuser cette demande.");
    } finally {
      setActingId(null);
    }
  };

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
        <title>Demandes prestataires — Administration GlowNyo</title>
      </Helmet>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs tracking-widest uppercase text-gold">
            Administration
          </span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold leading-tight">
            Demandes prestataires
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/reservations"
            className="inline-flex items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6]/80 px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition text-sm"
          >
            <Calendar size={16} /> Réservations
          </Link>
          <button
            onClick={() => loadProviders()}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {providers.length === 0 && !loading && (
        <div className="mt-10 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-12 text-center">
          <p className="text-[#F5F0E6]/50">Aucune demande en attente de validation.</p>
        </div>
      )}

      <div className="mt-8 grid gap-5">
        {providers.map((p) => {
          const refused = p.provider_request_status === 'refused';
          return (
          <div
            key={p.id}
            className={`rounded-3xl border bg-[#0F0F0F] p-6 ${refused ? 'border-red-500/20 opacity-80' : 'border-[#C9922A]/15'}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-display text-xl font-semibold">
                    {p.name || '—'}
                  </h2>
                  {refused ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      <XCircle size={12} /> Refusée
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9922A]/30 bg-[#C9922A]/10 text-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      <Clock size={12} /> En attente
                    </span>
                  )}
                  {p.role === 'provider' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5F0E6]/15 bg-[#F5F0E6]/5 text-[#F5F0E6]/70 px-3 py-1 text-xs font-medium">
                      Nouveau compte
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5F0E6]/15 bg-[#F5F0E6]/5 text-[#F5F0E6]/70 px-3 py-1 text-xs font-medium">
                      Compte client existant
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#F5F0E6]/60">
                  {p.email} · {p.phone || '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => validate(p.id)}
                  disabled={actingId === p.id}
                  className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition disabled:opacity-60"
                >
                  {actingId === p.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Valider
                </button>
                {!refused && (
                  <button
                    onClick={() => refuse(p.id)}
                    disabled={actingId === p.id}
                    className="inline-flex items-center gap-2 border border-red-500/40 text-red-400 font-semibold px-5 py-2.5 rounded-full hover:bg-red-500/10 transition disabled:opacity-60"
                  >
                    <XCircle size={16} /> Refuser
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-gold font-medium">Spécialité : </span>
                <span className="text-[#F5F0E6]/80">{p.specialty || '—'}</span>
              </div>
              <div>
                <span className="text-gold font-medium">Localisation : </span>
                <span className="text-[#F5F0E6]/80">{p.location || '—'}</span>
              </div>
              {p.instagram && (
                <div className="sm:col-span-2">
                  <span className="text-gold font-medium">Instagram : </span>
                  <a
                    href={p.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#F5F0E6]/80 underline hover:text-gold"
                  >
                    {p.instagram}
                  </a>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="text-gold font-medium">Services proposés :</span>
                <p className="mt-1 text-[#F5F0E6]/75 whitespace-pre-wrap">
                  {p.services || '—'}
                </p>
              </div>
              {p.bio && (
                <div className="sm:col-span-2">
                  <span className="text-gold font-medium">Présentation :</span>
                  <p className="mt-1 text-[#F5F0E6]/75 whitespace-pre-wrap">
                    {p.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminProvidersPage;
