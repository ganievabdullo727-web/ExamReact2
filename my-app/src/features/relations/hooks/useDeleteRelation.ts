"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteIssueRelation, type IssueRelation } from "../api/relation.api";
import { refreshRelationSides, relationQueryKeys } from "./relation-query-keys";

export const useDeleteRelation = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relation: IssueRelation) => deleteIssueRelation(slug, projectId, issueId, relation.id),
    onMutate: () => relationQueryKeys.issue(userId, slug, projectId, issueId),
    onSettled: (_data, _error, relation, queryKey) => {
      if (queryKey) return refreshRelationSides(queryClient, queryKey, relation);
    },
  });
};
