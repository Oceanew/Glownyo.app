import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Newspaper,
  CheckCircle2,
  X,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';

const fileUrl = (id, filename) => `${pb.baseUrl}/api/files/actualites/${id}/${filename}`;

const inputCls =
  'w-full rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-4 py-3 text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:outline-none focus:border-[#C9922A] transition [color-scheme:dark]';
const labelCls = 'text-xs uppercase tracking-wide text-[#F5F0E6]/50';

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

// Local YYYY-MM-DD for a date <input>, from either an ISO string or nothing
// (defaults to today — the common case when writing a new article now).
const toDateInputValue = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
};

const NewsForm = ({ record, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    titre: record?.titre || '',
    texte: record?.texte || '',
    date_publication: toDateInputValue(record?.date_publication),
    statut: record?.statut || 'brouillon',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    record?.image ? fileUrl(record.id, record.image) : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (imageFile) payload.image = imageFile;
      const saved = record
        ? await pb.collection('actualites').update(record.id, payload)
        : await pb.collection('actualites').create(payload);
      onSaved(saved);
    } catch (err) {
      console.error('news save failed', err);
      setError("Impossible d'enregistrer cette actualité pour le moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">
          {record ? "Modifier l'actualité" : 'Nouvelle actualité'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full text-[#F5F0E6]/50 hover:text-gold hover:bg-[#C9922A]/10 transition"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <label className={labelCls}>Titre</label>
        <input required className={`${inputCls} mt-1.5`} value={form.titre} onChange={set('titre')} />
      </div>

      <div>
        <label className={labelCls}>Texte</label>
        <textarea
          required
          rows={6}
          className={`${inputCls} mt-1.5`}
          value={form.texte}
          onChange={set('texte')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date de publication</label>
          <input
            required
            type="date"
            className={`${inputCls} mt-1.5`}
            value={form.date_publication}
            onChange={set('date_publication')}
          />
        </div>
        <div>
          <label className={labelCls}>Statut</label>
          <select className={`${inputCls} mt-1.5`} value={form.statut} onChange={set('statut')}>
            <option value="brouillon">Brouillon (non visible)</option>
            <option value="publie">Publié (visible sur le site)</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Image (facultative)</label>
        <div className="mt-1.5 flex items-center gap-4">
          {imagePreview ? (
            <img src={imagePreview} alt="" className="h-20 w-32 rounded-xl object-cover border border-[#C9922A]/20" />
          ) : (
            <div className="h-20 w-32 rounded-xl border border-dashed border-[#C9922A]/25 flex items-center justify-center text-[#F5F0E6]/30">
              <Newspaper size={20} />
            </div>
          )}
          <label className="inline-flex items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition cursor-pointer text-sm">
            Choisir une image
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onImageChange} />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition disabled:opacity-60"
        >
          {saving ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-[#F5F0E6]/60 hover:text-gold transition"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

const AdminNewsPage = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = hidden, {} = new, record = editing
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await pb.collection('actualites').getList(1, 200, { sort: '-date_publication' });
      setItems(res.items);
    } catch (err) {
      console.error('failed to load news', err);
      setError('Impossible de charger les actualités pour le moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const onSaved = () => {
    setEditing(null);
    load();
  };

  const togglePublish = async (item) => {
    setActingId(item.id);
    try {
      const nextStatut = item.statut === 'publie' ? 'brouillon' : 'publie';
      await pb.collection('actualites').update(item.id, { statut: nextStatut });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, statut: nextStatut } : i)));
    } catch (err) {
      console.error('toggle publish failed', err);
    } finally {
      setActingId(null);
    }
  };

  const onDelete = async (item) => {
    if (!window.confirm(`Supprimer définitivement « ${item.titre} » ? Cette action est irréversible.`)) return;
    setActingId(item.id);
    try {
      await pb.collection('actualites').delete(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('delete failed', err);
    } finally {
      setActingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 mx-auto max-w-md px-5 sm:px-8 text-center">
        <Helmet>
          <title>Actualités — Administration GlowNyo</title>
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
        <title>Actualités — Administration GlowNyo</title>
      </Helmet>

      <AdminNav
        onRefresh={load}
        refreshing={loading}
        title="Actualités"
        subtitle="Créez, modifiez, publiez ou dépubliez les actualités affichées sur le site. Une actualité en brouillon n'est jamais visible par les visiteurs."
      />

      <div className="mt-8 flex justify-end">
        {!editing && (
          <button
            onClick={() => setEditing({})}
            className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition"
          >
            <Plus size={17} /> Nouvelle actualité
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-6">
          <NewsForm
            record={editing.id ? editing : null}
            onSaved={onSaved}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-sm text-[#F5F0E6]/50">
          <Loader2 size={16} className="animate-spin" /> Chargement…
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-12 text-center">
          <Newspaper size={28} className="mx-auto text-gold/60" />
          <p className="mt-3 text-[#F5F0E6]/50">Aucune actualité pour le moment.</p>
        </div>
      )}

      <div className="mt-8 grid gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-3xl border bg-[#0F0F0F] p-6 flex items-start gap-5 ${
              item.statut === 'publie' ? 'border-[#C9922A]/15' : 'border-[#F5F0E6]/10 opacity-80'
            }`}
          >
            {item.image ? (
              <img
                src={fileUrl(item.id, item.image)}
                alt=""
                className="h-16 w-24 rounded-xl object-cover border border-[#C9922A]/15 shrink-0"
              />
            ) : (
              <div className="h-16 w-24 rounded-xl border border-dashed border-[#C9922A]/20 flex items-center justify-center text-[#F5F0E6]/25 shrink-0">
                <Newspaper size={18} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-display text-lg font-semibold truncate">{item.titre}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    item.statut === 'publie'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-[#F5F0E6]/20 bg-[#F5F0E6]/5 text-[#F5F0E6]/55'
                  }`}
                >
                  {item.statut === 'publie' ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#F5F0E6]/45">{formatDate(item.date_publication)}</p>
              <p className="mt-2 text-sm text-[#F5F0E6]/65 line-clamp-2">{item.texte}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => togglePublish(item)}
                disabled={actingId === item.id}
                className={`inline-flex items-center gap-1.5 border px-3.5 py-2 rounded-full text-xs font-semibold transition disabled:opacity-60 ${
                  item.statut === 'publie'
                    ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                    : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                {actingId === item.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : item.statut === 'publie' ? (
                  <EyeOff size={13} />
                ) : (
                  <Eye size={13} />
                )}
                {item.statut === 'publie' ? 'Dépublier' : 'Publier'}
              </button>
              <button
                onClick={() => setEditing(item)}
                className="p-2.5 rounded-full border border-[#C9922A]/25 text-[#F5F0E6]/70 hover:text-gold hover:bg-[#C9922A]/10 transition"
                aria-label="Modifier"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(item)}
                disabled={actingId === item.id}
                className="p-2.5 rounded-full border border-[#C9922A]/25 text-[#F5F0E6]/70 hover:text-red-400 hover:border-red-400/40 transition disabled:opacity-60"
                aria-label="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminNewsPage;
