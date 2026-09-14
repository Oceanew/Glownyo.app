import { useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, Scissors } from 'lucide-react';

// Segmented toggle to switch between the client space and the provider space.
// Shown ONLY to dual-role accounts (a client who was granted provider access),
// so they can move between /mon-compte (client) and /espace-prestataire
// (provider) without logging in again. Provider-only and client-only accounts
// never see this component.
//
// Props:
//   variant: "full" (default, on account/provider pages) or "compact" (navbar).
const SpaceSwitcher = ({ variant = 'full' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.startsWith('/espace-prestataire')
    ? 'provider'
    : 'client';

  const go = (space) => {
    navigate(space === 'provider' ? '/espace-prestataire' : '/mon-compte');
  };

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-[#0A0A0A] border border-[#C9922A]/25">
        <button
          type="button"
          onClick={() => go('client')}
          aria-label="Espace client"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            active === 'client'
              ? 'gold-gradient text-[#0A0A0A]'
              : 'text-[#F5F0E6]/70 hover:text-gold'
          }`}
        >
          <UserCircle size={13} /> Client
        </button>
        <button
          type="button"
          onClick={() => go('provider')}
          aria-label="Espace prestataire"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            active === 'provider'
              ? 'gold-gradient text-[#0A0A0A]'
              : 'text-[#F5F0E6]/70 hover:text-gold'
          }`}
        >
          <Scissors size={13} /> Prestataire
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex gap-1 p-1 rounded-full bg-[#0A0A0A] border border-[#C9922A]/15">
      <button
        type="button"
        onClick={() => go('client')}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
          active === 'client'
            ? 'gold-gradient text-[#0A0A0A]'
            : 'text-[#F5F0E6]/70 hover:text-gold'
        }`}
      >
        <UserCircle size={15} /> Espace client
      </button>
      <button
        type="button"
        onClick={() => go('provider')}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
          active === 'provider'
            ? 'gold-gradient text-[#0A0A0A]'
            : 'text-[#F5F0E6]/70 hover:text-gold'
        }`}
      >
        <Scissors size={15} /> Espace prestataire
      </button>
    </div>
  );
};

export default SpaceSwitcher;
