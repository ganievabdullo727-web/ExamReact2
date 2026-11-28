"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteProject } from "../api/project.api";
import { projectQueryKeys } from "./project-query-keys";

export const useDeleteProject = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteProject(slug, projectId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: projectQueryKeys.detail(userId, slug, projectId) });
      return queryClient.invalidateQueries({ queryKey: projectQueryKeys.list(userId, slug) });
    },
  });
};
