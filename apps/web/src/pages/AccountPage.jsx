import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  LogOut,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  UserCircle,
  Mail,
  CheckCircle2,
  Clock,
  Scissors,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SpaceSwitcher from '@/components/SpaceSwitcher';

const AccountPage = () => {
  const { user, logout, deleteAccount, isProvider, isDualRole, hasProviderRequest, providerRequestRefused } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0 = idle, 1 = first confirm, 2 = type-to-confirm
  const [acknowledge, setAcknowledge] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const onDelete = async () => {
    setError('');
    setBusy(true);
    try {
      await deleteAccount();
      // The account is gone and the auth store is cleared — back to home.
      navigate('/', { replace: true });
    } catch (err) {
      console.error('delete account failed', err);
      setError(
        err?.response?.message ||
          "La suppression du compte a échoué. Réessayez dans un instant ou contactez l'équipe GlowNyo.",
      );
      setBusy(false);
    }
  };

  const cancelDelete = () => {
    setStep(0);
    setAcknowledge(false);
    setConfirmText('');
    setError('');
  };

  return (
    <div className="pt-32 pb-24 mx-auto max-w-[44rem] px-5 sm:px-8">
      <Helmet>
        <title>Mon compte — GlowNyo</title>
        <meta
          name="description"
          content="Gérez votre compte GlowNyo : déconnexion, sécurité et suppression de compte."
        />
      </Helmet>

      <span className="text-xs tracking-widest uppercase text-gold">Espace compte</span>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-tight">
        Mon compte
      </h1>
      <p className="mt-3 text-[#F5F0E6]/65">
        Gérez votre accès GlowNyo. Cet espace est commun aux clientes et aux prestataires disposant
        d'un compte.
      </p>

      {/* Profile card */}
      <div className="mt-8 rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center shrink-0">
            <UserCircle size={26} className="text-[#0A0A0A]" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold truncate">
              {user?.name || 'Compte GlowNyo'}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-[#F5F0E6]/60 truncate">
              <Mail size={13} className="text-gold shrink-0" />
              {user?.email || '—'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            to="/mes-rendez-vous"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-5 py-3 rounded-full hover:bg-[#C9922A]/10 transition"
          >
            <CheckCircle2 size={16} className="text-gold" /> Mes rendez-vous
          </Link>
          {isProvider && (
            <Link
              to="/espace-prestataire"
              className="flex-1 inline-flex items-center justify-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-5 py-3 rounded-full hover:bg-[#C9922A]/10 transition"
            >
              <Scissors size={16} className="text-gold" /> Espace prestataire
            </Link>
          )}
          <button
            onClick={onLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-3 rounded-full hover:brightness-110 transition"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        </div>
      </div>

      {/* Provider access / request status */}
      {isProvider && (
        <div className="mt-6 rounded-3xl border border-[#C9922A]/20 bg-gradient-to-b from-[#C9922A]/[0.06] to-transparent p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full gold-gradient flex items-center justify-center shrink-0">
              <Scissors size={20} className="text-[#0A0A0A]" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-semibold">
                Accès prestataire actif
              </h2>
              {isDualRole ? (
                <>
                  <p className="mt-1.5 text-sm text-[#F5F0E6]/65">
                    Votre compte dispose de l'espace prestataire en plus de votre
                    espace client. Basculez entre les deux à tout moment, sans
                    vous reconnecter.
                  </p>
                  <div className="mt-4">
                    <SpaceSwitcher />
                  </div>
                </>
              ) : (
                <p className="mt-1.5 text-sm text-[#F5F0E6]/65">
                  Votre compte prestataire est actif. Retrouvez vos réservations
                  et votre profil depuis votre espace prestataire.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {hasProviderRequest && (
        <div className="mt-6 rounded-3xl border border-[#C9922A]/25 bg-[#0F0F0F] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-[#C9922A]/15 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-gold" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                Demande prestataire en attente
              </h2>
              <p className="mt-1.5 text-sm text-[#F5F0E6]/65">
                Votre demande pour devenir prestataire GlowNyo a bien été
                enregistrée et reliée à ce compte. L'équipe GlowNyo l'examine.
                Dès qu'elle est validée, l'accès prestataire sera ajouté à votre
                compte : vous continuerez à vous connecter avec vos identifiants
                habituels. En attendant, votre compte client reste totalement
                fonctionnel.
              </p>
            </div>
          </div>
        </div>
      )}

      {providerRequestRefused && (
        <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
              <XCircle size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-red-300">
                Demande prestataire refusée
              </h2>
              <p className="mt-1.5 text-sm text-[#F5F0E6]/65">
                Votre demande pour devenir prestataire n'a pas été retenue pour
                le moment. Votre compte client reste totalement fonctionnel. Vous
                pouvez renouveler une demande depuis la page « Devenir
                prestataire » si vous le souhaitez.
              </p>
              <Link
                to="/devenir-prestataire"
                className="mt-4 inline-flex items-center gap-2 border border-[#C9922A]/40 text-[#F5F0E6] px-5 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition text-sm"
              >
                <Scissors size={15} className="text-gold" /> Renouveler ma demande
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Danger zone — delete account */}
      <div className="mt-6 rounded-3xl border border-red-500/25 bg-red-500/[0.04] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} className="text-red-400" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-red-300">
              Supprimer mon compte
            </h2>
            <p className="mt-1.5 text-sm text-[#F5F0E6]/65">
              Cette action est <strong className="text-red-300">définitive et irréversible</strong>.
              Vous perdrez l'accès à votre espace et à la gestion de vos rendez-vous.
            </p>
          </div>
        </div>

        {step === 0 && (
          <button
            onClick={() => setStep(1)}
            className="mt-5 inline-flex items-center gap-2 border border-red-500/40 text-red-300 px-5 py-2.5 rounded-full hover:bg-red-500/10 transition"
          >
            <Trash2 size={15} /> Supprimer mon compte
          </button>
        )}

        {step >= 1 && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-[#0A0A0A]/60 p-5">
            <div className="flex items-start gap-2 text-sm text-[#F5F0E6]/75">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <ul className="list-disc list-inside space-y-1">
                <li>Votre compte et vos identifiants seront définitivement supprimés.</li>
                <li>Vous ne pourrez plus consulter ni gérer vos rendez-vous depuis votre espace.</li>
                <li>
                  Vos réservations passées sont <strong className="text-[#F5F0E6]">conservées</strong>{' '}
                  par l'équipe GlowNyo pour le suivi administratif.
                </li>
              </ul>
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-sm text-[#F5F0E6]/80 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledge}
                onChange={(e) => setAcknowledge(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-red-500"
              />
              <span>
                J'ai lu et compris les conséquences de la suppression de mon compte.
              </span>
            </label>

            {step === 2 && (
              <div className="mt-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[#F5F0E6]/70">
                    Pour confirmer, saisissez <strong className="text-red-300">SUPPRIMER</strong>{' '}
                    ci-dessous :
                  </span>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="SUPPRIMER"
                    autoComplete="off"
                    className="w-full rounded-xl bg-[#0A0A0A] border border-red-500/30 px-4 py-3 text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:outline-none focus:border-red-400 transition [color-scheme:dark]"
                  />
                </label>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={cancelDelete}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-5 py-3 rounded-full hover:bg-[#C9922A]/10 transition disabled:opacity-60"
              >
                Annuler
              </button>

              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={!acknowledge}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-red-500/40 text-red-300 px-5 py-3 rounded-full hover:bg-red-500/10 transition disabled:opacity-40"
                >
                  Continuer
                </button>
              ) : (
                <button
                  onClick={onDelete}
                  disabled={busy || confirmText !== 'SUPPRIMER'}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 text-white font-semibold px-5 py-3 rounded-full hover:brightness-110 transition disabled:opacity-40"
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} /> Supprimer définitivement
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
