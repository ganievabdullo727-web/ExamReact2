import axios from "axios";
import { api } from "@/shared/api/client";

export type NotificationFilter = "all" | "unread" | "read";
export type NotificationType = "issue_assigned" | "comment_added" | "mentioned";

export type Notification = {
  id: string;
  workspace_id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  issue_id: string | null;
  entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  actor: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type NotificationPage = {
  data: Notification[];
  unread_count: number;
  next_cursor: string | null;
};

export function notificationIssueHref(slug: string, notification: Notification) {
  if (!notification.issue_id) return null;
  const issue = `/workspaces/${encodeURIComponent(slug)}/issues/${encodeURIComponent(notification.issue_id)}`;
  const commentId = notification.type !== "issue_assigned" ? notification.entity_id : null;
  return commentId ? `${issue}?comment=${encodeURIComponent(commentId)}` : issue;
}

type ListOptions = {
  filter?: NotificationFilter;
  cursor?: string;
  limit?: number;
};

export const getNotificationError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
};

const notificationsPath = (slug: string) => `/v1/workspaces/${encodeURIComponent(slug)}/notifications`;

export const getNotifications = async (
  slug: string,
  { filter = "all", cursor, limit = 50 }: ListOptions = {},
  signal?: AbortSignal,
): Promise<NotificationPage> => {
  const read = filter === "all" ? undefined : filter === "read" ? "true" : "false";
  const { data } = await api.get<NotificationPage>(`${notificationsPath(slug)}/`, {
    params: { read, cursor, limit },
    signal,
  });
  return data;
};

export const getUnreadNotificationsCount = async (
  slug: string,
  signal?: AbortSignal,
): Promise<number> => {
  const { unread_count } = await getNotifications(slug, { filter: "unread", limit: 1 }, signal);
  return unread_count;
};

export const markNotificationRead = async (slug: string, notificationId: string): Promise<Notification> => {
  const { data } = await api.post<Notification>(
    `${notificationsPath(slug)}/${encodeURIComponent(notificationId)}/read`,
  );
  return data;
};

export const markAllNotificationsRead = async (slug: string): Promise<{ updated: number }> => {
  const { data } = await api.post<{ updated: number }>(`${notificationsPath(slug)}/read-all`);
  return data;
};
