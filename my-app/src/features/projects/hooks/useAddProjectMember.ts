"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { addProjectMember, type AddProjectMemberData } from "../api/project.api";
import { projectQueryKeys } from "./project-query-keys";

export const useAddProjectMember = (slug: string, projectId: string) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: AddProjectMemberData) => addProjectMember(slug, projectId, member),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: projectQueryKeys.members(userId, slug, projectId),
    }),
  });
};
