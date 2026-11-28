import type { IssueListFilters } from "../api/issue.api";

const project = (userId: string | undefined, slug: string, projectId: string) =>
  ["issues", userId, slug, projectId] as const;

const lists = (userId: string | undefined, slug: string, projectId: string) =>
  [...project(userId, slug, projectId), "list"] as const;

export const issueQueryKeys = {
  lists,
  list: (
    userId: string | undefined,
    slug: string,
    projectId: string,
    filters: IssueListFilters,
  ) => [...lists(userId, slug, projectId), filters] as const,
  detail: (userId: string | undefined, slug: string, projectId: string, issueId: string) =>
    [...project(userId, slug, projectId), "detail", issueId] as const,
};
