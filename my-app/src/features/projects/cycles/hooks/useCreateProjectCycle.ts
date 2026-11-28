"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createProjectCycle, type CreateCycleData } from "../api/cycle.api";
import { cycleQueryKeys } from "./cycle-query-keys";

export const useCreateProjectCycle = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycle: CreateCycleData) => createProjectCycle(slug, projectId, cycle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cycleQueryKeys.list(userId, slug, projectId) }),
  });
};

