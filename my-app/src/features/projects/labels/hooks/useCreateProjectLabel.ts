"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createProjectLabel, type CreateProjectLabelData, type ProjectLabel } from "../api/label.api";
import { projectLabelsQueryKey } from "./label-query-key";

export const useCreateProjectLabel = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const queryKey = projectLabelsQueryKey(userId, slug, projectId);

  return useMutation({
    mutationFn: (label: CreateProjectLabelData) => createProjectLabel(slug, projectId, label),
    onSuccess: async (label) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<ProjectLabel[]>(queryKey, (labels) =>
        labels && [...labels.filter((current) => current.id !== label.id), label]);
      await queryClient.invalidateQueries({ queryKey });
    },
  });
};
