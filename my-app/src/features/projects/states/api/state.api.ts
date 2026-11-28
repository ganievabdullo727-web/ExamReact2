import { api } from "@/shared/api/client";

export const stateGroups = ["backlog", "unstarted", "started", "completed", "cancelled"] as const;
export type StateGroup = (typeof stateGroups)[number];

export type ProjectState = {
  id: string;
  project_id: string;
  name: string;
  color: string;
  group: StateGroup;
  order: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateProjectStateData = Pick<ProjectState, "name" | "color" | "group" | "order" | "is_default">;
export type UpdateProjectStateData = Partial<CreateProjectStateData>;
export type DeleteProjectStateData = { transfer_to_state_id: string };

const statesPath = (slug: string, projectId: string) =>
  `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/states`;

const statePath = (slug: string, projectId: string, stateId: string) =>
  `${statesPath(slug, projectId)}/${encodeURIComponent(stateId)}`;

export const getProjectStates = async (
  slug: string,
  projectId: string,
  signal?: AbortSignal,
): Promise<ProjectState[]> => {
  const { data } = await api.get<ProjectState[]>(`${statesPath(slug, projectId)}/`, { signal });
  return data;
};

export const createProjectState = async (
  slug: string,
  projectId: string,
  state: CreateProjectStateData,
): Promise<ProjectState> => {
  const { data } = await api.post<ProjectState>(`${statesPath(slug, projectId)}/`, state);
  return data;
};

export const updateProjectState = async (
  slug: string,
  projectId: string,
  stateId: string,
  state: UpdateProjectStateData,
): Promise<ProjectState> => {
  const { data } = await api.patch<ProjectState>(statePath(slug, projectId, stateId), state);
  return data;
};

export const deleteProjectState = async (
  slug: string,
  projectId: string,
  stateId: string,
  transfer: DeleteProjectStateData,
): Promise<void> => {
  await api.delete(statePath(slug, projectId, stateId), { data: transfer });
};
