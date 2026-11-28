"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteProjectCycle, type ProjectCycle } from "../api/cycle.api";
import { cycleQueryKeys } from "./cycle-query-keys";

export const useDeleteProjectCycle = (slug: string, projectId: string, cycleId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const listKey = cycleQueryKeys.list(userId, slug, projectId);
  const detailKey = cycleQueryKeys.detail(userId, slug, projectId, cycleId);

  return useMutation({
    mutationFn: () => deleteProjectCycle(slug, projectId, cycleId),
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: listKey, exact: true });
      queryClient.removeQueries({ queryKey: detailKey, exact: true });
      queryClient.setQueryData<ProjectCycle[]>(listKey, (cycles) => cycles?.filter((cycle) => cycle.id !== cycleId));
      await queryClient.invalidateQueries({ queryKey: listKey, exact: true });
    },
  });
};

