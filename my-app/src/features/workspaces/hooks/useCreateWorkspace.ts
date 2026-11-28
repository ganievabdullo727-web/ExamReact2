"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createWorkspace } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useCreateWorkspace = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (workspace) => {
      queryClient.setQueryData(workspaceQueryKeys.detail(userId, workspace.slug), workspace);
      return queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list(userId) });
    },
  });
};
