import type { QueryClient } from "@tanstack/react-query";
import { activityQueryKeys } from "@/features/activity/hooks/activity-query-keys";
import { attachmentQueryKeys } from "./attachment-query-keys";

export const attachmentMutationScope = (userId: string | undefined, slug: string, projectId: string, issueId: string) => ({
  attachments: attachmentQueryKeys.issue(userId, slug, projectId, issueId),
  activity: activityQueryKeys.issue(userId, slug, projectId, issueId),
});

export const refreshAttachmentChanges = (queryClient: QueryClient, scope: ReturnType<typeof attachmentMutationScope>) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: scope.attachments, exact: true }),
    queryClient.invalidateQueries({ queryKey: scope.activity, exact: true }),
  ]);
