"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { planningIssueQueryKeys } from "@/features/projects/planning/hooks/planning-issue-query-keys";
import { createIssue, type CreateIssueData } from "../api/issue.api";
import { issueQueryKeys } from "./issue-query-keys";

export const useCreateIssue = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issue: CreateIssueData) => createIssue(slug, projectId, issue),
    onSuccess: async (issue) => {
      queryClient.setQueryData(issueQueryKeys.detail(userId, slug, projectId, issue.id), issue);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: issueQueryKeys.lists(userId, slug, projectId) }),
        queryClient.invalidateQueries({ queryKey: planningIssueQueryKeys.project(userId, slug, projectId) }),
      ]);
    },
  });
};
