"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createProjectState, type CreateProjectStateData } from "../api/state.api";
import { stateQueryKeys } from "./state-query-keys";

export const useCreateProjectState = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (state: CreateProjectStateData) => createProjectState(slug, projectId, state),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: stateQueryKeys.list(userId, slug, projectId),
    }),
  });
};
