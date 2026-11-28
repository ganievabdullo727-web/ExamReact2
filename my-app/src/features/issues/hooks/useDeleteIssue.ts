"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteIssue, type IssuePage } from "../api/issue.api";
import { refreshIssueProjections, type IssueMutationScope } from "./issue-mutation-cache";
import { issueQueryKeys } from "./issue-query-keys";

export const useDeleteIssue = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteIssue(slug, projectId, issueId),
    onMutate: (): IssueMutationScope => ({ userId, slug, projectId, issueId }),
    onSuccess: async (_result, _variables, scope) => {
      const detailKey = issueQueryKeys.detail(scope.userId, scope.slug, scope.projectId, scope.issueId);
      const listKey = issueQueryKeys.lists(scope.userId, scope.slug, scope.projectId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey, exact: true }),
        queryClient.cancelQueries({ queryKey: listKey }),
      ]);

      queryClient.removeQueries({ queryKey: detailKey, exact: true });
      queryClient.setQueriesData<InfiniteData<IssuePage>>({ queryKey: listKey }, (list) =>
        list && {
          ...list,
          pages: list.pages.map((page) => ({
            ...page,
            data: page.data.filter((issue) => issue.id !== scope.issueId),
          })),
        });

      await refreshIssueProjections(queryClient, scope);
    },
  });
};
