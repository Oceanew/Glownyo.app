import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle, Scissors, ShieldCheck } from 'lucide-react';
import { LOGO } from '@/data/site';
import { useAuth } from '@/contexts/AuthContext';
import SpaceSwitcher from '@/components/SpaceSwitcher';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/prestataires', label: 'Prestataires' },
  { to: '/reservation', label: 'Réservation' },
  { to: '/partenaires', label: 'Partenaires' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthed, isProvider, isDualRole, isAdmin, logout } = useAuth();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#C9922A]/15' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-[90rem] px-5 sm:px-8 h-32 sm:h-40 flex items-center justify-between">
        <Link to="/" className="flex items-center shrink-0">
          <img src={LOGO} alt="GlowNyo" className="h-24 sm:h-32 w-auto" />
        </Link>

        <ul className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors ${
                    isActive ? 'text-gold' : 'text-[#F5F0E6]/80 hover:text-gold'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4 whitespace-nowrap">
          {isAuthed ? (
            <>
              {isDualRole ? (
                <SpaceSwitcher variant="compact" />
              ) : (
                <Link
                  to="/mes-rendez-vous"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap leading-none text-sm tracking-wide text-[#F5F0E6]/80 hover:text-gold transition"
                >
                  <UserCircle size={16} className="text-gold" /> Mes rendez-vous
                </Link>
              )}
              {isProvider && !isDualRole && (
                <Link
                  to="/espace-prestataire"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap leading-none text-sm tracking-wide text-[#F5F0E6]/80 hover:text-gold transition"
                >
                  <Scissors size={16} className="text-gold" /> Espace prestataire
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/prestataires"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap leading-none text-sm tracking-wide text-gold hover:brightness-110 transition"
                >
                  <ShieldCheck size={16} /> Administration
                </Link>
              )}
              <Link
                to="/mon-compte"
                className="inline-flex items-center gap-1.5 whitespace-nowrap leading-none text-sm tracking-wide text-[#F5F0E6]/80 hover:text-gold transition"
              >
                Mon compte
              </Link>
              <button
                onClick={logout}
                className="whitespace-nowrap leading-none text-sm tracking-wide text-[#F5F0E6]/60 hover:text-gold transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/connexion"
              className="inline-flex items-center gap-1.5 text-sm tracking-wide text-[#F5F0E6]/80 hover:text-gold transition"
            >
              <UserCircle size={16} className="text-gold" /> Connexion
            </Link>
          )}
          <Link
            to="/reservation"
            className="gold-gradient text-[#0A0A0A] font-semibold text-sm px-6 py-2.5 rounded-full whitespace-nowrap leading-none hover:brightness-110 transition"
          >
            Réserver
          </Link>
        </div>

        <button
          className="md:hidden text-gold p-2 -mr-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-[#0A0A0A]/98 backdrop-blur-md border-t border-[#C9922A]/15 px-5 pb-6 pt-2">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `block py-3.5 text-base border-b border-white/5 ${
                      isActive ? 'text-gold' : 'text-[#F5F0E6]/85'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to="/reservation"
            className="mt-5 block text-center gold-gradient text-[#0A0A0A] font-semibold px-6 py-3 rounded-full"
          >
            Réserver un rendez-vous
          </Link>
          <Link
            to={isAuthed ? '/mon-compte' : '/connexion'}
            className="mt-3 flex items-center justify-center gap-1.5 text-sm text-[#F5F0E6]/80 hover:text-gold transition"
          >
            <UserCircle size={16} className="text-gold" />
            {isAuthed ? 'Mon compte' : 'Connexion / Créer un compte'}
          </Link>
          {isAuthed && (
            <>
              {isDualRole ? (
                <div className="mt-3 flex justify-center">
                  <SpaceSwitcher variant="compact" />
                </div>
              ) : (
                <Link
                  to="/mes-rendez-vous"
                  className="mt-2 flex items-center justify-center gap-1.5 text-sm text-[#F5F0E6]/70 hover:text-gold transition"
                >
                  Mes rendez-vous
                </Link>
              )}
              {isProvider && !isDualRole && (
                <Link
                  to="/espace-prestataire"
                  className="mt-2 flex items-center justify-center gap-1.5 text-sm text-[#F5F0E6]/70 hover:text-gold transition"
                >
                  <Scissors size={15} className="text-gold" /> Espace prestataire
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/prestataires"
                  className="mt-2 flex items-center justify-center gap-1.5 text-sm text-gold hover:brightness-110 transition"
                >
                  <ShieldCheck size={15} /> Administration
                </Link>
              )}
              <button
                onClick={logout}
                className="mt-2 w-full text-sm text-[#F5F0E6]/55 hover:text-gold transition"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
