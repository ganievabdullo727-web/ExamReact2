"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteProjectLabel, type ProjectLabel } from "../api/label.api";
import { projectLabelsQueryKey } from "./label-query-key";

export const useDeleteProjectLabel = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const queryKey = projectLabelsQueryKey(userId, slug, projectId);

  return useMutation({
    mutationFn: (labelId: string) => deleteProjectLabel(slug, projectId, labelId),
    onSuccess: async (_, labelId) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<ProjectLabel[]>(queryKey, (labels) =>
        labels?.filter((label) => label.id !== labelId));
      await queryClient.invalidateQueries({ queryKey });
    },
  });
};
