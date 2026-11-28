import { api } from "@/shared/api/client";

export type ProjectLabel = {
  id: string;
  workspace_id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type CreateProjectLabelData = Pick<ProjectLabel, "name" | "color">;
export type UpdateProjectLabelData = Partial<CreateProjectLabelData>;

const labelsPath = (slug: string, projectId: string) =>
  `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/labels`;
const labelPath = (slug: string, projectId: string, labelId: string) =>
  `${labelsPath(slug, projectId)}/${encodeURIComponent(labelId)}`;

export const getProjectLabels = async (
  slug: string,
  projectId: string,
  signal?: AbortSignal,
): Promise<ProjectLabel[]> => {
  const { data } = await api.get<ProjectLabel[]>(`${labelsPath(slug, projectId)}/`, { signal });
  return data;
};

export const createProjectLabel = async (
  slug: string,
  projectId: string,
  label: CreateProjectLabelData,
): Promise<ProjectLabel> => {
  const { data } = await api.post<ProjectLabel>(`${labelsPath(slug, projectId)}/`, label);
  return data;
};

export const updateProjectLabel = async (
  slug: string,
  projectId: string,
  labelId: string,
  label: UpdateProjectLabelData,
): Promise<ProjectLabel> => {
  const { data } = await api.patch<ProjectLabel>(labelPath(slug, projectId, labelId), label);
  return data;
};

export const deleteProjectLabel = async (
  slug: string,
  projectId: string,
  labelId: string,
): Promise<void> => {
  await api.delete(labelPath(slug, projectId, labelId));
};
