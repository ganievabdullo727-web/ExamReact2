"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getAvailablePlanningIssues, type PlanningContainer } from "../api/planning-issue.api";
import { nextPlanningCursor, planningIssueQueryKeys } from "./planning-issue-query-keys";

export const useAvailablePlanningIssues = (
  slug: string,
  projectId: string,
  container: PlanningContainer,
  search: string,
  enabled: boolean,
) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useInfiniteQuery({
    queryKey: planningIssueQueryKeys.available(userId, slug, projectId, container, search),
    queryFn: ({ pageParam, signal }) => getAvailablePlanningIssues(slug, projectId, container, search, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextPlanningCursor,
    enabled: enabled && Boolean(userId && slug && projectId && container.id),
    retry: false,
  });
};
