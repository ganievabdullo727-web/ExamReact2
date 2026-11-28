"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateProjectState, type UpdateProjectStateData } from "../api/state.api";
import { stateQueryKeys } from "./state-query-keys";

export const useUpdateProjectState = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stateId, state }: { stateId: string; state: UpdateProjectStateData }) =>
      updateProjectState(slug, projectId, stateId, state),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: stateQueryKeys.list(userId, slug, projectId),
    }),
  });
};
