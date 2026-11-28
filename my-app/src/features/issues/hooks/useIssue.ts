"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getIssue } from "../api/issue.api";
import { issueQueryKeys } from "./issue-query-keys";

export const useIssue = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: issueQueryKeys.detail(userId, slug, projectId, issueId),
    queryFn: ({ signal }) => getIssue(slug, projectId, issueId, signal),
    enabled: Boolean(userId && slug && projectId && issueId),
    retry: false,
  });
};
