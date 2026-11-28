import { api } from "@/shared/api/client";

export type IssueComment = {
  id: string;
  issue_id: string;
  author_id: string;
  body: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type CreateCommentData = { body: string };
export type UpdateCommentData = { body: string };

const commentsPath = (slug: string, projectId: string, issueId: string) =>
  `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}/comments/`;

const commentPath = (slug: string, projectId: string, issueId: string, commentId: string) =>
  `${commentsPath(slug, projectId, issueId)}${encodeURIComponent(commentId)}`;

function normalizeComment(comment: IssueComment, issueId: string): IssueComment {
  if (comment.issue_id !== issueId) {
    throw new Error("The comment does not belong to this issue.");
  }

  return comment.deleted_at ? { ...comment, body: "" } : comment;
}

export const getIssueComments = async (
  slug: string,
  projectId: string,
  issueId: string,
  signal?: AbortSignal,
): Promise<IssueComment[]> => {
  const { data } = await api.get<IssueComment[]>(commentsPath(slug, projectId, issueId), { signal });
  return data.map((comment) => normalizeComment(comment, issueId));
};

export const createIssueComment = async (
  slug: string,
  projectId: string,
  issueId: string,
  comment: CreateCommentData,
): Promise<IssueComment> => {
  const { data } = await api.post<IssueComment>(commentsPath(slug, projectId, issueId), comment);
  return normalizeComment(data, issueId);
};

export const updateIssueComment = async (
  slug: string,
  projectId: string,
  issueId: string,
  commentId: string,
  comment: UpdateCommentData,
): Promise<IssueComment> => {
  const { data } = await api.patch<IssueComment>(commentPath(slug, projectId, issueId, commentId), comment);
  if (data.id !== commentId) {
    throw new Error("The response did not match the edited comment.");
  }

  return normalizeComment(data, issueId);
};

export const deleteIssueComment = async (
  slug: string,
  projectId: string,
  issueId: string,
  commentId: string,
): Promise<void> => {
  await api.delete(commentPath(slug, projectId, issueId, commentId));
};
