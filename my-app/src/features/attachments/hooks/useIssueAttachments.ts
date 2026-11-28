"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getIssueAttachments } from "../api/attachment.api";
import { attachmentQueryKeys } from "./attachment-query-keys";

export const useIssueAttachments = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: attachmentQueryKeys.issue(userId, slug, projectId, issueId),
    queryFn: ({ signal }) => getIssueAttachments(slug, projectId, issueId, signal),
    enabled: Boolean(userId && slug && projectId && issueId),
    retry: false,
  });
};
