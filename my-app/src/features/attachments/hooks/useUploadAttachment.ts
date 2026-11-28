"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { uploadIssueAttachment, type UploadAttachmentInput } from "../api/attachment.api";
import { attachmentMutationScope, refreshAttachmentChanges } from "./attachment-mutation-cache";

export const useUploadAttachment = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadAttachmentInput) => uploadIssueAttachment(slug, projectId, issueId, input),
    onMutate: () => attachmentMutationScope(userId, slug, projectId, issueId),
    // Even a failed storage upload can have registered or removed metadata and recorded activity.
    onSettled: (_result, _error, _input, scope) => {
      if (scope) return refreshAttachmentChanges(queryClient, scope);
    },
  });
};
