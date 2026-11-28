import { isAxiosError } from "axios";
import { api } from "@/shared/api/client";
import type { EditableWorkspaceRole, Workspace, WorkspaceRole } from "@/features/workspaces/api/workspace.api";

export type WorkspaceInvite = {
  id: string;
  workspace_id: string;
  email: string;
  role: EditableWorkspaceRole;
  expires_at: string;
  workspace: Pick<Workspace, "id" | "name" | "slug">;
  invited_by: { id: string; email: string; display_name: string };
};

export type AcceptedInvite = { workspace_id: string; user_id: string; role: WorkspaceRole };

export const invitationPath = (token: string) => `/invites/${encodeURIComponent(token)}`;

export const getInvite = async (token: string, signal?: AbortSignal): Promise<WorkspaceInvite> => {
  const { data } = await api.get<WorkspaceInvite>(`/v1${invitationPath(token)}`, { signal });
  return data;
};

export const acceptInvite = async (token: string): Promise<AcceptedInvite> => {
  const { data } = await api.post<AcceptedInvite>(`/v1${invitationPath(token)}/accept`);
  return data;
};

export function getInviteError(error: unknown, fallback: string) {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status === 404) return "This invitation could not be found.";
  if (status === 409) return "This invitation has already been accepted.";
  if (status === 410) return "This invitation has expired.";
  if (status === 403) return "This invitation was sent to a different email address.";
  return fallback;
}

export function isUnavailableInvite(error: unknown) {
  return isAxiosError(error) && [404, 409, 410].includes(error.response?.status ?? 0);
}
