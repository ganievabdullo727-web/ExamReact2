import type { QueryClient } from "@tanstack/react-query";
import { activityQueryKeys } from "@/features/activity/hooks/activity-query-keys";
import { commentQueryKeys } from "./comment-query-keys";

export const commentMutationScope = (
  userId: string | undefined,
  slug: string,
  projectId: string,
  issueId: string,
) => ({
  comments: commentQueryKeys.issue(userId, slug, projectId, issueId),
  activity: activityQueryKeys.issue(userId, slug, projectId, issueId),
});

export const refreshCommentChanges = (
  queryClient: QueryClient,
  scope: ReturnType<typeof commentMutationScope>,
  activityChanged: boolean,
) => {
  const refreshComments = queryClient.invalidateQueries({ queryKey: scope.comments, exact: true });
  return activityChanged
    ? Promise.all([
      refreshComments,
      queryClient.invalidateQueries({ queryKey: scope.activity, exact: true }),
    ])
    : refreshComments;
};
