"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateWorkspaceMember, type EditableWorkspaceRole } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

type MemberRoleChange = { userId: string; role: EditableWorkspaceRole };

export const useUpdateWorkspaceMember = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId: memberId, role }: MemberRoleChange) =>
      updateWorkspaceMember(slug, memberId, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.members(userId, slug) }),
  });
};
