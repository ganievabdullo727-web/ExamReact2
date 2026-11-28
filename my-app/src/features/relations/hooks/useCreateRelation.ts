"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createIssueRelation, type CreateRelationData } from "../api/relation.api";
import { refreshRelationSides, relationQueryKeys } from "./relation-query-keys";

export const useCreateRelation = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relation: CreateRelationData) => createIssueRelation(slug, projectId, issueId, relation),
    onMutate: () => relationQueryKeys.issue(userId, slug, projectId, issueId),
    onSuccess: (relation, _input, queryKey) => refreshRelationSides(queryClient, queryKey, relation),
    onError: (_error, _input, queryKey) => {
      if (queryKey) return queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
};
