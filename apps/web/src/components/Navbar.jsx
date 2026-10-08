import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle, Scissors, ShieldCheck, ChevronDown, LayoutDashboard, CalendarDays, Users, Star, LogOut } from 'lucide-react';
import { LOGO } from '@/data/site';
import { useAuth } from '@/contexts/AuthContext';
import SpaceSwitcher from '@/components/SpaceSwitcher';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/prestataires', label: 'Prestataires' },
  { to: '/reservation', label: 'Réservation' },
  { to: '/partenaires', label: 'Partenaires' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountMenuRef = useRef(null);
  const location = useLocation();
  const { isAuthed, isProvider, isDualRole, isAdmin, logout } = useAuth();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => setAccountOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Closes the account dropdown on an outside click/tap, so it behaves the
  // same way on touchscreens (tablet, phone) as it does with a mouse —
  // hover alone isn't enough to reliably reach "Déconnexion" on touch.
  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [accountOpen]);

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

        <ul className="hidden lg:flex items-center gap-7 xl:gap-9">
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

        <div className="hidden lg:flex items-center gap-3 whitespace-nowrap">
          {isAuthed ? (
            <>
              {isDualRole && <SpaceSwitcher variant="compact" />}
              {/* Single account menu instead of one nav item per link: on
                  narrower desktop/tablet widths, a row of separate items
                  (Mes rendez-vous, Espace prestataire, Administration, Mon
                  compte, Déconnexion) ran out of room and overlapped,
                  making "Déconnexion" unreliable to hit. */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-expanded={accountOpen}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap leading-none text-sm tracking-wide text-[#F5F0E6]/80 hover:text-gold transition px-2 py-1.5 -mx-2 rounded-lg"
                >
                  <UserCircle size={16} className="text-gold" />
                  Mon compte
                  <ChevronDown size={14} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full pt-3 z-50">
                    <div className="w-64 rounded-2xl border border-[#C9922A]/20 bg-[#0F0F0F] shadow-xl shadow-black/40 py-2">
                      {!isDualRole && (
                        <Link to="/mes-rendez-vous" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                          <UserCircle size={15} className="text-gold" /> Mes rendez-vous
                        </Link>
                      )}
                      {isProvider && !isDualRole && (
                        <Link to="/espace-prestataire" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                          <Scissors size={15} className="text-gold" /> Espace prestataire
                        </Link>
                      )}
                      {isAdmin && (
                        <>
                          <p className="mt-1 px-4 py-1.5 text-[11px] uppercase tracking-widest text-gold/70 flex items-center gap-1.5">
                            <ShieldCheck size={12} /> Administration
                          </p>
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                            <LayoutDashboard size={15} className="text-gold" /> Tableau de bord
                          </Link>
                          <Link to="/admin/reservations" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                            <CalendarDays size={15} className="text-gold" /> Réservations
                          </Link>
                          <Link to="/admin/prestataires" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                            <Users size={15} className="text-gold" /> Prestataires
                          </Link>
                          <Link to="/admin/avis" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                            <Star size={15} className="text-gold" /> Avis clients
                          </Link>
                        </>
                      )}
                      <Link to="/mon-compte" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                        <UserCircle size={15} className="text-gold" /> Mon compte
                      </Link>
                      <div className="my-1 mx-4 border-t border-white/5" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 px-4 py-2.5 w-full text-left text-sm text-[#F5F0E6]/70 hover:bg-[#C9922A]/10 hover:text-gold transition"
                      >
                        <LogOut size={15} /> Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
          className="lg:hidden text-gold p-2 -mr-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-[#0A0A0A]/98 backdrop-blur-md border-t border-[#C9922A]/15 px-5 pb-6 pt-2">
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
            className="mt-5 block text-center gold-gradient text-[#0A0A0A] font-semibold px-6 py-3.5 rounded-full"
          >
            Réserver un rendez-vous
          </Link>
          {!isAuthed ? (
            <Link
              to="/connexion"
              className="mt-3 flex items-center justify-center gap-2 text-base font-medium text-[#F5F0E6] border border-[#C9922A]/40 rounded-full px-6 py-3.5 hover:bg-[#C9922A]/10 hover:text-gold transition"
            >
              <UserCircle size={18} className="text-gold" />
              Connexion / Créer un compte
            </Link>
          ) : (
            <Link
              to="/mon-compte"
              className="mt-3 flex items-center justify-center gap-2 text-base font-medium text-[#F5F0E6] border border-[#C9922A]/40 rounded-full px-6 py-3.5 hover:bg-[#C9922A]/10 hover:text-gold transition"
            >
              <UserCircle size={18} className="text-gold" />
              Mon compte
            </Link>
          )}
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
                <div className="mt-3 rounded-2xl border border-[#C9922A]/20 bg-[#0A0A0A] py-2">
                  <p className="px-4 py-1.5 text-[11px] uppercase tracking-widest text-gold flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Administration
                  </p>
                  <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                    <LayoutDashboard size={15} className="text-gold" /> Tableau de bord
                  </Link>
                  <Link to="/admin/reservations" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                    <CalendarDays size={15} className="text-gold" /> Réservations
                  </Link>
                  <Link to="/admin/prestataires" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                    <Users size={15} className="text-gold" /> Prestataires
                  </Link>
                  <Link to="/admin/avis" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F0E6]/85 hover:bg-[#C9922A]/10 hover:text-gold transition">
                    <Star size={15} className="text-gold" /> Avis clients
                  </Link>
                </div>
              )}
              <button
                onClick={logout}
                className="mt-4 w-full flex items-center justify-center gap-2 text-base font-medium text-[#F5F0E6]/85 border border-[#C9922A]/20 rounded-full px-6 py-3.5 hover:bg-[#C9922A]/10 hover:text-gold transition"
              >
                <LogOut size={17} /> Déconnexion
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
