"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getNotifications, type NotificationFilter } from "../api/notification.api";
import { notificationQueryKeys } from "./notification-query-keys";

export const useNotifications = (slug: string, filter: NotificationFilter = "all") => {
  const userId = useAuthStore((state) => state.user?.id);

  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list(userId, slug, filter),
    queryFn: ({ pageParam, signal }) =>
      getNotifications(slug, { filter, cursor: pageParam ?? undefined }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage, _pages, _lastPageParam, pageParams) =>
      lastPage.next_cursor && !pageParams.includes(lastPage.next_cursor)
        ? lastPage.next_cursor
        : undefined,
    enabled: Boolean(userId && slug),
    refetchOnWindowFocus: true,
    retry: false,
  });
};
