"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateIssueComment, type IssueComment, type UpdateCommentData } from "../api/comment.api";
import { commentMutationScope, refreshCommentChanges } from "./comment-mutation-cache";

export const useUpdateComment = (slug: string, projectId: string, issueId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, body }: UpdateCommentData & { commentId: string }) =>
      updateIssueComment(slug, projectId, issueId, commentId, { body }),
    onMutate: () => commentMutationScope(userId, slug, projectId, issueId),
    onSuccess: async (comment, _input, scope) => {
      const queryKey = scope.comments;
      await queryClient.cancelQueries({ queryKey, exact: true });
      queryClient.setQueryData<IssueComment[]>(queryKey, (previous) =>
        previous?.map((item) => item.id === comment.id && !item.deleted_at ? comment : item),
      );
    },
    onSettled: (_comment, error, _input, scope) => {
      if (scope) return refreshCommentChanges(queryClient, scope, !error);
    },
  });
};
