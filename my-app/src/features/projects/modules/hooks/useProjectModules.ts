"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectModules } from "../api/module.api";
import { moduleQueryKeys } from "./module-query-keys";

export function useProjectModules(slug: string, projectId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: moduleQueryKeys.list(userId, slug, projectId),
    queryFn: ({ signal }) => getProjectModules(slug, projectId, signal),
    enabled: Boolean(userId && slug && projectId),
    retry: false,
  });
}
