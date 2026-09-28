import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, RefreshCw, Star } from 'lucide-react';

// Shared sub-navigation for the GlowNyo admin space. Renders the three admin
// rubrics (Tableau de bord, Réservations, Demandes prestataires) plus a
// refresh button. Shown only on admin pages, which are already role-guarded
// by AdminRoute.
const AdminNav = ({ onRefresh, refreshing, title, subtitle }) => (
  <div className="flex items-center justify-between flex-wrap gap-4">
    <div>
      <span className="text-xs tracking-widest uppercase text-gold">Administration</span>
      <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold leading-tight">
        {title}
      </h1>
      {subtitle && <p className="mt-3 text-[#F5F0E6]/65 max-w-2xl">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3 flex-wrap">
      <NavLink
        to="/admin"
        end
        className={({ isActive }) =>
          `inline-flex items-center gap-2 border px-4 py-2.5 rounded-full transition text-sm ${
            isActive
              ? 'border-[#C9922A] text-gold bg-[#C9922A]/10'
              : 'border-[#C9922A]/30 text-[#F5F0E6]/80 hover:bg-[#C9922A]/10'
          }`
        }
      >
        <LayoutDashboard size={16} /> Tableau de bord
      </NavLink>
      <NavLink
        to="/admin/reservations"
        className={({ isActive }) =>
          `inline-flex items-center gap-2 border px-4 py-2.5 rounded-full transition text-sm ${
            isActive
              ? 'border-[#C9922A] text-gold bg-[#C9922A]/10'
              : 'border-[#C9922A]/30 text-[#F5F0E6]/80 hover:bg-[#C9922A]/10'
          }`
        }
      >
        <CalendarDays size={16} /> Réservations
      </NavLink>
      <NavLink
        to="/admin/prestataires"
        className={({ isActive }) =>
          `inline-flex items-center gap-2 border px-4 py-2.5 rounded-full transition text-sm ${
            isActive
              ? 'border-[#C9922A] text-gold bg-[#C9922A]/10'
              : 'border-[#C9922A]/30 text-[#F5F0E6]/80 hover:bg-[#C9922A]/10'
          }`
        }
      >
        <Users size={16} /> Prestataires
      </NavLink>
      <NavLink
        to="/admin/avis"
        className={({ isActive }) =>
          `inline-flex items-center gap-2 border px-4 py-2.5 rounded-full transition text-sm ${
            isActive
              ? 'border-[#C9922A] text-gold bg-[#C9922A]/10'
              : 'border-[#C9922A]/30 text-[#F5F0E6]/80 hover:bg-[#C9922A]/10'
          }`
        }
      >
        <Star size={16} /> Avis
      </NavLink>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 border border-[#C9922A]/30 text-[#F5F0E6] px-4 py-2.5 rounded-full hover:bg-[#C9922A]/10 transition disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Actualiser
        </button>
      )}
    </div>
  </div>
);

export default AdminNav;
