export const projectQueryKeys = {
  list: (userId: string | undefined, slug: string) => ["projects", userId, slug, "list"] as const,
  detail: (userId: string | undefined, slug: string, projectId: string) =>
    ["projects", userId, slug, "detail", projectId] as const,
  members: (userId: string | undefined, slug: string, projectId: string) =>
    ["projects", userId, slug, "detail", projectId, "members"] as const,
};
