export const moduleQueryKeys = {
  project: (userId: string | undefined, slug: string, projectId: string) =>
    ["project-modules", userId, slug, projectId] as const,
  list: (userId: string | undefined, slug: string, projectId: string) =>
    [...moduleQueryKeys.project(userId, slug, projectId), "list"] as const,
  detail: (userId: string | undefined, slug: string, projectId: string, moduleId: string) =>
    [...moduleQueryKeys.project(userId, slug, projectId), "detail", moduleId] as const,
};
