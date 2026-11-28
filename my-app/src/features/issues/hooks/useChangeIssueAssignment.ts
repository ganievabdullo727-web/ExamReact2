"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activityQueryKeys } from "@/features/activity/hooks/activity-query-keys";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { changeIssueAssignment, type IssueAssignmentChange } from "../api/issue.api";
import { refreshIssueProjections } from "./issue-mutation-cache";
import { issueQueryKeys } from "./issue-query-keys";
import { issueAssignmentDetailsKey } from "./useIssueAssignmentDetails";

export function useChangeIssueAssignment(slug: string, projectId: string, issueId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (change: IssueAssignmentChange) => changeIssueAssignment(slug, projectId, issueId, change),
    onMutate: () => ({ userId, slug, projectId, issueId }),
    onSuccess: async (issue, _change, scope) => {
      const detailKey = issueQueryKeys.detail(scope.userId, scope.slug, scope.projectId, scope.issueId);
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });
      queryClient.setQueryData(detailKey, issue);
      await Promise.all([
        refreshIssueProjections(queryClient, scope),
        queryClient.invalidateQueries({ queryKey: activityQueryKeys.issue(scope.userId, scope.slug, scope.projectId, scope.issueId), exact: true }),
        queryClient.invalidateQueries({ queryKey: issueAssignmentDetailsKey(scope.userId, scope.slug, scope.projectId, scope.issueId) }),
      ]);
    },
  });
}
