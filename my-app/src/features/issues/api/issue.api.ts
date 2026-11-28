import axios from "axios";
import type { User } from "@/features/auth/api/auth.api";
import type { ProjectLabel } from "@/features/projects/labels/api/label.api";
import { api } from "@/shared/api/client";

export const issuePriorities = ["none", "low", "medium", "high", "urgent"] as const;
export type IssuePriority = (typeof issuePriorities)[number];
type IssueAssignee = { user_id: string; user: Pick<User, "id" | "email" | "display_name" | "avatar_url"> };
type IssueLabel = { label_id: string; label: ProjectLabel };
export const issueSortFields = ["created_at", "updated_at", "priority", "due_date", "sort_order"] as const;
export const issueGroupFields = ["state", "priority", "assignee"] as const;
export type IssueGroupBy = (typeof issueGroupFields)[number];
export type IssueSortBy = (typeof issueSortFields)[number];

export type Issue = {
  id: string;
  workspace_id: string;
  project_id: string;
  sequence_id: number;
  title: string;
  description: string | null;
  state_id: string;
  priority: IssuePriority;
  parent_id: string | null;
  estimate_points: number | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_by_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  assignees: IssueAssignee[];
  labels: IssueLabel[];
  assigneesUnavailable?: boolean;
  labelsUnavailable?: boolean;
};

export type IssuePage = {
  data: Issue[];
  next_cursor: string | null;
};

export type IssueListFilters = {
  search?: string;
  state?: string | string[];
  priority?: IssuePriority | IssuePriority[];
  assignee?: string | string[];
  label?: string | string[];
  due_after?: string;
  due_before?: string;
  created_after?: string;
  created_before?: string;
  sort_by?: IssueSortBy;
  order?: "asc" | "desc";
  parent_id?: string;
};

export type IssueGroup = { key: string | null; issues: Issue[] };

export type CreateIssueData = {
  title: string;
  description?: string;
  state_id: string;
  priority?: IssuePriority;
  parent_id?: string;
  assignee_ids?: string[];
  label_ids?: string[];
  start_date?: string;
  due_date?: string;
  estimate_points?: number;
};

export type UpdateIssueData = Partial<Pick<
  Issue,
  "title" | "description" | "state_id" | "priority" | "parent_id"
    | "start_date" | "due_date" | "estimate_points" | "sort_order"
>>;

export const getIssueError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
};

const issuesPath = (slug: string, projectId: string) =>
  `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues`;

const issuePath = (slug: string, projectId: string, issueId: string) =>
  `${issuesPath(slug, projectId)}/${encodeURIComponent(issueId)}`;

export type IssueAssignmentChange =
  | { kind: "assignees"; action: "add" | "remove"; id: string }
  | { kind: "labels"; action: "add" | "remove"; id: string };

export const changeIssueAssignment = async (
  slug: string,
  projectId: string,
  issueId: string,
  { kind, action, id }: IssueAssignmentChange,
): Promise<Issue> => {
  const path = `${issuePath(slug, projectId, issueId)}/${kind}`;
  const { data } = action === "add"
    ? await api.post<Issue>(path, kind === "assignees" ? { user_id: id } : { label_id: id })
    : await api.delete<Issue>(`${path}/${encodeURIComponent(id)}`);
  if (data.id !== issueId) throw new Error("The response did not match this issue.");
  return normalizeIssue(data, projectId);
};

function normalizeIssue(issue: Issue, projectId: string): Issue {
  if (issue.project_id !== projectId) {
    throw new Error("The issue does not belong to this project.");
  }

  const assignees = (issue.assignees ?? []).filter((row) => row?.user_id && row.user?.id);
  const labels = (issue.labels ?? []).filter((row) => row?.label_id && row.label?.id);
  return {
    ...issue,
    assignees,
    labels,
    assigneesUnavailable: assignees.length !== issue.assignees?.length,
    labelsUnavailable: labels.length !== issue.labels?.length,
  };
}

function issueListParams(filters: IssueListFilters) {
  return { sort_by: "created_at", order: "desc", ...filters, search: filters.search?.trim() || undefined };
}

export const getIssues = async (
  slug: string,
  projectId: string,
  filters: IssueListFilters = {},
  cursor?: string,
  signal?: AbortSignal,
): Promise<IssuePage> => {
  const { data } = await api.get<IssuePage>(`${issuesPath(slug, projectId)}/`, {
    signal,
    params: { ...issueListParams(filters), cursor, limit: 25 },
    paramsSerializer: { indexes: null },
  });
  return { ...data, data: data.data.map((issue) => normalizeIssue(issue, projectId)) };
};

export const getGroupedIssues = async (
  slug: string, projectId: string, filters: IssueListFilters, groupBy: IssueGroupBy, signal?: AbortSignal,
): Promise<IssueGroup[]> => {
  const { data } = await api.get<{ group_by: IssueGroupBy; groups: IssueGroup[] }>(`${issuesPath(slug, projectId)}/`, {
    signal,
    params: { ...issueListParams(filters), group_by: groupBy },
    paramsSerializer: { indexes: null },
  });
  if (data.group_by !== groupBy) throw new Error("The response did not match the requested grouping.");
  return data.groups.map((group) => ({ ...group, issues: group.issues.map((issue) => normalizeIssue(issue, projectId)) }));
};

export const getIssue = async (
  slug: string,
  projectId: string,
  issueId: string,
  signal?: AbortSignal,
): Promise<Issue> => {
  const { data } = await api.get<Issue>(issuePath(slug, projectId, issueId), { signal });
  return normalizeIssue(data, projectId);
};

export const createIssue = async (
  slug: string,
  projectId: string,
  issue: CreateIssueData,
): Promise<Issue> => {
  const { data } = await api.post<Issue>(`${issuesPath(slug, projectId)}/`, {
    ...issue,
    priority: issue.priority ?? "none",
  });
  return normalizeIssue(data, projectId);
};

export const updateIssue = async (
  slug: string,
  projectId: string,
  issueId: string,
  issue: UpdateIssueData,
): Promise<Issue> => {
  const { data } = await api.patch<Issue>(issuePath(slug, projectId, issueId), issue);
  return normalizeIssue(data, projectId);
};

export const deleteIssue = async (slug: string, projectId: string, issueId: string): Promise<void> => {
  await api.delete(issuePath(slug, projectId, issueId));
};
