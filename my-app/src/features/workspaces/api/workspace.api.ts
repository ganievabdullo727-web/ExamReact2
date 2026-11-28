import axios from "axios";
import { api } from "@/shared/api/client";

export type EditableWorkspaceRole = "admin" | "member" | "guest";
export type WorkspaceRole = "owner" | EditableWorkspaceRole;

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type WorkspaceInvitation = {
  id: string;
  workspace_id: string;
  invited_by_id: string;
  email: string;
  role: EditableWorkspaceRole;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export type CreateWorkspaceData = { name: string; slug: string };
export type UpdateWorkspaceData = Partial<CreateWorkspaceData>;
export type AddWorkspaceMemberData = { user_id: string; role?: EditableWorkspaceRole };
export type UpdateWorkspaceMemberData = { role: EditableWorkspaceRole };
export type InviteWorkspaceMemberData = { email: string; role?: EditableWorkspaceRole };
export type TransferOwnershipData = { user_id: string };

export const getWorkspaceError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
};

const workspacesPath = "/v1/workspaces";
const workspacePath = (slug: string) => `${workspacesPath}/${encodeURIComponent(slug)}`;
const membersPath = (slug: string) => `${workspacePath(slug)}/members`;
const memberPath = (slug: string, userId: string) =>
  `${membersPath(slug)}/${encodeURIComponent(userId)}`;

export const getWorkspaces = async (signal?: AbortSignal): Promise<Workspace[]> => {
  const { data } = await api.get<Workspace[]>(`${workspacesPath}/`, { signal });
  return data;
};

export const createWorkspace = async (workspace: CreateWorkspaceData): Promise<Workspace> => {
  const { data } = await api.post<Workspace>(`${workspacesPath}/`, workspace);
  return data;
};

export const getWorkspace = async (slug: string, signal?: AbortSignal): Promise<Workspace> => {
  const { data } = await api.get<Workspace>(workspacePath(slug), { signal });
  return data;
};

export const updateWorkspace = async (
  slug: string,
  workspace: UpdateWorkspaceData,
): Promise<Workspace> => {
  const { data } = await api.patch<Workspace>(workspacePath(slug), workspace);
  return data;
};

export const deleteWorkspace = async (slug: string): Promise<void> => {
  await api.delete(workspacePath(slug));
};

export const getWorkspaceMembers = async (
  slug: string,
  signal?: AbortSignal,
): Promise<WorkspaceMember[]> => {
  const { data } = await api.get<WorkspaceMember[]>(membersPath(slug), { signal });
  return data;
};

export const addWorkspaceMember = async (
  slug: string,
  member: AddWorkspaceMemberData,
): Promise<WorkspaceMember> => {
  const { data } = await api.post<WorkspaceMember>(membersPath(slug), member);
  return data;
};

export const updateWorkspaceMember = async (
  slug: string,
  userId: string,
  member: UpdateWorkspaceMemberData,
): Promise<WorkspaceMember> => {
  const { data } = await api.patch<WorkspaceMember>(memberPath(slug, userId), member);
  return data;
};

export const removeWorkspaceMember = async (slug: string, userId: string): Promise<void> => {
  await api.delete(memberPath(slug, userId));
};

export const inviteWorkspaceMember = async (
  slug: string,
  invite: InviteWorkspaceMemberData,
): Promise<WorkspaceInvitation> => {
  const { data } = await api.post<WorkspaceInvitation>(`${membersPath(slug)}/invite`, invite);
  return data;
};

export const leaveWorkspace = async (slug: string): Promise<void> => {
  await api.post(`${workspacePath(slug)}/leave`);
};

export const transferOwnership = async (
  slug: string,
  ownership: TransferOwnershipData,
): Promise<Workspace> => {
  const { data } = await api.post<Workspace>(`${workspacePath(slug)}/transfer-ownership`, ownership);
  return data;
};
