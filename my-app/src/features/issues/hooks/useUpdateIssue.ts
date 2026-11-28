"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activityQueryKeys } from "@/features/activity/hooks/activity-query-keys";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateIssue, type UpdateIssueData } from "../api/issue.api";
import { refreshIssueProjections, type IssueMutationScope } from "./issue-mutation-cache";
import { issueQueryKeys } from "./issue-query-keys";

export const useUpdateIssue = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UpdateIssueData) => updateIssue(slug, projectId, issueId, patch),
    onMutate: (): IssueMutationScope => ({ userId, slug, projectId, issueId }),
    onSuccess: async (issue, _patch, scope) => {
      const detailKey = issueQueryKeys.detail(scope.userId, scope.slug, scope.projectId, scope.issueId);
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });
      queryClient.setQueryData(detailKey, issue);
      await Promise.all([
        refreshIssueProjections(queryClient, scope),
        queryClient.invalidateQueries({
          queryKey: activityQueryKeys.issue(scope.userId, scope.slug, scope.projectId, scope.issueId),
          exact: true,
        }),
      ]);
    },
  });
};
