import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Sparkles, ArrowRight, Loader2, CheckCircle2, Clock, MessageCircle, CalendarClock } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import { SPECIALTIES, CALENDLY_URL, teamWaLink } from '@/data/site';

const inputCls =
  'w-full rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-4 py-3 text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:outline-none focus:border-[#C9922A] transition [color-scheme:dark]';

const ProviderSignupPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: SPECIALTIES[0],
    services: '',
    location: '',
    instagram: '',
    bio: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [done, setDone] = useState(false);
  const [doneMode, setDoneMode] = useState('created');

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  // Client-side validation in French. Returns an object of field -> message
  // for the first failing field, or {} when everything is valid.
  const validate = () => {
    const errs = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) errs.name = 'Le nom ou le nom de l\'activité est obligatoire.';
    if (!form.email.trim()) errs.email = 'L\'adresse email est obligatoire.';
    else if (!emailRe.test(form.email.trim())) errs.email = 'L\'adresse email n\'est pas valide.';
    if (!form.phone.trim()) errs.phone = 'Le numéro de téléphone ou WhatsApp est obligatoire.';
    if (!form.specialty) errs.specialty = 'La spécialité est obligatoire.';
    if (!form.services.trim()) errs.services = 'Veuillez décrire au moins un service proposé.';

    // Instagram is optional, but if filled it must look like a URL.
    if (form.instagram.trim()) {
      try {
        new URL(form.instagram.trim());
      } catch {
        errs.instagram = 'Le lien Instagram n\'est pas valide (commencez par https://).';
      }
    }

    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Surface a short summary in French as well.
      setError('Veuillez corriger les champs en rouge avant d\'envoyer votre demande.');
      return;
    }

    setBusy(true);
    try {
      const res = await apiServerClient.fetch('/providers/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          specialty: form.specialty,
          services: form.services.trim(),
          location: form.location.trim(),
          instagram: form.instagram.trim(),
          bio: form.bio.trim(),
        }),
      });
      if (!res.ok) throw new Error('request_failed');
      const data = await res.json();
      setDoneMode(data.mode || 'created');
      setDone(true);
    } catch {
      setError(
        "Impossible d'envoyer votre demande pour le moment. Veuillez réessayer dans un instant.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const titles = {
      created: 'Demande envoyée !',
      linked: 'Demande reliée à votre compte !',
      already_pending: 'Demande déjà en cours',
      already_provider: 'Vous êtes déjà prestataire',
    };
    const messages = {
      created: `Merci ${form.name.split(' ')[0]}. Votre demande d'inscription a bien été enregistrée. Son statut est « En attente de validation ».`,
      linked: `Merci ${form.name.split(' ')[0]}. Votre demande a été reliée à votre compte client GlowNyo existant (${form.email}). Aucun deuxième compte n'a été créé : vos données, vos réservations et votre accès client sont conservés. Son statut est « Demande prestataire en attente ».`,
      already_pending: `Une demande prestataire existe déjà pour l'adresse ${form.email}. Elle est en attente de validation par l'équipe GlowNyo. Vous pouvez continuer à utiliser votre compte client normalement.`,
      already_provider: `L'adresse ${form.email} dispose déjà d'un accès prestataire GlowNyo. Connectez-vous avec vos identifiants habituels pour accéder à votre espace prestataire.`,
    };
    const notes = {
      created: "L'équipe GlowNyo va examiner votre demande. Dès qu'elle est validée, vous recevrez un email d'activation avec un lien sécurisé pour définir votre mot de passe et accéder à votre espace prestataire. Tant que la demande n'est pas validée, vous ne pouvez pas encore vous connecter.",
      linked: "L'équipe GlowNyo va examiner votre demande. Dès qu'elle est validée, l'accès prestataire sera ajouté à votre compte existant : vous continuerez à vous connecter avec votre email et mot de passe habituels, puis vous pourrez basculer entre l'espace client et l'espace prestataire. En attendant, votre compte client reste totalement fonctionnel.",
      already_pending: "Patientez le temps que l'équipe GlowNyo valide votre demande. Votre compte client reste entièrement fonctionnel.",
      already_provider: "Aucune action supplémentaire n'est nécessaire.",
    };

    return (
      <div className="pt-32 pb-24 mx-auto max-w-xl px-5 sm:px-8">
        <Helmet>
          <title>{titles[doneMode]} — GlowNyo</title>
          <meta
            name="description"
            content="Votre demande d'inscription prestataire GlowNyo a bien été reçue et est en attente de validation."
          />
        </Helmet>
        <div className="rounded-3xl border border-[#C9922A]/20 bg-[#0F0F0F] p-8 sm:p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full gold-gradient flex items-center justify-center">
            <CheckCircle2 size={30} className="text-[#0A0A0A]" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold">
            {titles[doneMode]}
          </h1>
          <p className="mt-4 text-[#F5F0E6]/75 leading-relaxed">
            {messages[doneMode]}
          </p>
          <div className="mt-6 rounded-2xl border border-[#C9922A]/20 bg-[#0A0A0A] p-5 text-left flex items-start gap-3">
            <Clock size={18} className="text-gold shrink-0 mt-0.5" />
            <p className="text-sm text-[#F5F0E6]/70">
              {notes[doneMode]}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:brightness-110 transition"
            >
              Retour à l'accueil <ArrowRight size={16} />
            </Link>
            {(doneMode === 'linked' || doneMode === 'already_pending' || doneMode === 'already_provider') && (
              <Link
                to="/connexion"
                className="inline-flex items-center gap-2 border border-[#C9922A]/40 text-[#F5F0E6] font-semibold px-6 py-3 rounded-full hover:bg-[#C9922A]/10 transition"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 mx-auto max-w-2xl px-5 sm:px-8">
      <Helmet>
        <title>Devenir prestataire — GlowNyo</title>
        <meta
          name="description"
          content="Rejoignez GlowNyo, la plateforme afro-moderne beauté & bien-être. Inscrivez-vous gratuitement pendant le lancement."
        />
      </Helmet>

      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#C9922A]/40 bg-[#C9922A]/10 px-4 py-1.5 text-xs tracking-widest uppercase text-gold">
          <Sparkles size={14} /> Offre de lancement · gratuit
        </span>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold leading-tight">
          Devenir prestataire <span className="text-gold-gradient italic">GlowNyo</span>
        </h1>
        <p className="mt-4 text-[#F5F0E6]/70 max-w-lg mx-auto">
          Remplissez ce formulaire en 2 minutes. Votre demande sera examinée par
          notre équipe, puis activée. Aucun frais pendant le lancement.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-10 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8 flex flex-col gap-5"
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm text-[#F5F0E6]/70">Nom / Nom de l'activité *</span>
          <input
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Ex : Queen's Beauty by Laure"
            className={`${inputCls} ${fieldErrors.name ? 'border-red-500/70 focus:border-red-500' : ''}`}
          />
          {fieldErrors.name && <span className="text-xs text-red-400">{fieldErrors.name}</span>}
        </label>

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#F5F0E6]/70">Email *</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              placeholder="vous@exemple.com"
              className={`${inputCls} ${fieldErrors.email ? 'border-red-500/70 focus:border-red-500' : ''}`}
            />
            {fieldErrors.email && <span className="text-xs text-red-400">{fieldErrors.email}</span>}
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#F5F0E6]/70">Téléphone / WhatsApp *</span>
            <input
              required
              value={form.phone}
              onChange={set('phone')}
              placeholder="Ex : 01 54 91 47 77"
              className={`${inputCls} ${fieldErrors.phone ? 'border-red-500/70 focus:border-red-500' : ''}`}
            />
            {fieldErrors.phone && <span className="text-xs text-red-400">{fieldErrors.phone}</span>}
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#F5F0E6]/70">Spécialité *</span>
            <select
              required
              value={form.specialty}
              onChange={set('specialty')}
              className={`${inputCls} ${fieldErrors.specialty ? 'border-red-500/70 focus:border-red-500' : ''}`}
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s} className="bg-[#0A0A0A]">
                  {s}
                </option>
              ))}
            </select>
            {fieldErrors.specialty && <span className="text-xs text-red-400">{fieldErrors.specialty}</span>}
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#F5F0E6]/70">Localisation</span>
            <input
              value={form.location}
              onChange={set('location')}
              placeholder="Ex : Akpakpa, Cotonou"
              className={inputCls}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-[#F5F0E6]/70">Services proposés et tarifs *</span>
          <textarea
            required
            value={form.services}
            onChange={set('services')}
            rows={3}
            placeholder="Listez vos prestations et tarifs (ex : Pose de locks — 20 000 FCFA, Tresses — 15 000 FCFA…). Séparez chaque service par une ligne ou une virgule."
            className={`${inputCls} resize-none ${fieldErrors.services ? 'border-red-500/70 focus:border-red-500' : ''}`}
          />
          {fieldErrors.services && <span className="text-xs text-red-400">{fieldErrors.services}</span>}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-[#F5F0E6]/70">Instagram (facultatif)</span>
          <input
            type="url"
            value={form.instagram}
            onChange={set('instagram')}
            placeholder="https://instagram.com/votre-compte"
            className={`${inputCls} ${fieldErrors.instagram ? 'border-red-500/70 focus:border-red-500' : ''}`}
          />
          {fieldErrors.instagram && <span className="text-xs text-red-400">{fieldErrors.instagram}</span>}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-[#F5F0E6]/70">Présentation et disponibilités (facultatif)</span>
          <textarea
            value={form.bio}
            onChange={set('bio')}
            rows={4}
            placeholder="Parlez-nous de vous, votre expérience, et indiquez vos disponibilités (jours et horaires)…"
            className={`${inputCls} resize-none`}
          />
        </label>

        {error && (
          <p className="text-sm text-red-400 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="gold-gradient text-[#0A0A0A] font-semibold px-6 py-3.5 rounded-full flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Envoi en cours...
            </>
          ) : (
            <>
              Envoyer ma demande <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-xs text-[#F5F0E6]/45 text-center">
          En envoyant votre demande, vous acceptez que GlowNyo examine vos
          informations. Aucun email d'activation n'est envoyé à ce stade.
        </p>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-[#C9922A]/40 text-[#F5F0E6] font-semibold px-6 py-3 rounded-full hover:bg-[#C9922A]/10 transition"
        >
          <CalendarClock size={16} className="text-gold" /> Réserver un appel
        </a>
        <a
          href={teamWaLink("Bonjour l'équipe GlowNyo, je suis prestataire et souhaite vous contacter.")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:brightness-105 transition"
        >
          <MessageCircle size={16} /> Contacter l'équipe sur WhatsApp
        </a>
      </div>
    </div>
  );
};

export default ProviderSignupPage;
