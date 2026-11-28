"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateWorkspace, type UpdateWorkspaceData } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useUpdateWorkspace = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspace: UpdateWorkspaceData) => updateWorkspace(slug, workspace),
    onSuccess: async (workspace) => {
      if (workspace.slug !== slug) {
        queryClient.removeQueries({ queryKey: workspaceQueryKeys.detail(userId, slug) });
      }

      const detailKey = workspaceQueryKeys.detail(userId, workspace.slug);
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });
      queryClient.setQueryData(detailKey, workspace);
      return queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list(userId) });
    },
  });
};
