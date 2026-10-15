import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, CheckCircle2, FileText } from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { invalidateSiteTextsCache } from '@/lib/useSiteTexts';

const PAGES = [
  { value: 'accueil', label: 'Accueil' },
  { value: 'reservation', label: 'Réservation' },
  { value: 'a-propos', label: 'À propos' },
  { value: 'faq', label: 'FAQ' },
  { value: 'contact', label: 'Contact' },
  { value: 'pied-de-page', label: 'Pied de page' },
  { value: 'global', label: 'Boutons principaux' },
];

const inputCls =
  'w-full rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-4 py-3 text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:outline-none focus:border-[#C9922A] transition [color-scheme:dark]';

const AdminSiteTextsPage = () => {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState('accueil');
  const [items, setItems] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async (p) => {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const res = await pb.collection('textes_site').getFullList({
        filter: `page = "${p}"`,
        sort: 'cle',
      });
      setItems(res);
      setValues(Object.fromEntries(res.map((r) => [r.id, r.valeur])));
    } catch (err) {
      console.error('failed to load site texts', err);
      setError('Impossible de charger ces textes pour le moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load(page);
  }, [isAdmin, page, load]);

  const onChange = (id) => (e) => {
    setSaved(false);
    setValues((v) => ({ ...v, [id]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const changed = items.filter((item) => values[item.id] !== item.valeur);
      await Promise.all(
        changed.map((item) => pb.collection('textes_site').update(item.id, { valeur: values[item.id] })),
      );
      invalidateSiteTextsCache();
      setItems((prev) => prev.map((item) => ({ ...item, valeur: values[item.id] })));
      setSaved(true);
    } catch (err) {
      console.error('failed to save site texts', err);
      setError("Impossible d'enregistrer ces textes pour le moment.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 mx-auto max-w-md px-5 sm:px-8 text-center">
        <Helmet>
          <title>Textes du site — Administration GlowNyo</title>
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
        <title>Textes du site — Administration GlowNyo</title>
      </Helmet>

      <AdminNav
        title="Textes du site"
        subtitle="Modifiez les textes affichés sur les pages publiques du site. Choisissez une page, modifiez les textes, puis enregistrez : les changements apparaissent immédiatement sur le site."
      />

      <div className="mt-8 flex flex-wrap gap-2.5">
        {PAGES.map((p) => (
          <button
            key={p.value}
            onClick={() => setPage(p.value)}
            className={`inline-flex items-center gap-2 border px-4 py-2.5 rounded-full transition text-sm ${
              page === p.value
                ? 'border-[#C9922A] text-gold bg-[#C9922A]/10'
                : 'border-[#C9922A]/30 text-[#F5F0E6]/80 hover:bg-[#C9922A]/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-sm text-[#F5F0E6]/50">
          <Loader2 size={16} className="animate-spin" /> Chargement…
        </div>
      )}

      {!loading && error && <p className="mt-8 text-sm text-red-400">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-12 text-center">
          <FileText size={28} className="mx-auto text-gold/60" />
          <p className="mt-3 text-[#F5F0E6]/50">Aucun texte pour cette page.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <form onSubmit={onSubmit} className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8 flex flex-col gap-6">
          {items.map((item) => (
            <div key={item.id}>
              <label className="text-xs uppercase tracking-wide text-[#F5F0E6]/50">{item.nom}</label>
              <textarea
                required
                rows={item.valeur.length > 150 ? 4 : item.valeur.length > 60 ? 2 : 1}
                className={`${inputCls} mt-1.5`}
                value={values[item.id] ?? ''}
                onChange={onChange(item.id)}
              />
            </div>
          ))}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
              Enregistrer
            </button>
            {saved && <span className="text-sm text-emerald-300">Textes enregistrés.</span>}
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSiteTextsPage;
