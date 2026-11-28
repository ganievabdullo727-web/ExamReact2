"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteIssueComment, type IssueComment } from "../api/comment.api";
import { commentMutationScope, refreshCommentChanges } from "./comment-mutation-cache";

export const useDeleteComment = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteIssueComment(slug, projectId, issueId, commentId),
    onMutate: () => commentMutationScope(userId, slug, projectId, issueId),
    onSuccess: async (_result, commentId, scope) => {
      const queryKey = scope.comments;
      await queryClient.cancelQueries({ queryKey, exact: true });
      const deletedAt = new Date().toISOString();
      queryClient.setQueryData<IssueComment[]>(queryKey, (previous) =>
        previous?.map((item) =>
          item.id === commentId
            ? { ...item, body: "", deleted_at: item.deleted_at ?? deletedAt }
            : item,
        ),
      );
    },
    onSettled: (_result, error, _input, scope) => {
      if (scope) return refreshCommentChanges(queryClient, scope, !error);
    },
  });
};
