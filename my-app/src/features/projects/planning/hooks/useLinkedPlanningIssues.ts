"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getPlanningIssues, type PlanningContainer } from "../api/planning-issue.api";
import { nextPlanningCursor, planningIssueQueryKeys } from "./planning-issue-query-keys";

export const useLinkedPlanningIssues = (slug: string, projectId: string, container: PlanningContainer) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useInfiniteQuery({
    queryKey: planningIssueQueryKeys.linked(userId, slug, projectId, container),
    queryFn: ({ pageParam, signal }) => getPlanningIssues(slug, projectId, { container, cursor: pageParam }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextPlanningCursor,
    enabled: Boolean(userId && slug && projectId && container.id),
    retry: false,
  });
};
