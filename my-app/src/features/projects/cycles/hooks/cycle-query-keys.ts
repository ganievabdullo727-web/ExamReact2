export const cycleQueryKeys = {
  root: (userId: string | undefined, slug: string, projectId: string) =>
    ["project-cycles", userId, slug, projectId] as const,
  list: (userId: string | undefined, slug: string, projectId: string) =>
    [...cycleQueryKeys.root(userId, slug, projectId), "list"] as const,
  detail: (userId: string | undefined, slug: string, projectId: string, cycleId: string) =>
    [...cycleQueryKeys.root(userId, slug, projectId), "detail", cycleId] as const,
};

