"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateProjectCycle, type UpdateCycleData } from "../api/cycle.api";
import { cycleQueryKeys } from "./cycle-query-keys";

export const useUpdateProjectCycle = (slug: string, projectId: string, cycleId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycle: UpdateCycleData) => updateProjectCycle(slug, projectId, cycleId, cycle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cycleQueryKeys.root(userId, slug, projectId) }),
  });
};

