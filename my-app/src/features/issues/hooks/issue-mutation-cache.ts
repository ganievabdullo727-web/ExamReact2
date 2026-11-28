import type { QueryClient } from "@tanstack/react-query";
import { cycleQueryKeys } from "@/features/projects/cycles/hooks/cycle-query-keys";
import { moduleQueryKeys } from "@/features/projects/modules/hooks/module-query-keys";
import { planningIssueQueryKeys } from "@/features/projects/planning/hooks/planning-issue-query-keys";
import { issueQueryKeys } from "./issue-query-keys";

export type IssueMutationScope = {
  userId: string | undefined;
  slug: string;
  projectId: string;
  issueId: string;
};

export const refreshIssueProjections = (
  queryClient: QueryClient,
  { userId, slug, projectId }: IssueMutationScope,
) => Promise.all([
  queryClient.invalidateQueries({ queryKey: issueQueryKeys.lists(userId, slug, projectId) }),
  queryClient.invalidateQueries({ queryKey: planningIssueQueryKeys.project(userId, slug, projectId) }),
  queryClient.invalidateQueries({ queryKey: cycleQueryKeys.root(userId, slug, projectId) }),
  queryClient.invalidateQueries({ queryKey: moduleQueryKeys.project(userId, slug, projectId) }),
]);
