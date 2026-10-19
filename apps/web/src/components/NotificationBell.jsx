import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, CheckCheck } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const formatNotifDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = d.getMinutes();
  return minutes === 0 ? `${day}/${month} à ${hours}h` : `${day}/${month} à ${hours}h${String(minutes).padStart(2, '0')}`;
};

// Admin-only notification bell: who edited what on their profile, with a
// highlighted entry whenever a profile becomes complete (and therefore
// visible on the site). Polls every 60s so the unread count stays fresh
// without needing a page reload or a realtime subscription.
const NotificationBell = ({ variant = 'desktop' }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await pb.collection('notifications_admin').getList(1, 50, { sort: '-created' });
      setItems(res.items);
    } catch (err) {
      console.error('failed to load admin notifications', err);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const unreadCount = items.filter((i) => !i.lu).length;

  const markRead = async (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, lu: true } : i)));
    try {
      await pb.collection('notifications_admin').update(id, { lu: true });
    } catch (err) {
      console.error('failed to mark notification read', err);
    }
  };

  const markAllRead = async () => {
    const unread = items.filter((i) => !i.lu);
    if (unread.length === 0) return;
    setItems((prev) => prev.map((i) => ({ ...i, lu: true })));
    try {
      await Promise.all(unread.map((i) => pb.collection('notifications_admin').update(i.id, { lu: true })));
    } catch (err) {
      console.error('failed to mark all notifications read', err);
    }
  };

  const onClickNotification = (item) => {
    if (!item.lu) markRead(item.id);
    setOpen(false);
    navigate(`/admin/prestataires?highlight=${item.prestataire}`);
  };

  return (
    <div className={`relative ${variant === 'mobile' ? 'w-full' : ''}`} ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Notifications"
        className={
          variant === 'mobile'
            ? 'w-full flex items-center justify-center gap-2 text-base font-medium text-[#F5F0E6] border border-[#C9922A]/40 rounded-full px-6 py-3.5 hover:bg-[#C9922A]/10 hover:text-gold transition'
            : 'relative inline-flex items-center justify-center p-2 -mx-2 rounded-lg text-[#F5F0E6]/80 hover:text-gold transition'
        }
      >
        <Bell size={variant === 'mobile' ? 18 : 18} className={variant === 'mobile' ? 'text-gold' : ''} />
        {variant === 'mobile' && 'Notifications'}
        {unreadCount > 0 && (
          <span className={`inline-flex items-center justify-center rounded-full bg-[#C9922A] text-[#0A0A0A] text-[10px] font-bold leading-none ${
            variant === 'mobile' ? 'ml-1 h-5 min-w-5 px-1' : 'absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={variant === 'mobile' ? 'mt-3 w-full' : 'absolute right-0 top-full pt-3 z-50'}>
          <div className="w-[21rem] max-w-[90vw] max-h-[26rem] overflow-y-auto rounded-2xl border border-[#C9922A]/20 bg-[#0F0F0F] shadow-xl shadow-black/40">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 bg-[#0F0F0F]">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs text-[#F5F0E6]/60 hover:text-gold transition"
                >
                  <CheckCheck size={13} /> Tout marquer comme lu
                </button>
              )}
            </div>

            {items.length === 0 && (
              <p className="px-4 py-6 text-sm text-[#F5F0E6]/50 text-center">Aucune notification pour le moment.</p>
            )}

            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onClickNotification(item)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 last:border-0 transition hover:bg-[#C9922A]/10 ${
                  item.type === 'profil_complet' ? 'bg-[#C9922A]/10' : !item.lu ? 'bg-[#C9922A]/[0.04]' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {item.type === 'profil_complet' && <Sparkles size={14} className="text-gold shrink-0 mt-0.5" />}
                  {!item.lu && item.type !== 'profil_complet' && (
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm leading-snug ${item.type === 'profil_complet' ? 'text-gold font-medium' : 'text-[#F5F0E6]/85'}`}>
                      {item.message}
                    </p>
                    <p className="mt-1 text-xs text-[#F5F0E6]/40">{formatNotifDate(item.created)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
