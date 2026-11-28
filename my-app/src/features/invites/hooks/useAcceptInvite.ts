"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceQueryKeys } from "@/features/workspaces/hooks/workspace-query-keys";
import { acceptInvite, type WorkspaceInvite } from "../api/invite.api";
import { inviteQueryKey } from "./useInvite";

export const useAcceptInvite = (token: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invite, userId }: { invite: WorkspaceInvite; userId: string }) =>
      acceptInvite(token).then((result) => {
        if (result.workspace_id !== invite.workspace_id || result.user_id !== userId) {
          throw new Error("The response did not match this invitation.");
        }
        return result;
      }),
    onSuccess: (_, { invite, userId }) => {
      void queryClient.invalidateQueries({ queryKey: inviteQueryKey(token), exact: true, refetchType: "none" });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list(userId), exact: true }),
        queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(userId, invite.workspace.slug) }),
      ]);
    },
  });
};
