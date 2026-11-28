"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getGroupedIssues, getIssues, type IssueGroupBy, type IssueListFilters } from "../api/issue.api";
import { issueQueryKeys } from "./issue-query-keys";

export const useIssues = (
  slug: string,
  projectId: string,
  filters: IssueListFilters = {},
  enabled = true,
) => {
  const userId = useAuthStore((state) => state.user?.id);
  const normalizedFilters: IssueListFilters = {
    ...filters,
    search: filters.search?.trim() || undefined,
    state: filters.state || undefined,
    priority: filters.priority,
    parent_id: filters.parent_id || undefined,
  };

  return useInfiniteQuery({
    queryKey: issueQueryKeys.list(userId, slug, projectId, normalizedFilters),
    queryFn: ({ pageParam, signal }) =>
      getIssues(slug, projectId, normalizedFilters, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: ({ next_cursor }, _pages, _pageParam, cursors) =>
      next_cursor && !cursors.includes(next_cursor) ? next_cursor : undefined,
    enabled: enabled && Boolean(userId && slug && projectId),
    retry: false,
  });
};

export const useGroupedIssues = (slug: string, projectId: string, filters: IssueListFilters, groupBy: IssueGroupBy | undefined) => {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: [...issueQueryKeys.lists(userId, slug, projectId), "grouped", groupBy, filters],
    queryFn: ({ signal }) => getGroupedIssues(slug, projectId, filters, groupBy ?? "state", signal),
    enabled: Boolean(userId && slug && projectId && groupBy),
    retry: false,
  });
};
