"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getIssueComments } from "../api/comment.api";
import { commentQueryKeys } from "./comment-query-keys";

export const useComments = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: commentQueryKeys.issue(userId, slug, projectId, issueId),
    queryFn: ({ signal }) => getIssueComments(slug, projectId, issueId, signal),
    enabled: Boolean(userId && slug && projectId && issueId),
    retry: false,
  });
};
