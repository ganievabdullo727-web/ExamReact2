"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getGroupedIssues, getIssues, type Issue, type IssueListFilters } from "../api/issue.api";
import { issueQueryKeys } from "./issue-query-keys";

export const issueAssignmentDetailsKey = (userId: string | undefined, slug: string, projectId: string, issueId: string) =>
  [...issueQueryKeys.detail(userId, slug, projectId, issueId), "assignment-metadata"] as const;

async function issueHasLabel(slug: string, issue: Issue, filter: IssueListFilters, label: string, signal: AbortSignal) {
  const cursors = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await getIssues(slug, issue.project_id, { ...filter, label }, cursor, signal);
    if (page.data.some(({ id }) => id === issue.id)) return true;
    cursor = page.next_cursor ?? undefined;
    if (!cursor || cursors.has(cursor)) return false;
    cursors.add(cursor);
  } while (cursor);
  return false;
}

export function useIssueAssignmentDetails(slug: string, issue: Issue, labelIds: string[] | undefined) {
  const userId = useAuthStore((state) => state.user?.id);
  const key = issueAssignmentDetailsKey(userId, slug, issue.project_id, issue.id);
  const created = new Date(issue.created_at);
  // Older issue serializers return empty objects for join rows. The scoped
  // list filters still operate on the underlying member and label IDs.
  const filters: IssueListFilters = Number.isNaN(created.getTime()) ? { search: issue.title } : {
    created_before: created.toISOString(),
    created_after: created.toISOString(),
  };

  const assignees = useQuery({
    queryKey: [...key, "assignees"],
    queryFn: async ({ signal }) => {
      const groups = await getGroupedIssues(slug, issue.project_id, filters, "assignee", signal);
      return groups.flatMap(({ key, issues }) => key && issues.some(({ id }) => id === issue.id) ? [key] : []);
    },
    enabled: Boolean(userId && issue.assigneesUnavailable),
    retry: false,
  });
  const labels = useQuery({
    queryKey: [...key, "labels", labelIds],
    queryFn: async ({ signal }) => {
      const attached: string[] = [];
      const candidates = labelIds ?? [];
      for (let index = 0; index < candidates.length; index += 6) {
        const matches = await Promise.all(candidates.slice(index, index + 6).map(async (id) =>
          await issueHasLabel(slug, issue, filters, id, signal) ? id : null,
        ));
        attached.push(...matches.filter((id): id is string => id !== null));
      }
      return attached;
    },
    enabled: Boolean(userId && issue.labelsUnavailable && labelIds),
    retry: false,
  });
  return { assignees, labels };
}
