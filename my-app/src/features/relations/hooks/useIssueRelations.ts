"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getIssueRelations } from "../api/relation.api";
import { relationQueryKeys } from "./relation-query-keys";

export const useIssueRelations = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: relationQueryKeys.issue(userId, slug, projectId, issueId),
    queryFn: ({ signal }) => getIssueRelations(slug, projectId, issueId, signal),
    enabled: Boolean(userId && slug && projectId && issueId),
    retry: false,
  });
};
