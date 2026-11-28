import type { NotificationFilter } from "../api/notification.api";

export const notificationQueryKeys = {
  workspace: (userId: string | undefined, slug: string) => ["notifications", userId, slug] as const,
  list: (userId: string | undefined, slug: string, filter: NotificationFilter) =>
    [...notificationQueryKeys.workspace(userId, slug), "list", filter] as const,
  unreadCount: (userId: string | undefined, slug: string) =>
    [...notificationQueryKeys.workspace(userId, slug), "unreadCount"] as const,
};
