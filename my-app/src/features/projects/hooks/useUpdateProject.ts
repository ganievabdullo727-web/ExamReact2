"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateProject, type UpdateProjectData } from "../api/project.api";
import { projectQueryKeys } from "./project-query-keys";

export const useUpdateProject = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: UpdateProjectData) => updateProject(slug, projectId, project),
    onSuccess: async (project) => {
      const detailKey = projectQueryKeys.detail(userId, slug, projectId);
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });
      queryClient.setQueryData(detailKey, project);
      return queryClient.invalidateQueries({ queryKey: projectQueryKeys.list(userId, slug) });
    },
  });
};
