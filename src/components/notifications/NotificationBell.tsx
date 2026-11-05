import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { kindIcon, timeAgo, useNotifications } from '../../notifications/notificationStore';
import type { AppNotification } from '../../api/notifications';
import styles from './notificationbell.module.css';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
    <path d="M13.7 20a2 2 0 0 1-3.4 0" />
  </svg>
);

/** Bell + dropdown for the navbar. Live: a new notification pops up as a toast the moment the owner acts. */
function NotificationBell() {
  const navigate = useNavigate();
  const { items, unread, loaded, live, latest, markRead, markAllRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const [ring, setRing] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState({ top: 64, right: 12 });

  // pop-up for a notification that arrives while the site is open
  useEffect(() => {
    if (!latest) return;
    setToast(latest);
    setRing(true);
    const t1 = window.setTimeout(() => setToast(null), 6000);
    const t2 = window.setTimeout(() => setRing(false), 1200);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [latest]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openItem = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    setToast(null);
    if (n.link) navigate(n.link);
  };

  const recent = items.slice(0, 8);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={`${styles.bellBtn} ${ring ? styles.ring : ''}`}
        onClick={e => {
          const r = e.currentTarget.getBoundingClientRect();
          setAnchor({ top: r.bottom + 10, right: Math.max(12, window.innerWidth - r.right - 8) });
          setOpen(o => !o);
          setToast(null);
        }}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Notifications"
      >
        <BellIcon />
        {unread > 0 && <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && createPortal(
        <div className={styles.panel} role="dialog" aria-label="Notifications" ref={panelRef}
          style={{ ['--pt' as string]: `${anchor.top}px`, ['--pr' as string]: `${anchor.right}px` }}>
          <div className={styles.head}>
            <div>
              <strong>Notifications</strong>
              <span className={`${styles.liveDot} ${live ? styles.liveOn : ''}`} title={live ? 'Live' : 'Reconnecting…'} />
            </div>
            <button type="button" className={styles.linkBtn} onClick={markAllRead} disabled={!unread}>Mark all read</button>
          </div>

          <div className={styles.list}>
            {!loaded && <div className={styles.empty}>Loading…</div>}
            {loaded && recent.length === 0 && (
              <div className={styles.empty}>
                <span>🔔</span>
                <p>You're all caught up.</p>
                <small>Updates from the store about your appointments and orders appear here.</small>
              </div>
            )}
            {recent.map(n => (
              <button key={n.id} type="button" className={`${styles.item} ${n.is_read ? '' : styles.unread}`} onClick={() => openItem(n)}>
                <span className={styles.icon}>{kindIcon(n.kind)}</span>
                <span className={styles.body}>
                  <strong>{n.title}</strong>
                  <span>{n.message}</span>
                  <small>{timeAgo(n.created_at)}</small>
                </span>
                {!n.is_read && <i className={styles.dot} aria-hidden="true" />}
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.remove}
                  aria-label="Dismiss notification"
                  onClick={e => { e.stopPropagation(); remove(n.id); }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); remove(n.id); } }}
                >✕</span>
              </button>
            ))}
          </div>

          {recent.length > 0 && (
            <Link to="/profile?tab=notifications" className={styles.viewAll} onClick={() => setOpen(false)}>View all notifications</Link>
          )}
        </div>,
        document.body
      )}

      {toast && !open && createPortal(
        <button type="button" className={styles.toast} onClick={() => openItem(toast)} role="status" aria-live="polite">
          <span className={styles.icon}>{kindIcon(toast.kind)}</span>
          <span className={styles.body}>
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </span>
        </button>,
        document.body
      )}
    </div>
  );
}

export default NotificationBell;
