"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjects } from "../api/project.api";
import { projectQueryKeys } from "./project-query-keys";

export const useProjects = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: projectQueryKeys.list(userId, slug),
    queryFn: ({ signal }) => getProjects(slug, signal),
    enabled: Boolean(userId && slug),
    retry: false,
  });
};
