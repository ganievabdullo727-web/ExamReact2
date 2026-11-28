"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { removeProjectMember } from "../api/project.api";
import { projectQueryKeys } from "./project-query-keys";

export const useRemoveProjectMember = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeProjectMember(slug, projectId, memberId),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: projectQueryKeys.members(userId, slug, projectId),
    }),
  });
};
