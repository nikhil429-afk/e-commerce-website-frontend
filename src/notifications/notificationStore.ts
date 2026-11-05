import { useEffect, useSyncExternalStore } from "react";
import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";
import {
  clearNotifications, deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead,
} from "../api/notifications";
import type { AppNotification } from "../api/notifications";

/**
 * One live notification connection for the whole app (the navbar bell and the profile page share it).
 *
 *  - the server pushes each new notification the moment the owner acts (Server-Sent Events over fetch, so the
 *    login token travels in a header and not in the address),
 *  - if the connection drops it reconnects by itself,
 *  - a light refresh every 30 s and whenever the tab becomes visible again is the safety net.
 */

interface State {
  items: AppNotification[];
  unread: number;
  loaded: boolean;
  live: boolean;
  latest: AppNotification | null;      // the notification that just arrived (drives the pop-up toast)
}

let state: State = { items: [], unread: 0, loaded: false, live: false, latest: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; emit(); };

let users = 0;
let stopTimer: number | undefined;
let pollTimer: number | undefined;
let abort: AbortController | null = null;
let activeToken: string | null = null;

async function refresh() {
  if (!getToken()) return;
  try {
    const data = await getNotifications(50);
    set({ items: data.items, unread: data.unread, loaded: true });
  } catch { /* offline / expired: the next refresh tries again */ }
}

function receive(n: AppNotification) {
  if (state.items.some((x) => x.id === n.id)) return;
  set({ items: [n, ...state.items].slice(0, 50), unread: state.unread + (n.is_read ? 0 : 1), latest: n });
}

async function connect(token: string, signal: AbortSignal) {
  let wait = 1500;
  while (!signal.aborted) {
    try {
      const res = await fetch(`${BASE_URL}/notifications/stream`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
        signal,
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) return;          // session ended: polling / the login redirect handle it
      if (!res.ok || !res.body) throw new Error(String(res.status));

      wait = 1500;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let cut: number;
        while ((cut = buffer.indexOf("\n\n")) >= 0) {
          const block = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          const data = block.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
          if (!data) continue;                                        // comment / heartbeat
          try {
            const msg = JSON.parse(data);
            if (msg.type === "ready") { set({ live: true }); refresh(); }
            else if (msg.type === "notification" && msg.notification) receive(msg.notification as AppNotification);
          } catch { /* ignore a malformed frame */ }
        }
      }
    } catch {
      if (signal.aborted) return;
    }
    set({ live: false });
    if (signal.aborted) return;
    await new Promise((r) => setTimeout(r, wait));
    wait = Math.min(wait * 2, 15000);
  }
}

function onVisible() { if (document.visibilityState === "visible") refresh(); }

function start() {
  const token = getToken();
  if (!token) return;
  if (activeToken === token && abort) return;
  stopNow();
  activeToken = token;
  abort = new AbortController();
  refresh();
  connect(token, abort.signal);
  pollTimer = window.setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 30000);
  document.addEventListener("visibilitychange", onVisible);
}

function stopNow() {
  abort?.abort();
  abort = null;
  activeToken = null;
  if (pollTimer) window.clearInterval(pollTimer);
  pollTimer = undefined;
  document.removeEventListener("visibilitychange", onVisible);
  state = { items: [], unread: 0, loaded: false, live: false, latest: null };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
const getSnapshot = () => state;

/** Use inside any component that shows notifications. Opens the shared connection while at least one is mounted. */
export function useNotifications() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    users += 1;
    window.clearTimeout(stopTimer);
    start();
    return () => {
      users -= 1;
      // pages swap their navbar on every navigation: wait a moment before closing so the connection survives that
      stopTimer = window.setTimeout(() => { if (users <= 0) { stopNow(); emit(); } }, 4000);
    };
  }, []);

  return {
    ...snap,
    refresh,
    async markRead(id: number) {
      const n = state.items.find((x) => x.id === id);
      if (!n || n.is_read) return;
      set({ items: state.items.map((x) => (x.id === id ? { ...x, is_read: true } : x)), unread: Math.max(0, state.unread - 1) });
      try { await markNotificationRead(id); } catch { refresh(); }
    },
    async markAllRead() {
      if (!state.unread) return;
      set({ items: state.items.map((x) => ({ ...x, is_read: true })), unread: 0 });
      try { await markAllNotificationsRead(); } catch { refresh(); }
    },
    async remove(id: number) {
      const n = state.items.find((x) => x.id === id);
      set({ items: state.items.filter((x) => x.id !== id), unread: Math.max(0, state.unread - (n && !n.is_read ? 1 : 0)) });
      try { await deleteNotification(id); } catch { refresh(); }
    },
    async clearAll() {
      set({ items: [], unread: 0 });
      try { await clearNotifications(); } catch { refresh(); }
    },
  };
}

/** "just now", "5 min ago", "2 h ago", "3 d ago", then the date. */
export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export const kindIcon = (kind: string) =>
  kind === "appointment_accepted" ? "✅"
  : kind === "appointment_declined" ? "❌"
  : kind === "appointment_rescheduled" ? "🗓️"
  : kind === "order_updated" ? "📦"
  : kind === "account_updated" ? "👤"
  : "🔔";
