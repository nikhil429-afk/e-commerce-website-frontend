import { apiFetch } from "../utils/api";

export interface AppNotification {
  id: number;
  kind: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string | null;
}

export interface NotificationList {
  items: AppNotification[];
  unread: number;
}

export const getNotifications = (limit = 50) => apiFetch<NotificationList>(`/notifications?limit=${limit}`);

export const markNotificationRead = (id: number) => apiFetch(`/notifications/${id}/read`, { method: "POST" });

export const markAllNotificationsRead = () => apiFetch("/notifications/read-all", { method: "POST" });

export const deleteNotification = (id: number) => apiFetch(`/notifications/${id}`, { method: "DELETE" });

export const clearNotifications = () => apiFetch("/notifications", { method: "DELETE" });
