"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectLabels } from "../api/label.api";
import { projectLabelsQueryKey } from "./label-query-key";

export const useProjectLabels = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: projectLabelsQueryKey(userId, slug, projectId),
    queryFn: ({ signal }) => getProjectLabels(slug, projectId, signal),
    enabled: Boolean(userId && slug && projectId),
    retry: false,
  });
};
