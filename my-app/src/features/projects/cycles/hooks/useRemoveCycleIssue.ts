"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { removeIssueFromCycle } from "../api/cycle.api";
import { cycleQueryKeys } from "./cycle-query-keys";

export const useRemoveCycleIssue = (slug: string, projectId: string, cycleId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => removeIssueFromCycle(slug, projectId, cycleId, issueId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cycleQueryKeys.root(userId, slug, projectId) }),
  });
};

