import { projectQueryKeys } from "../../hooks/project-query-keys";

export const projectLabelsQueryKey = (userId: string | undefined, slug: string, projectId: string) =>
  [...projectQueryKeys.detail(userId, slug, projectId), "labels"] as const;
