import type { QueryClient } from "@tanstack/react-query";
import type { IssueRelation } from "../api/relation.api";

const issue = (userId: string | undefined, slug: string, projectId: string, issueId: string) =>
  ["relations", userId, slug, projectId, issueId] as const;

export const relationQueryKeys = { issue };

export function refreshRelationSides(
  queryClient: QueryClient,
  queryKey: ReturnType<typeof issue>,
  relation: IssueRelation,
) {
  const [, userId, slug] = queryKey;
  // The server owns the reverse record, including its ID and direction.
  const mirrorKey = issue(userId, slug, relation.related_issue.project_id, relation.related_issue_id);
  return Promise.all([
    queryClient.invalidateQueries({ queryKey, exact: true }),
    queryClient.invalidateQueries({ queryKey: mirrorKey, exact: true }),
  ]);
}
