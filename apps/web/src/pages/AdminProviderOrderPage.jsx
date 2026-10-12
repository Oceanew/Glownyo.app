import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, CheckCircle2, ChevronUp, ChevronDown, Users } from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';

const authHeaders = () => ({
  Authorization: pb.authStore.token || '',
  'Content-Type': 'application/json',
});

const fileUrl = (id, filename) => `${pb.baseUrl}/api/files/users/${id}/${filename}`;

const PLACEHOLDER_IMAGE =
  'https://images.hostinger.com/f0b21b20-700b-4420-9f39-92134a1c6db5.png';

const avatarOf = (p) => (p.avatar ? fileUrl(p.id, p.avatar) : p.avatar_url || PLACEHOLDER_IMAGE);

const AdminProviderOrderPage = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const res = await apiServerClient.fetch('/providers/order', { headers: authHeaders() });
      if (res.status === 401) {
        setError("Accès refusé : votre compte n'est pas administrateur.");
        return;
      }
      if (!res.ok) throw new Error('load_failed');
      setItems(await res.json());
    } catch (err) {
      console.error('failed to load provider order', err);
      setError('Impossible de charger la liste des prestataires pour le moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setSaved(false);
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const onSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await apiServerClient.fetch('/providers/order', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ order: items.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error('save_failed');
      setSaved(true);
    } catch (err) {
      console.error('failed to save provider order', err);
      setError("Impossible d'enregistrer cet ordre pour le moment.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 mx-auto max-w-md px-5 sm:px-8 text-center">
        <Helmet>
          <title>Ordre des prestataires — Administration GlowNyo</title>
        </Helmet>
        <p className="text-[#F5F0E6]/70">Cet espace est réservé aux administrateurs GlowNyo.</p>
        <Link to="/connexion" className="mt-5 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[56rem] px-5 sm:px-8">
      <Helmet>
        <title>Ordre des prestataires — Administration GlowNyo</title>
      </Helmet>

      <AdminNav
        onRefresh={load}
        refreshing={loading}
        title="Ordre des prestataires"
        subtitle="Choisissez l'ordre d'affichage des prestataires sur le site public et la page d'accueil, avec les flèches. Un nouveau prestataire inscrit apparaît automatiquement en fin de liste."
      />

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-sm text-[#F5F0E6]/50">
          <Loader2 size={16} className="animate-spin" /> Chargement…
        </div>
      )}

      {!loading && error && <p className="mt-8 text-sm text-red-400">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-12 text-center">
          <Users size={28} className="mx-auto text-gold/60" />
          <p className="mt-3 text-[#F5F0E6]/50">Aucun prestataire publié pour le moment.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] divide-y divide-white/5">
            {items.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-4 sm:p-5">
                <span className="w-6 text-center text-sm text-[#F5F0E6]/40 shrink-0">{i + 1}</span>
                <img
                  src={avatarOf(p)}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover border border-[#C9922A]/20 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-[#F5F0E6]/50 truncate">{p.specialty}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Monter"
                    className="p-2.5 rounded-full border border-[#C9922A]/25 text-[#F5F0E6]/70 hover:text-gold hover:bg-[#C9922A]/10 transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="Descendre"
                    className="p-2.5 rounded-full border border-[#C9922A]/25 text-[#F5F0E6]/70 hover:text-gold hover:bg-[#C9922A]/10 transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
              Enregistrer
            </button>
            {saved && <span className="text-sm text-emerald-300">Ordre enregistré.</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProviderOrderPage;
