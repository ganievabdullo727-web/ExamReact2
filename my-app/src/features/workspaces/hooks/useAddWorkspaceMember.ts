"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { addWorkspaceMember, type AddWorkspaceMemberData } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useAddWorkspaceMember = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: AddWorkspaceMemberData) => addWorkspaceMember(slug, member),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.members(userId, slug) }),
  });
};
