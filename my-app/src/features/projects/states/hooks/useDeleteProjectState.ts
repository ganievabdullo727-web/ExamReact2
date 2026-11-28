"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteProjectState } from "../api/state.api";
import { stateQueryKeys } from "./state-query-keys";

export const useDeleteProjectState = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stateId, transferToStateId }: { stateId: string; transferToStateId: string }) =>
      deleteProjectState(slug, projectId, stateId, { transfer_to_state_id: transferToStateId }),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: stateQueryKeys.list(userId, slug, projectId),
    }),
  });
};
