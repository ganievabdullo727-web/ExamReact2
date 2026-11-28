import axios from "axios";
import { api } from "@/shared/api/client";

export type Project = {
  id: string;
  workspace_id: string;
  name: string;
  identifier: string;
  description: string | null;
  lead_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectMemberRole = "admin" | "member" | "viewer";

export type ProjectMember = {
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  created_at: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type CreateProjectData = {
  name: string;
  identifier: string;
  description?: string;
  lead_id?: string | null;
};

export type UpdateProjectData = {
  name?: string;
  description?: string | null;
  lead_id?: string | null;
  is_archived?: boolean;
};

export type AddProjectMemberData = {
  user_id: string;
  role?: ProjectMemberRole;
};

export const getProjectError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
};

const projectsPath = (slug: string) => `/v1/workspaces/${encodeURIComponent(slug)}/projects`;
const projectPath = (slug: string, projectId: string) =>
  `${projectsPath(slug)}/${encodeURIComponent(projectId)}`;
const membersPath = (slug: string, projectId: string) => `${projectPath(slug, projectId)}/members`;

export const getProjects = async (slug: string, signal?: AbortSignal): Promise<Project[]> => {
  const { data } = await api.get<Project[]>(`${projectsPath(slug)}/`, { signal });
  return data;
};

export const createProject = async (slug: string, project: CreateProjectData): Promise<Project> => {
  const { data } = await api.post<Project>(`${projectsPath(slug)}/`, project);
  return data;
};

export const getProject = async (
  slug: string,
  projectId: string,
  signal?: AbortSignal,
): Promise<Project> => {
  const { data } = await api.get<Project>(projectPath(slug, projectId), { signal });
  return data;
};

export const updateProject = async (
  slug: string,
  projectId: string,
  project: UpdateProjectData,
): Promise<Project> => {
  const { data } = await api.patch<Project>(projectPath(slug, projectId), project);
  return data;
};

export const deleteProject = async (slug: string, projectId: string): Promise<void> => {
  await api.delete(projectPath(slug, projectId));
};

export const getProjectMembers = async (
  slug: string,
  projectId: string,
  signal?: AbortSignal,
): Promise<ProjectMember[]> => {
  const { data } = await api.get<ProjectMember[]>(membersPath(slug, projectId), { signal });
  return data;
};

export const addProjectMember = async (
  slug: string,
  projectId: string,
  member: AddProjectMemberData,
): Promise<ProjectMember> => {
  const { data } = await api.post<ProjectMember>(membersPath(slug, projectId), member);
  return data;
};

export const removeProjectMember = async (
  slug: string,
  projectId: string,
  memberId: string,
): Promise<void> => {
  await api.delete(`${membersPath(slug, projectId)}/${encodeURIComponent(memberId)}`);
};
