"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { transferOwnership, type TransferOwnershipData } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useTransferOwnership = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ownership: TransferOwnershipData) => transferOwnership(slug, ownership),
    onSuccess: async (workspace) => {
      const detailKey = workspaceQueryKeys.detail(userId, slug);
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });
      queryClient.setQueryData(detailKey, workspace);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list(userId) }),
        queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.members(userId, slug) }),
      ]);
    },
  });
};
