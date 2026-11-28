"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getWorkspaces } from "../api/workspace.api";
import { workspaceQueryKeys } from "./workspace-query-keys";

export const useWorkspaces = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: workspaceQueryKeys.list(userId),
    queryFn: ({ signal }) => getWorkspaces(signal),
    enabled: Boolean(userId),
    retry: false,
  });
};
