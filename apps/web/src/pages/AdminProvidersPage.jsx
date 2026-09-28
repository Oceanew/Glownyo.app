import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Check,
  XCircle,
  Loader2,
  Clock,
  Power,
  PowerOff,
  Mail,
  MessageCircle,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { waLinkTo } from '@/data/site';

const AdminProvidersPage = () => {
  const { isAdmin } = useAuth();
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const authHeaders = () => ({
    Authorization: pb.authStore.token || '',
    'Content-Type': 'application/json',
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, aRes] = await Promise.all([
        apiServerClient.fetch('/providers/pending', { headers: authHeaders() }),
        apiServerClient.fetch('/providers/active', { headers: authHeaders() }),
      ]);
      if (pRes.status === 401) {
        setError("Accès refusé : votre compte n'est pas administrateur.");
        return;
      }
      const [pData, aData] = await Promise.all([
        pRes.ok ? pRes.json() : [],
        aRes.ok ? aRes.json() : [],
      ]);
      setPending(pData);
      setActive(aData);
    } catch (err) {
      console.error('failed to load providers', err);
      setError('Impossible de charger les demandes pour le moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);

  const validate = async (id) => {
    setActingId(id);
    setError('');
    setActionMsg(null);
    try {
      const res = await apiServerClient.fetch('/providers/validate', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('validate_failed');
      const data = await res.json().catch(() => ({}));
      setPending((prev) => prev.filter((p) => p.id !== id));
      if (data.email_sent === true) {
        setActionMsg({ type: 'success', text: "Demande validée. L'email d'activation a été envoyé au prestataire." });
      } else {
        setActionMsg({ type: 'warn', text: "Demande validée, mais l'email d'activation n'a pas pu être envoyé pour l'instant (service d'email indisponible). Le prestataire peut demander un nouveau lien de connexion." });
      }
      loadAll();
    } catch (err) {
      console.error('validate failed', err);
      setError('Impossible de valider cette demande.');
    } finally {
      setActingId(null);
    }
  };

  const refuse = async (id) => {
    const p = pending.find((x) => x.id === id);
    const isExistingClient = p && p.role !== 'provider';
    const msg = isExistingClient
      ? 'Refuser cette demande ? Le compte client existant sera conservé et restera fonctionnel ; seule la demande prestataire sera refusée.'
      : 'Refuser cette demande ? Le compte restera inaccessible en tant que prestataire et la demande affichera le statut « Refusée ».';
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
      setPending((prev) =>
        prev.map((x) => (x.id === id ? { ...x, provider_request_status: 'refused' } : x)),
      );
    } catch (err) {
      console.error('refuse failed', err);
      setError('Impossible de refuser cette demande.');
    } finally {
      setActingId(null);
    }
  };

  const toggleActive = async (id, nextActive) => {
    const verb = nextActive ? 'activer' : 'désactiver';
    if (!window.confirm(`Voulez-vous vraiment ${verb} ce compte prestataire ?`)) return;
    setActingId(id);
    setActionMsg(null);
    try {
      const res = await apiServerClient.fetch('/providers/toggle-active', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id, active: nextActive }),
      });
      if (!res.ok) throw new Error('toggle_failed');
      setActive((prev) => prev.map((p) => (p.id === id ? { ...p, active: nextActive } : p)));
      setActionMsg({
        type: nextActive ? 'success' : 'warn',
        text: nextActive
          ? 'Compte prestataire activé : la fiche est de nouveau publique.'
          : 'Compte prestataire désactivé : la fiche n\'apparaît plus publiquement.',
      });
    } catch (err) {
      console.error('toggle active failed', err);
      setActionMsg({ type: 'error', text: "L'action a échoué. Réessayez dans un instant." });
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
        <p className="text-[#F5F0E6]/70">Cet espace est réservé aux administrateurs GlowNyo.</p>
        <Link to="/connexion" className="mt-5 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition">
          Se connecter
        </Link>
      </div>
    );
  }

  const pendingOpen = pending.filter((p) => p.provider_request_status !== 'refused');

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[90rem] px-5 sm:px-8">
      <Helmet>
        <title>Prestataires — Administration GlowNyo</title>
        <meta name="description" content="Validez ou refusez les demandes prestataires GlowNyo et activez ou désactivez les comptes prestataires." />
      </Helmet>

      <AdminNav onRefresh={loadAll} refreshing={loading} title="Prestataires" />

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

      {/* Pending requests */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-semibold">Demandes prestataires</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9922A]/30 bg-[#C9922A]/10 text-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Clock size={12} /> {pendingOpen.length} en attente
          </span>
        </div>

        {pending.length === 0 && !loading && (
          <div className="mt-6 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-12 text-center">
            <p className="text-[#F5F0E6]/50">Aucune demande pour le moment.</p>
          </div>
        )}

        <div className="mt-6 grid gap-5">
          {pending.map((p) => {
            const refused = p.provider_request_status === 'refused';
            return (
              <div key={p.id} className={`rounded-3xl border bg-[#0F0F0F] p-6 ${refused ? 'border-red-500/20 opacity-80' : 'border-[#C9922A]/15'}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display text-xl font-semibold">{p.name || '—'}</h3>
                      {refused ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          <XCircle size={12} /> Refusée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9922A]/30 bg-[#C9922A]/10 text-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          <Clock size={12} /> En attente
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5F0E6]/15 bg-[#F5F0E6]/5 text-[#F5F0E6]/70 px-3 py-1 text-xs font-medium">
                        {p.role === 'provider' ? 'Nouveau compte' : 'Compte client existant'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#F5F0E6]/60">{p.email} · {p.phone || '—'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => validate(p.id)}
                      disabled={actingId === p.id}
                      className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition disabled:opacity-60"
                    >
                      {actingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
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
                  <div><span className="text-gold font-medium">Spécialité : </span><span className="text-[#F5F0E6]/80">{p.specialty || '—'}</span></div>
                  <div><span className="text-gold font-medium">Localisation : </span><span className="text-[#F5F0E6]/80">{p.location || '—'}</span></div>
                  {p.instagram && (
                    <div className="sm:col-span-2">
                      <span className="text-gold font-medium">Instagram : </span>
                      <a href={p.instagram} target="_blank" rel="noreferrer" className="text-[#F5F0E6]/80 underline hover:text-gold">{p.instagram}</a>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="text-gold font-medium">Services proposés :</span>
                    <p className="mt-1 text-[#F5F0E6]/75 whitespace-pre-wrap">{p.services || '—'}</p>
                  </div>
                  {p.bio && (
                    <div className="sm:col-span-2">
                      <span className="text-gold font-medium">Présentation :</span>
                      <p className="mt-1 text-[#F5F0E6]/75 whitespace-pre-wrap">{p.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active providers management */}
      <section className="mt-12">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-semibold">Comptes prestataires</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {active.filter((p) => p.active).length} actifs
          </span>
        </div>
        <p className="mt-2 text-sm text-[#F5F0E6]/55">
          Activez ou désactivez un compte : un compte prestataire désactivé disparaît du site public et perd l'accès à son espace, sans suppression de compte.
        </p>

        {active.length === 0 && !loading && (
          <div className="mt-6 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-12 text-center">
            <p className="text-[#F5F0E6]/50">Aucun compte prestataire validé pour le moment.</p>
          </div>
        )}

        <div className="mt-6 grid sm:grid-cols-2 gap-5">
          {active.map((p) => (
            <div key={p.id} className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold truncate">{p.name || '—'}</h3>
                  <p className="text-xs text-[#F5F0E6]/50 truncate">{p.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      p.active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-[#F5F0E6]/15 bg-[#F5F0E6]/5 text-[#F5F0E6]/55'
                    }`}>
                      {p.active ? <><Power size={11} /> Actif</> : <><PowerOff size={11} /> Désactivé</>}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5F0E6]/15 bg-[#F5F0E6]/5 text-[#F5F0E6]/60 px-2.5 py-1 text-[11px] font-medium">
                      {p.accountType === 'standalone' ? 'Compte prestataire' : 'Compte client + prestataire'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(p.id, !p.active)}
                  disabled={actingId === p.id}
                  className={`inline-flex items-center gap-1.5 font-semibold px-4 py-2 rounded-full text-sm transition disabled:opacity-60 ${
                    p.active
                      ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                      : 'gold-gradient text-[#0A0A0A] hover:brightness-110'
                  }`}
                >
                  {actingId === p.id ? <Loader2 size={14} className="animate-spin" /> : p.active ? <PowerOff size={14} /> : <Power size={14} />}
                  {p.active ? 'Désactiver' : 'Activer'}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                <p className="text-[#F5F0E6]/70"><span className="text-gold">Spécialité :</span> {p.specialty || '—'}</p>
                <p className="text-[#F5F0E6]/70"><span className="text-gold">Localisation :</span> {p.location || '—'}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-[#C9922A]/10">
                {p.phone && (
                  <a
                    href={waLinkTo(p.phone, `Bonjour ${p.name}, je vous contacte depuis l'espace administration GlowNyo.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:brightness-110 transition"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
                {p.email && (
                  <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 text-sm text-[#F5F0E6]/70 hover:text-gold transition">
                    <Mail size={14} /> Email
                  </a>
                )}
                {p.instagram && (
                  <a href={p.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#F5F0E6]/70 hover:text-gold transition">
                    Instagram
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminProvidersPage;
