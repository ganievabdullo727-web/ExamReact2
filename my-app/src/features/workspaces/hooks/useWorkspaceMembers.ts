"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getWorkspaceMembers } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useWorkspaceMembers = (slug: string) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: workspaceQueryKeys.members(userId, slug),
    queryFn: ({ signal }) => getWorkspaceMembers(slug, signal),
    enabled: Boolean(userId && slug),
    retry: false,
  });
};
