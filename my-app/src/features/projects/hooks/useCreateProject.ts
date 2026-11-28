"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createProject, type CreateProjectData } from "../api/project.api";
import { projectQueryKeys } from "./project-query-keys";

export const useCreateProject = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: CreateProjectData) => createProject(slug, project),
    onSuccess: (project) => {
      queryClient.setQueryData(projectQueryKeys.detail(userId, slug, project.id), project);
      return queryClient.invalidateQueries({ queryKey: projectQueryKeys.list(userId, slug) });
    },
  });
};
