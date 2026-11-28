"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectStates } from "../api/state.api";
import { stateQueryKeys } from "./state-query-keys";

export const useProjectStates = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: stateQueryKeys.list(userId, slug, projectId),
    queryFn: ({ signal }) => getProjectStates(slug, projectId, signal),
    enabled: Boolean(userId && slug && projectId),
    retry: false,
  });
};
