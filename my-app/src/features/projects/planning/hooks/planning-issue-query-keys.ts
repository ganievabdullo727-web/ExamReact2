import type { PlanningContainer, PlanningIssuePage } from "../api/planning-issue.api";

const project = (userId: string | undefined, slug: string, projectId: string) =>
  ["project-planning-issues", userId, slug, projectId] as const;

export const planningIssueQueryKeys = {
  project,
  linked: (userId: string | undefined, slug: string, projectId: string, container: PlanningContainer) =>
    [...project(userId, slug, projectId), container.kind, container.id, "linked"] as const,
  available: (userId: string | undefined, slug: string, projectId: string, container: PlanningContainer, search: string) =>
    [...project(userId, slug, projectId), container.kind, container.id, "available", search] as const,
};

export function nextPlanningCursor(
  page: PlanningIssuePage,
  _pages: PlanningIssuePage[],
  _cursor: string | undefined,
  cursors: (string | undefined)[],
) {
  return page.next_cursor && !cursors.includes(page.next_cursor) ? page.next_cursor : undefined;
}
