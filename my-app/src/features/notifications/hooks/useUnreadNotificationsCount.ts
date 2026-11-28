"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getUnreadNotificationsCount } from "../api/notification.api";
import { notificationQueryKeys } from "./notification-query-keys";

export const useUnreadNotificationsCount = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(userId, slug),
    queryFn: ({ signal }) => getUnreadNotificationsCount(slug, signal),
    enabled: Boolean(userId && slug),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: false,
  });
};
