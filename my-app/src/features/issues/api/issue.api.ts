import axios from "axios";
import type { User } from "@/features/auth/api/auth.api";
import type { ProjectLabel } from "@/features/projects/labels/api/label.api";
import { api } from "@/shared/api/client";

export const issuePriorities = [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type IssuePriority = (typeof issuePriorities)[number];

type IssueAssignee = {
  user_id: string;
  user: Pick<User, "id" | "email" | "display_name" | "avatar_url">;
};

type IssueLabel = {
  label_id: string;
  label: ProjectLabel;
};

export const issueSortFields = [
  "created_at",
  "updated_at",
  "priority",
  "due_date",
  "sort_order",
] as const;

export const issueGroupFields = ["state", "priority", "assignee"] as const;

export type IssueSortBy = (typeof issueSortFields)[number];
export type IssueGroupBy = (typeof issueGroupFields)[number];

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

export type IssueGroup = {
  key: string | null;
  issues: Issue[];
};

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

export type UpdateIssueData = {
  title?: Issue["title"];
  description?: Issue["description"];
  state_id?: Issue["state_id"];
  priority?: Issue["priority"];
  parent_id?: Issue["parent_id"];
  start_date?: Issue["start_date"];
  due_date?: Issue["due_date"];
  estimate_points?: Issue["estimate_points"];
  sort_order?: Issue["sort_order"];
};

export const getIssueError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
};

const issuesPath = (slug: string, projectId: string) => {
  const workspace = encodeURIComponent(slug);
  const project = encodeURIComponent(projectId);

  return `/v1/workspaces/${workspace}/projects/${project}/issues`;
};

const issuePath = (slug: string, projectId: string, issueId: string) => {
  const id = encodeURIComponent(issueId);

  return `${issuesPath(slug, projectId)}/${id}`;
};

export type IssueAssignmentChange =
  | {
      kind: "assignees";
      action: "add" | "remove";
      id: string;
    }
  | {
      kind: "labels";
      action: "add" | "remove";
      id: string;
    };

export const changeIssueAssignment = async (
  slug: string,
  projectId: string,
  issueId: string,
  change: IssueAssignmentChange,
): Promise<Issue> => {
  const path = `${issuePath(slug, projectId, issueId)}/${change.kind}`;

  let data: Issue;

  if (change.action === "add") {
    let body: { user_id: string } | { label_id: string };

    if (change.kind === "assignees") {
      body = { user_id: change.id };
    } else {
      body = { label_id: change.id };
    }

    const response = await api.post<Issue>(path, body);
    data = response.data;
  } else {
    const id = encodeURIComponent(change.id);
    const response = await api.delete<Issue>(`${path}/${id}`);

    data = response.data;
  }

  if (data.id !== issueId) {
    throw new Error("The response did not match this issue.");
  }

  return normalizeIssue(data, projectId);
};

function normalizeIssue(issue: Issue, projectId: string): Issue {
  if (issue.project_id !== projectId) {
    throw new Error("The issue does not belong to this project.");
  }

  const assignees = (issue.assignees ?? []).filter((row) => {
    return Boolean(row?.user_id && row.user?.id);
  });

  const labels = (issue.labels ?? []).filter((row) => {
    return Boolean(row?.label_id && row.label?.id);
  });

  return {
    ...issue,
    assignees: assignees,
    labels: labels,
    assigneesUnavailable: assignees.length !== issue.assignees?.length,
    labelsUnavailable: labels.length !== issue.labels?.length,
  };
}

function issueListParams(filters: IssueListFilters) {
  const params = {
    sort_by: "created_at",
    order: "desc",
    ...filters,
    search: filters.search?.trim() || undefined,
  };

  return params;
}

export const getIssues = async (
  slug: string,
  projectId: string,
  filters: IssueListFilters = {},
  cursor?: string,
  signal?: AbortSignal,
): Promise<IssuePage> => {
  const response = await api.get<IssuePage>(`${issuesPath(slug, projectId)}/`, {
    signal: signal,
    params: {
      ...issueListParams(filters),
      cursor: cursor,
      limit: 25,
    },
    paramsSerializer: {
      indexes: null,
    },
  });

  const data = response.data;

  const issues = data.data.map((issue) => {
    return normalizeIssue(issue, projectId);
  });

  return {
    ...data,
    data: issues,
  };
};

export const getGroupedIssues = async (
  slug: string,
  projectId: string,
  filters: IssueListFilters,
  groupBy: IssueGroupBy,
  signal?: AbortSignal,
): Promise<IssueGroup[]> => {
  const response = await api.get<{
    group_by: IssueGroupBy;
    groups: IssueGroup[];
  }>(`${issuesPath(slug, projectId)}/`, {
    signal: signal,
    params: {
      ...issueListParams(filters),
      group_by: groupBy,
    },
    paramsSerializer: {
      indexes: null,
    },
  });

  const data = response.data;

  if (data.group_by !== groupBy) {
    throw new Error("The response did not match the requested grouping.");
  }

  const groups = data.groups.map((group) => {
    const issues = group.issues.map((issue) => {
      return normalizeIssue(issue, projectId);
    });

    return {
      ...group,
      issues: issues,
    };
  });

  return groups;
};

export const getIssue = async (
  slug: string,
  projectId: string,
  issueId: string,
  signal?: AbortSignal,
): Promise<Issue> => {
  const response = await api.get<Issue>(issuePath(slug, projectId, issueId), {
    signal: signal,
  });

  return normalizeIssue(response.data, projectId);
};

export const createIssue = async (
  slug: string,
  projectId: string,
  issue: CreateIssueData,
): Promise<Issue> => {
  const response = await api.post<Issue>(`${issuesPath(slug, projectId)}/`, {
    ...issue,
    priority: issue.priority ?? "none",
  });

  return normalizeIssue(response.data, projectId);
};

export const updateIssue = async (
  slug: string,
  projectId: string,
  issueId: string,
  issue: UpdateIssueData,
): Promise<Issue> => {
  const response = await api.patch<Issue>(
    issuePath(slug, projectId, issueId),
    issue,
  );

  return normalizeIssue(response.data, projectId);
};

export const deleteIssue = async (
  slug: string,
  projectId: string,
  issueId: string,
): Promise<void> => {
  await api.delete(issuePath(slug, projectId, issueId));
};
