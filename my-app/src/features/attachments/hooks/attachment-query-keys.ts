export const attachmentQueryKeys = {
  issue: (userId: string | undefined, slug: string, projectId: string, issueId: string) =>
    ["attachments", userId, slug, projectId, issueId] as const,
};
