"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getWorkspace } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useWorkspace = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: workspaceQueryKeys.detail(userId, slug),
    queryFn: ({ signal }) => getWorkspace(slug, signal),
    enabled: Boolean(userId && slug),
    retry: false,
  });
};
