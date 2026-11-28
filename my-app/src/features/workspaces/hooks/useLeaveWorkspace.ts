"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { leaveWorkspace } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useLeaveWorkspace = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveWorkspace(slug),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: workspaceQueryKeys.detail(userId, slug) });
      return queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list(userId) });
    },
  });
};
