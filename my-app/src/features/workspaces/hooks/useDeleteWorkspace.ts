"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteWorkspace } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useDeleteWorkspace = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteWorkspace(slug),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: workspaceQueryKeys.detail(userId, slug) });
      return queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list(userId) });
    },
  });
};
