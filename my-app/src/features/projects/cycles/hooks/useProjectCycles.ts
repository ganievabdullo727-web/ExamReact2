"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectCycles } from "../api/cycle.api";
import { cycleQueryKeys } from "./cycle-query-keys";

export const useProjectCycles = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: cycleQueryKeys.list(userId, slug, projectId),
    queryFn: ({ signal }) => getProjectCycles(slug, projectId, signal),
    enabled: Boolean(userId && slug && projectId),
    retry: false,
  });
};

