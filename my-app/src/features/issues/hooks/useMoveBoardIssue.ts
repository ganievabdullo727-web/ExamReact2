"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { activityQueryKeys } from "@/features/activity/hooks/activity-query-keys";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getIssue, updateIssue, type Issue, type IssueListFilters, type IssuePage } from "../api/issue.api";
import type { BoardChange } from "../components/board-order";
import { refreshIssueProjections } from "./issue-mutation-cache";
import { issueQueryKeys } from "./issue-query-keys";

export const boardIssueFilters = { sort_by: "sort_order", order: "asc" } satisfies IssueListFilters;
type BoardData = InfiniteData<IssuePage, string | undefined>;

function mapBoardIssues(data: BoardData | undefined, mapIssue: (issue: Issue) => Issue) {
  return data && { ...data, pages: data.pages.map((page) => ({ ...page, data: page.data.map(mapIssue) })) };
}

export function useMoveBoardIssue(slug: string, projectId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const boardKey = issueQueryKeys.list(userId, slug, projectId, boardIssueFilters);

  return useMutation({
    mutationFn: async ({ changes }: { issueId: string; changes: BoardChange[] }) => {
      const saved: { change: BoardChange; updated: Issue }[] = [];
      try {
        for (const change of changes) {
          const updated = await updateIssue(slug, projectId, change.issue.id, change.patch);
          saved.push({ change, updated });
        }
        return saved.map(({ updated }) => updated);
      } catch (error) {
        // The API updates one card at a time. Recover written neighbor ranks if a later request fails.
        for (const { change, updated } of saved.reverse()) {
          try {
            const current = await getIssue(slug, projectId, updated.id);
            if (current.sort_order === updated.sort_order) {
              await updateIssue(slug, projectId, updated.id, { sort_order: change.issue.sort_order });
            }
          } catch {
            // The following refetch reconciles any server change that could not be reversed.
          }
        }
        throw error;
      }
    },
    onMutate: async ({ changes }) => {
      await queryClient.cancelQueries({ queryKey: boardKey, exact: true });
      const previous = queryClient.getQueryData<BoardData>(boardKey);
      const patches = new Map(changes.map(({ issue, patch }) => [issue.id, patch]));
      queryClient.setQueryData<BoardData>(boardKey, (data) => mapBoardIssues(data, (issue) => {
        const patch = patches.get(issue.id);
        return patch ? { ...issue, ...patch } : issue;
      }));
      return { previous, userId, boardKey };
    },
    onError: (_error, _input, snapshot) => {
      if (snapshot?.previous) queryClient.setQueryData(snapshot.boardKey, snapshot.previous);
    },
    onSuccess: async (issues, _input, snapshot) => {
      const updated = new Map(issues.map((issue) => [issue.id, issue]));
      queryClient.setQueryData<BoardData>(snapshot.boardKey, (data) =>
        mapBoardIssues(data, (issue) => updated.get(issue.id) ?? issue));
      await Promise.all(issues.map(async (issue) => {
        const detail = issueQueryKeys.detail(snapshot.userId, slug, projectId, issue.id);
        await queryClient.cancelQueries({ queryKey: detail, exact: true });
        queryClient.setQueryData(detail, issue);
      }));
    },
    onSettled: async (_issues, error, { issueId, changes }, snapshot) => {
      const accountId = snapshot?.userId;
      const detailRefresh = error ? changes.map(({ issue }) => queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(accountId, slug, projectId, issue.id), exact: true,
      })) : [];
      await Promise.all([
        ...detailRefresh,
        refreshIssueProjections(queryClient, { userId: accountId, slug, projectId, issueId }),
        queryClient.invalidateQueries({ queryKey: activityQueryKeys.issue(accountId, slug, projectId, issueId), exact: true }),
      ]);
    },
  });
}
