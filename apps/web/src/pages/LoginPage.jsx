import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  LogIn,
  UserPlus,
  Loader2,
  CalendarClock,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  MailCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { LOGO } from '@/data/site';

const inputCls =
  'w-full rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-4 py-3 text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:outline-none focus:border-[#C9922A] transition [color-scheme:dark]';

// Password field with a show/hide toggle. The toggle only flips the input's
// type attribute — it never reveals a previously saved password (PocketBase
// stores hashes only; the field is always controlled by local component state).
const PasswordField = ({ value, onChange, placeholder, minLength = 8, autoComplete = 'new-password' }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputCls} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0E6]/50 hover:text-gold transition p-1"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

// Google's official "G" mark, used as-is on the sign-in button per Google's
// branding guidelines (fixed colors, never recolored).
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.617z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
);

const LoginPage = () => {
  const { login, loginWithGoogle, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/mes-rendez-vous';

  // mode: 'login' | 'signup' | 'reset'
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setResetSent(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const rec = await login(form.email, form.password);
        // Administrators land in the admin space; everyone else goes to the
        // page they came from (or their rendez-vous by default).
        if (rec?.role === 'admin') {
          navigate('/admin', { replace: true });
          return;
        }
      } else if (mode === 'signup') {
        await signup(form.email, form.password);
      } else if (mode === 'reset') {
        await pb.collection('users').requestPasswordReset(form.email);
        setResetSent(true);
        setBusy(false);
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.message ||
        (mode === 'login'
          ? 'Email ou mot de passe incorrect.'
          : mode === 'signup'
            ? "Impossible de créer le compte. Cet email est peut-être déjà utilisé."
            : "Impossible d'envoyer l'email de réinitialisation. Vérifiez votre adresse.");
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const onGoogleClick = async () => {
    setError('');
    setGoogleBusy(true);
    try {
      const rec = await loginWithGoogle();
      if (rec?.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      navigate(from, { replace: true });
    } catch {
      setError('Impossible de continuer avec Google. Réessayez, ou utilisez votre email et votre mot de passe.');
    } finally {
      setGoogleBusy(false);
    }
  };

  const titles = {
    login: 'Bon retour chez GlowNyo',
    signup: 'Créez votre compte',
    reset: 'Mot de passe oublié',
  };

  const subtitles = {
    login: 'Connectez-vous pour consulter et gérer vos rendez-vous.',
    signup: "Un compte facultatif pour retrouver toutes vos réservations en un coup d'œil.",
    reset: 'Saisissez votre email : vous recevrez un lien sécurisé pour définir un nouveau mot de passe.',
  };

  return (
    <div className="pt-32 pb-24 mx-auto max-w-md px-5 sm:px-8">
      <Helmet>
        <title>Connexion — GlowNyo</title>
        <meta
          name="description"
          content="Connectez-vous à votre compte GlowNyo pour consulter et gérer vos rendez-vous."
        />
      </Helmet>

      <div className="text-center">
        <img src={LOGO} alt="GlowNyo" className="h-20 w-auto mx-auto" />
      </div>

      <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8">
        <div className="flex gap-2 p-1 rounded-full bg-[#0A0A0A] border border-[#C9922A]/15">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition ${
              mode === 'login' ? 'gold-gradient text-[#0A0A0A]' : 'text-[#F5F0E6]/70 hover:text-gold'
            }`}
          >
            <LogIn size={15} /> Connexion
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition ${
              mode === 'signup' ? 'gold-gradient text-[#0A0A0A]' : 'text-[#F5F0E6]/70 hover:text-gold'
            }`}
          >
            <UserPlus size={15} /> Créer un compte
          </button>
        </div>

        <h1 className="mt-6 font-display text-2xl font-semibold">{titles[mode]}</h1>
        <p className="mt-2 text-sm text-[#F5F0E6]/60">{subtitles[mode]}</p>

        {mode !== 'reset' && (
          <>
            <button
              type="button"
              onClick={onGoogleClick}
              disabled={googleBusy || busy}
              className="mt-6 w-full flex items-center justify-center gap-3 bg-white text-[#1F1F1F] font-medium px-6 py-3 rounded-full border border-[#C9922A]/20 hover:bg-white/90 transition disabled:opacity-60"
            >
              {googleBusy ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
              {mode === 'signup' ? 'Créer un compte avec Google' : 'Continuer avec Google'}
            </button>
            <div className="mt-5 flex items-center gap-3 text-xs text-[#F5F0E6]/40">
              <div className="h-px flex-1 bg-[#C9922A]/15" />
              ou
              <div className="h-px flex-1 bg-[#C9922A]/15" />
            </div>
          </>
        )}

        {mode === 'reset' && resetSent ? (
          <div className="mt-6 rounded-2xl border border-[#C9922A]/25 bg-gradient-to-b from-[#C9922A]/[0.06] to-transparent p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
              <MailCheck size={22} className="text-[#0A0A0A]" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold">Email envoyé</h2>
            <p className="mt-2 text-sm text-[#F5F0E6]/65">
              Si un compte existe pour <strong className="text-[#F5F0E6]">{form.email}</strong>, un
              lien de réinitialisation vient de lui être envoyé. Vérifiez votre boîte de réception
              (et vos courriers indésirables). Le lien est valable une heure.
            </p>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="mt-5 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition"
            >
              <LogIn size={16} /> Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-[#F5F0E6]/70">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="vous@exemple.com"
                className={inputCls}
              />
            </label>

            {mode !== 'reset' && (
              <label className="flex flex-col gap-2">
                <span className="text-sm text-[#F5F0E6]/70">Mot de passe</span>
                <PasswordField
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Minimum 8 caractères"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="self-end -mt-1 inline-flex items-center gap-1.5 text-xs text-[#F5F0E6]/55 hover:text-gold transition"
              >
                <KeyRound size={13} /> Mot de passe oublié ?
              </button>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="gold-gradient text-[#0A0A0A] font-semibold px-6 py-3.5 rounded-full flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Veuillez patienter...
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn size={18} /> Se connecter
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus size={18} /> Créer mon compte
                </>
              ) : (
                <>
                  <KeyRound size={18} /> Envoyer le lien de réinitialisation
                </>
              )}
            </button>
          </form>
        )}

        {mode === 'reset' && !resetSent && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="mt-5 w-full text-center text-sm text-[#F5F0E6]/55 hover:text-gold transition"
          >
            Retour à la connexion
          </button>
        )}

        {mode !== 'reset' && (
          <div className="mt-6 flex items-start gap-2 text-xs text-[#F5F0E6]/45">
            <ShieldCheck size={14} className="text-gold shrink-0 mt-0.5" />
            <p>
              Le compte est <strong className="text-[#F5F0E6]/70">facultatif</strong> : vous
              pouvez réserver sans compte. Il sert uniquement à retrouver et gérer vos rendez-vous.
            </p>
          </div>
        )}

        {mode !== 'reset' && (
          <p className="mt-3 text-xs text-[#F5F0E6]/45">
            En continuant, vous acceptez nos{' '}
            <Link to="/cgv" className="text-gold hover:brightness-110 transition">conditions générales de vente</Link>
            {' '}et notre{' '}
            <Link to="/politique-de-confidentialite" className="text-gold hover:brightness-110 transition">politique de confidentialité</Link>.
          </p>
        )}
      </div>

      <Link
        to="/reservation"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-[#F5F0E6]/60 hover:text-gold transition"
      >
        <CalendarClock size={15} /> Réserver sans compte
      </Link>
    </div>
  );
};

export default LoginPage;
