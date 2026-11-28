"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getIssueActivity } from "../api/activity.api";
import { activityQueryKeys } from "./activity-query-keys";

export const useIssueActivity = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useInfiniteQuery({
    queryKey: activityQueryKeys.issue(userId, slug, projectId, issueId),
    queryFn: ({ pageParam, signal }) =>
      getIssueActivity(slug, projectId, issueId, pageParam ?? undefined, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage, _pages, _lastPageParam, pageParams) =>
      lastPage.next_cursor && !pageParams.includes(lastPage.next_cursor)
        ? lastPage.next_cursor
        : undefined,
    enabled: Boolean(userId && slug && projectId && issueId),
    refetchOnWindowFocus: true,
    retry: false,
  });
};
