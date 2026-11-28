export const workspaceQueryKeys = {
  list: (userId: string | undefined) => ["workspaces", userId, "list"] as const,

  detail: (userId: string | undefined, slug: string) =>
    ["workspaces", userId, "detail", slug] as const,
  
  members: (userId: string | undefined, slug: string) =>
    ["workspaces", userId, "detail", slug, "members"] as const,
};
