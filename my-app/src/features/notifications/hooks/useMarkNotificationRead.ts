"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { markNotificationRead } from "../api/notification.api";
import { notificationQueryKeys } from "./notification-query-keys";

export const useMarkNotificationRead = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(slug, notificationId),
    onMutate: () => notificationQueryKeys.workspace(userId, slug),
    onSuccess: (_notification, _notificationId, scope) =>
      queryClient.invalidateQueries({ queryKey: scope }),
  });
};
