"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectCycle } from "../api/cycle.api";
import { cycleQueryKeys } from "./cycle-query-keys";

export const useProjectCycle = (slug: string, projectId: string, cycleId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: cycleQueryKeys.detail(userId, slug, projectId, cycleId),
    queryFn: ({ signal }) => getProjectCycle(slug, projectId, cycleId, signal),
    enabled: Boolean(userId && slug && projectId && cycleId),
    retry: false,
  });
};

