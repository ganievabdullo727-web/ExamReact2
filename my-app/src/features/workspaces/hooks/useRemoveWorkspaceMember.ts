"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { removeWorkspaceMember } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useRemoveWorkspaceMember = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeWorkspaceMember(slug, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.members(userId, slug) }),
  });
};
