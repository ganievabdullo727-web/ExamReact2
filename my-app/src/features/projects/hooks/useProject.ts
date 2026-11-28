"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProject } from "../api/project.api";
import { projectQueryKeys } from "./project-query-keys";

export const useProject = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: projectQueryKeys.detail(userId, slug, projectId),
    queryFn: ({ signal }) => getProject(slug, projectId, signal),
    enabled: Boolean(userId && slug && projectId),
    retry: false,
  });
};
