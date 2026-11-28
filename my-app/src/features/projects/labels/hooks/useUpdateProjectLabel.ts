"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateProjectLabel, type ProjectLabel, type UpdateProjectLabelData } from "../api/label.api";
import { projectLabelsQueryKey } from "./label-query-key";

export const useUpdateProjectLabel = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const queryKey = projectLabelsQueryKey(userId, slug, projectId);

  return useMutation({
    mutationFn: ({ labelId, label }: { labelId: string; label: UpdateProjectLabelData }) =>
      updateProjectLabel(slug, projectId, labelId, label),
    onSuccess: async (label) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<ProjectLabel[]>(queryKey, (labels) =>
        labels?.map((current) => (current.id === label.id ? label : current)));
      await queryClient.invalidateQueries({ queryKey });
    },
  });
};
