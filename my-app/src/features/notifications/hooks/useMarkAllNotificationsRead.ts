"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { markAllNotificationsRead } from "../api/notification.api";
import { notificationQueryKeys } from "./notification-query-keys";

export const useMarkAllNotificationsRead = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(slug),
    onMutate: () => notificationQueryKeys.workspace(userId, slug),
    onSuccess: (_result, _variables, scope) =>
      queryClient.invalidateQueries({ queryKey: scope }),
  });
};
