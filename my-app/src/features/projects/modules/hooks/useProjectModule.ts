"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectModule } from "../api/module.api";
import { moduleQueryKeys } from "./module-query-keys";

export function useProjectModule(slug: string, projectId: string, moduleId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: moduleQueryKeys.detail(userId, slug, projectId, moduleId),
    queryFn: async ({ signal }) => {
      const details = await getProjectModule(slug, projectId, moduleId, signal);
      if (details.project_id !== projectId) throw new Error("Module not found in this project.");
      return details;
    },
    enabled: Boolean(userId && slug && projectId && moduleId),
    retry: false,
  });
}
