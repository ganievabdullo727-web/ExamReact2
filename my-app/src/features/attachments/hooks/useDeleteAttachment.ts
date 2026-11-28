"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteIssueAttachment, type IssueAttachment } from "../api/attachment.api";
import { attachmentMutationScope, refreshAttachmentChanges } from "./attachment-mutation-cache";

export const useDeleteAttachment = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => deleteIssueAttachment(slug, projectId, attachmentId),
    onMutate: () => attachmentMutationScope(userId, slug, projectId, issueId),
    onSuccess: async (_result, attachmentId, scope) => {
      const queryKey = scope.attachments;
      await queryClient.cancelQueries({ queryKey, exact: true });
      queryClient.setQueryData<IssueAttachment[]>(queryKey, (items) => items?.filter((item) => item.id !== attachmentId));
    },
    onSettled: (_result, _error, _input, scope) => {
      if (scope) return refreshAttachmentChanges(queryClient, scope);
    },
  });
};
