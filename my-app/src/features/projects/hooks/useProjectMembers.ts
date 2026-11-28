"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectMembers } from "../api/project.api";
import { projectQueryKeys } from "./project-query-keys";

export const useProjectMembers = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: projectQueryKeys.members(userId, slug, projectId),
    queryFn: ({ signal }) => getProjectMembers(slug, projectId, signal),
    enabled: Boolean(userId && slug && projectId),
    retry: false,
  });
};
