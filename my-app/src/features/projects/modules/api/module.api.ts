import { api } from "@/shared/api/client";

export const moduleStatuses = ["backlog", "in_progress", "paused", "completed", "cancelled"] as const;
export type ModuleStatus = (typeof moduleStatuses)[number];

export type ProjectModule = {
  id: string;
  workspace_id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: ModuleStatus;
  lead_id: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ModuleProgress = {
  total: number;
  backlog: number;
  unstarted: number;
  started: number;
  completed: number;
  cancelled: number;
  completion_percentage: number;
};

export type ProjectModuleDetail = ProjectModule & { progress: ModuleProgress };

export type CreateModuleData = {
  name: string;
  description?: string;
  status?: ModuleStatus;
  lead_id?: string | null;
  start_date?: string | null;
  target_date?: string | null;
};

export type UpdateModuleData = Partial<Omit<CreateModuleData, "description">> & {
  description?: string | null;
};

const modulesPath = (slug: string, projectId: string) =>
  "/v1/workspaces/" + encodeURIComponent(slug) + "/projects/" + encodeURIComponent(projectId) + "/modules";

const modulePath = (slug: string, projectId: string, moduleId: string) =>
  modulesPath(slug, projectId) + "/" + encodeURIComponent(moduleId);

export async function getProjectModules(slug: string, projectId: string, signal?: AbortSignal): Promise<ProjectModule[]> {
  const { data } = await api.get<ProjectModule[]>(modulesPath(slug, projectId) + "/", { signal });
  return data;
}

export async function getProjectModule(slug: string, projectId: string, moduleId: string, signal?: AbortSignal): Promise<ProjectModuleDetail> {
  const { data } = await api.get<ProjectModuleDetail>(modulePath(slug, projectId, moduleId), { signal });
  return data;
}

export async function createProjectModule(slug: string, projectId: string, module: CreateModuleData): Promise<ProjectModule> {
  const { data } = await api.post<ProjectModule>(modulesPath(slug, projectId) + "/", module);
  return data;
}

export async function updateProjectModule(slug: string, projectId: string, moduleId: string, module: UpdateModuleData): Promise<ProjectModule> {
  const { data } = await api.patch<ProjectModule>(modulePath(slug, projectId, moduleId), module);
  return data;
}

export async function deleteProjectModule(slug: string, projectId: string, moduleId: string): Promise<void> {
  await api.delete(modulePath(slug, projectId, moduleId));
}

export async function addIssuesToModule(slug: string, projectId: string, moduleId: string, issueIds: string[]): Promise<{ added: number }> {
  const { data } = await api.post<{ added: number }>(modulePath(slug, projectId, moduleId) + "/issues", {
    issue_ids: Array.from(new Set(issueIds)),
  });
  return data;
}

export async function removeIssueFromModule(slug: string, projectId: string, moduleId: string, issueId: string): Promise<void> {
  await api.delete(modulePath(slug, projectId, moduleId) + "/issues/" + encodeURIComponent(issueId));
}
