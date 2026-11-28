export const activityQueryKeys = {
  issue: (userId: string | undefined, slug: string, projectId: string, issueId: string) =>
    ["activity", userId, slug, projectId, issueId] as const,
};
