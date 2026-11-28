import { projectQueryKeys } from "../../hooks/project-query-keys";

export const stateQueryKeys = {
  list: (userId: string | undefined, slug: string, projectId: string) =>
    [...projectQueryKeys.detail(userId, slug, projectId), "states"] as const,
};
