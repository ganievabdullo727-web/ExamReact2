"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createIssueComment, type CreateCommentData, type IssueComment } from "../api/comment.api";
import { commentMutationScope, refreshCommentChanges } from "./comment-mutation-cache";

export const useCreateComment = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: CreateCommentData) => createIssueComment(slug, projectId, issueId, comment),
    onMutate: () => commentMutationScope(userId, slug, projectId, issueId),
    onSuccess: async (comment, _input, scope) => {
      const queryKey = scope.comments;
      await queryClient.cancelQueries({ queryKey, exact: true });
      queryClient.setQueryData<IssueComment[]>(queryKey, (previous) => {
        if (!previous || previous.some((item) => item.id === comment.id)) return previous;
        return [...previous, comment];
      });
      await refreshCommentChanges(queryClient, scope, true);
    },
  });
};
