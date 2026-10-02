import { useState } from 'react';
import {
  Loader2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Play,
  CheckCircle2,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { SPECIALTIES } from '@/data/site';

const inputCls =
  'w-full rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-4 py-3 text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:outline-none focus:border-[#C9922A] transition [color-scheme:dark]';
const labelCls = 'text-xs uppercase tracking-wide text-[#F5F0E6]/50';

const fileUrl = (id, filename) => `${pb.baseUrl}/api/files/users/${id}/${filename}`;
const isVideoFilename = (name) => /\.(mp4|mov|webm)$/i.test(name || '');

const ProviderProfileEditor = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    specialty: user?.specialty || SPECIALTIES[0],
    tagline: user?.tagline || '',
    location: user?.location || '',
    phone: user?.phone || '',
    whatsapp_secondary: user?.whatsapp_secondary || '',
    instagram: user?.instagram || '',
    experience: user?.experience || '',
    availability: user?.availability || '',
    bio: user?.bio || '',
    starting_price_override: user?.starting_price_override || '',
    avatar_shape: user?.avatar_shape || 'rect',
  });
  const [services, setServices] = useState(
    Array.isArray(user?.services) && user.services.length > 0
      ? user.services
      : [{ name: '', price: '', duration: '' }],
  );
  const [galleryUrls, setGalleryUrls] = useState(
    Array.isArray(user?.gallery_urls) ? user.gallery_urls : [],
  );
  const [ownFiles, setOwnFiles] = useState(Array.isArray(user?.gallery) ? user.gallery : []);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? fileUrl(user.id, user.avatar) : user?.avatar_url || '',
  );

  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };

  const setServiceField = (index, key, value) => {
    setServices((list) => list.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
    setSaved(false);
  };

  const addService = () => {
    setServices((list) => [...list, { name: '', price: '', duration: '' }]);
  };

  const removeService = (index) => {
    setServices((list) => list.filter((_, i) => i !== index));
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSaving(true);
    try {
      const updated = await pb.collection('users').update(user.id, { avatar: file });
      pb.authStore.save(pb.authStore.token, updated);
      setAvatarPreview(fileUrl(updated.id, updated.avatar));
    } catch (err) {
      console.error('avatar upload failed', err);
      setError("Impossible d'enregistrer cette photo pour le moment.");
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const onAddGalleryFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError('');
    setUploadingGallery(true);
    try {
      const updated = await pb.collection('users').update(user.id, { 'gallery+': files });
      pb.authStore.save(pb.authStore.token, updated);
      setOwnFiles(Array.isArray(updated.gallery) ? updated.gallery : []);
    } catch (err) {
      console.error('gallery upload failed', err);
      setError("Impossible d'ajouter ces fichiers pour le moment (format ou taille non supportés ?).");
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const removeOwnFile = async (filename) => {
    setError('');
    try {
      const updated = await pb.collection('users').update(user.id, { 'gallery-': [filename] });
      pb.authStore.save(pb.authStore.token, updated);
      setOwnFiles(Array.isArray(updated.gallery) ? updated.gallery : []);
    } catch (err) {
      console.error('gallery remove failed', err);
      setError('Impossible de retirer cette photo pour le moment.');
    }
  };

  const removeLegacyGalleryItem = (index) => {
    setGalleryUrls((list) => list.filter((_, i) => i !== index));
    setSaved(false);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const cleanServices = services
        .map((s) => ({ name: (s.name || '').trim(), price: (s.price || '').trim(), duration: (s.duration || '').trim() }))
        .filter((s) => s.name);
      const updated = await pb.collection('users').update(user.id, {
        ...form,
        services: cleanServices,
        gallery_urls: galleryUrls,
      });
      pb.authStore.save(pb.authStore.token, updated);
      setSaved(true);
    } catch (err) {
      console.error('profile save failed', err);
      setError("Impossible d'enregistrer vos informations pour le moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="mt-8 flex flex-col gap-8">
      {/* Avatar */}
      <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Photo de profil</h2>
        <div className="mt-5 flex items-center gap-5">
          <div
            className={`w-24 h-24 overflow-hidden border border-[#C9922A]/25 bg-[#0A0A0A] shrink-0 ${
              form.avatar_shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            }`}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Photo de profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#F5F0E6]/30">
                <ImageIcon size={28} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <label className="inline-flex w-fit items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition cursor-pointer text-sm">
              Changer la photo
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-[#F5F0E6]/70">
              <input
                type="checkbox"
                checked={form.avatar_shape === 'circle'}
                onChange={(e) => {
                  setForm((f) => ({ ...f, avatar_shape: e.target.checked ? 'circle' : 'rect' }));
                  setSaved(false);
                }}
                className="accent-[#C9922A]"
              />
              Photo ronde (logo plutôt qu'un portrait)
            </label>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Informations</h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nom / Nom de l'activité</label>
            <input className={`${inputCls} mt-1.5`} value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className={labelCls}>Spécialité</label>
            <select className={`${inputCls} mt-1.5`} value={form.specialty} onChange={set('specialty')}>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Phrase d'accroche (courte)</label>
            <input
              className={`${inputCls} mt-1.5`}
              value={form.tagline}
              onChange={set('tagline')}
              placeholder="Ex : Locks & tresses protectrices"
            />
          </div>
          <div>
            <label className={labelCls}>Localisation</label>
            <input className={`${inputCls} mt-1.5`} value={form.location} onChange={set('location')} />
          </div>
          <div>
            <label className={labelCls}>Téléphone / WhatsApp</label>
            <input className={`${inputCls} mt-1.5`} value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp secondaire (optionnel)</label>
            <input className={`${inputCls} mt-1.5`} value={form.whatsapp_secondary} onChange={set('whatsapp_secondary')} />
          </div>
          <div>
            <label className={labelCls}>Lien Instagram</label>
            <input className={`${inputCls} mt-1.5`} value={form.instagram} onChange={set('instagram')} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className={labelCls}>Expérience</label>
            <input className={`${inputCls} mt-1.5`} value={form.experience} onChange={set('experience')} placeholder="Ex : 2 ans d'expérience" />
          </div>
          <div>
            <label className={labelCls}>Prix de départ affiché (optionnel)</label>
            <input
              className={`${inputCls} mt-1.5`}
              value={form.starting_price_override}
              onChange={set('starting_price_override')}
              placeholder="Laisser vide pour utiliser le prix le plus bas de vos prestations"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Disponibilités</label>
            <input className={`${inputCls} mt-1.5`} value={form.availability} onChange={set('availability')} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Présentation</label>
            <textarea rows={4} className={`${inputCls} mt-1.5`} value={form.bio} onChange={set('bio')} />
          </div>
        </div>
      </div>

      {/* Services / prices */}
      <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Prestations & tarifs</h2>
        <div className="mt-5 flex flex-col gap-3">
          {services.map((s, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_140px_120px_auto] gap-2.5 items-center">
              <input
                className={inputCls}
                placeholder="Prestation (ex : Pose de locks)"
                value={s.name}
                onChange={(e) => setServiceField(i, 'name', e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Prix (ex : 20 000 FCFA)"
                value={s.price}
                onChange={(e) => setServiceField(i, 'price', e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Durée (ex : 1h30)"
                value={s.duration}
                onChange={(e) => setServiceField(i, 'duration', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeService(i)}
                className="p-2.5 rounded-xl border border-[#C9922A]/20 text-[#F5F0E6]/60 hover:text-red-400 hover:border-red-400/40 transition"
                aria-label="Retirer cette prestation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="mt-1 inline-flex w-fit items-center gap-2 text-sm text-gold hover:brightness-110 transition"
          >
            <Plus size={16} /> Ajouter une prestation
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Réalisations</h2>
        <p className="mt-1.5 text-sm text-[#F5F0E6]/60">
          Photos et vidéos (MP4) affichées sur votre fiche publique.
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {galleryUrls.map((g, i) => {
            const isVideo = typeof g === 'object' && g.type === 'video';
            const src = isVideo ? g.src : g;
            return (
              <div key={`legacy-${i}`} className="relative rounded-2xl overflow-hidden border border-[#C9922A]/15 aspect-square">
                {isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A]">
                    <Play size={24} className="text-[#F5F0E6]/50" />
                  </div>
                ) : (
                  <img src={src} alt="Réalisation" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeLegacyGalleryItem(i)}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-red-500/80 transition"
                  aria-label="Retirer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          {ownFiles.map((filename) => (
            <div key={filename} className="relative rounded-2xl overflow-hidden border border-[#C9922A]/15 aspect-square">
              {isVideoFilename(filename) ? (
                <video src={fileUrl(user.id, filename)} muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={fileUrl(user.id, filename)} alt="Réalisation" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeOwnFile(filename)}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-red-500/80 transition"
                aria-label="Retirer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-2xl border border-dashed border-[#C9922A]/30 flex flex-col items-center justify-center gap-2 text-[#F5F0E6]/60 hover:border-[#C9922A]/60 hover:text-gold transition cursor-pointer text-sm text-center px-2">
            {uploadingGallery ? (
              <Loader2 size={20} className="animate-spin text-gold" />
            ) : (
              <>
                <Plus size={20} />
                Ajouter
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
              multiple
              className="hidden"
              disabled={uploadingGallery}
              onChange={onAddGalleryFiles}
            />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition disabled:opacity-60"
        >
          {saving ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
          Enregistrer
        </button>
        {saved && !saving && (
          <span className="text-sm text-[#F5F0E6]/60">Enregistré ✓</span>
        )}
      </div>
    </form>
  );
};

export default ProviderProfileEditor;
