"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  addIssuesToModule,
  createProjectModule,
  deleteProjectModule,
  removeIssueFromModule,
  updateProjectModule,
  type CreateModuleData,
  type ProjectModuleDetail,
  type UpdateModuleData,
} from "../api/module.api";
import { moduleQueryKeys } from "./module-query-keys";

export function useCreateModule(slug: string, projectId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModuleData) => createProjectModule(slug, projectId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: moduleQueryKeys.list(userId, slug, projectId) }),
  });
}

export function useModuleMutations(slug: string, projectId: string, moduleId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const detailKey = moduleQueryKeys.detail(userId, slug, projectId, moduleId);
  const listKey = moduleQueryKeys.list(userId, slug, projectId);
  const refreshProgress = () => queryClient.invalidateQueries({ queryKey: detailKey });
  const update = useMutation({
    mutationFn: (data: UpdateModuleData) => updateProjectModule(slug, projectId, moduleId, data),
    onSuccess: async (saved) => {
      if (saved.project_id === projectId) {
        queryClient.setQueryData<ProjectModuleDetail>(detailKey, (current) =>
          current ? { ...current, ...saved } : current);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listKey }),
        refreshProgress(),
      ]);
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteProjectModule(slug, projectId, moduleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKey }),
  });
  const addIssues = useMutation({
    mutationFn: (issueIds: string[]) => addIssuesToModule(slug, projectId, moduleId, issueIds),
    onSuccess: refreshProgress,
  });
  const removeIssue = useMutation({
    mutationFn: (issueId: string) => removeIssueFromModule(slug, projectId, moduleId, issueId),
    onSuccess: refreshProgress,
  });

  return { update, remove, addIssues, removeIssue };
}
