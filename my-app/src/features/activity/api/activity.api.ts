import axios from "axios";
import { api } from "@/shared/api/client";

export type IssueActivity = {
  id: string;
  workspace_id: string;
  issue_id: string | null;
  actor_id: string;
  action: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  actor: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type IssueActivityPage = {
  data: IssueActivity[];
  next_cursor: string | null;
};

export const getActivityError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
};

const activityPath = (slug: string, projectId: string, issueId: string) =>
  `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}/activity/`;

export const getIssueActivity = async (
  slug: string,
  projectId: string,
  issueId: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<IssueActivityPage> => {
  const { data } = await api.get<IssueActivityPage>(activityPath(slug, projectId, issueId), {
    params: { cursor, limit: 50 },
    signal,
  });

  if (data.data.some((entry) => entry.issue_id !== issueId)) {
    throw new Error("The returned activity does not belong to this issue.");
  }

  return data;
};
