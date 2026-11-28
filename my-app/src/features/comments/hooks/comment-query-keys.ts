export const commentQueryKeys = {
  issue: (userId: string | undefined, slug: string, projectId: string, issueId: string) =>
    ["comments", userId, slug, projectId, issueId] as const,
};
