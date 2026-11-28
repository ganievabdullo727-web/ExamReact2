import { api } from "@/shared/api/client";

export type CycleStatus = "upcoming" | "active" | "completed";

export type ProjectCycle = {
  id: string;
  workspace_id: string;
  project_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: CycleStatus;
  created_at: string;
  updated_at: string;
};

export type CycleProgress = {
  total: number;
  backlog: number;
  unstarted: number;
  started: number;
  completed: number;
  cancelled: number;
  completion_percentage: number;
};

export type ProjectCycleDetails = ProjectCycle & { progress: CycleProgress };
export type CreateCycleData = {
  name: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
};
export type UpdateCycleData = {
  name?: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

const collection = (slug: string, projectId: string) =>
  `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/cycles/`;
const detail = (slug: string, projectId: string, cycleId: string) =>
  `${collection(slug, projectId)}${encodeURIComponent(cycleId)}`;

export async function getProjectCycles(slug: string, projectId: string, signal?: AbortSignal) {
  const { data } = await api.get<ProjectCycle[]>(collection(slug, projectId), { signal });
  return data;
}

export async function getProjectCycle(slug: string, projectId: string, cycleId: string, signal?: AbortSignal) {
  const { data } = await api.get<ProjectCycleDetails>(detail(slug, projectId, cycleId), { signal });
  return data;
}

export async function createProjectCycle(slug: string, projectId: string, cycle: CreateCycleData) {
  const { data } = await api.post<ProjectCycle>(collection(slug, projectId), cycle);
  return data;
}

export async function updateProjectCycle(slug: string, projectId: string, cycleId: string, cycle: UpdateCycleData) {
  const { data } = await api.patch<ProjectCycle>(detail(slug, projectId, cycleId), cycle);
  return data;
}

export async function deleteProjectCycle(slug: string, projectId: string, cycleId: string) {
  await api.delete(detail(slug, projectId, cycleId));
}

export async function addIssuesToCycle(slug: string, projectId: string, cycleId: string, issueIds: string[]) {
  const { data } = await api.post<{ added: number }>(
    `${detail(slug, projectId, cycleId)}/issues`,
    { issue_ids: issueIds },
  );
  return data;
}

export async function removeIssueFromCycle(slug: string, projectId: string, cycleId: string, issueId: string) {
  await api.delete(`${detail(slug, projectId, cycleId)}/issues/${encodeURIComponent(issueId)}`);
}

