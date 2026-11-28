"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { addIssuesToCycle } from "../api/cycle.api";
import { cycleQueryKeys } from "./cycle-query-keys";

export const useAddCycleIssues = (slug: string, projectId: string, cycleId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueIds: string[]) => addIssuesToCycle(slug, projectId, cycleId, issueIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cycleQueryKeys.root(userId, slug, projectId) }),
  });
};

