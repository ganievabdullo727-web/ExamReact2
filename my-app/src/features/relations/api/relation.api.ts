import { getIssueError, type Issue } from "@/features/issues/api/issue.api";
import { api } from "@/shared/api/client";

export const relationTypes = ["blocks", "blocked_by", "relates_to", "duplicates"] as const;
export type RelationType = (typeof relationTypes)[number];

export type IssueRelation = {
  id: string;
  issue_id: string;
  related_issue_id: string;
  relation_type: RelationType;
  created_at: string;
  related_issue: Pick<Issue, "id" | "sequence_id" | "title" | "priority" | "state_id" | "project_id">;
};

export type GroupedRelations = Record<RelationType, IssueRelation[]>;
export type CreateRelationData = Pick<IssueRelation, "related_issue_id" | "relation_type">;

class RelationError extends Error {}

export function getRelationError(error: unknown, fallback: string): string {
  return error instanceof RelationError ? error.message : getIssueError(error, fallback);
}

const relationsPath = (slug: string, projectId: string, issueId: string) =>
  `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}/relations/`;

function assertRelationScope(relation: IssueRelation, issueId: string, type: RelationType) {
  if (!relation?.id
    || relation.issue_id !== issueId
    || relation.relation_type !== type
    || relation.related_issue_id !== relation.related_issue?.id
    || relation.related_issue_id === issueId
    || !relation.related_issue?.project_id) {
    throw new RelationError("The returned relation does not match this issue.");
  }
}

export async function getIssueRelations(
  slug: string,
  projectId: string,
  issueId: string,
  signal?: AbortSignal,
): Promise<GroupedRelations> {
  const { data } = await api.get<GroupedRelations>(relationsPath(slug, projectId, issueId), { signal });
  for (const type of relationTypes) {
    if (!Array.isArray(data?.[type])) throw new RelationError("The server returned an invalid list of relations.");
    for (const relation of data[type]) assertRelationScope(relation, issueId, type);
  }
  return data;
}

export async function createIssueRelation(
  slug: string,
  projectId: string,
  issueId: string,
  relation: CreateRelationData,
): Promise<IssueRelation> {
  if (relation.related_issue_id === issueId) throw new RelationError("An issue cannot be related to itself.");
  const { data } = await api.post<IssueRelation>(relationsPath(slug, projectId, issueId), relation);
  assertRelationScope(data, issueId, relation.relation_type);
  if (data.related_issue_id !== relation.related_issue_id) {
    throw new RelationError("The returned relation does not match the selected issue.");
  }
  return data;
}

export async function deleteIssueRelation(
  slug: string,
  projectId: string,
  issueId: string,
  linkId: string,
): Promise<void> {
  await api.delete(`${relationsPath(slug, projectId, issueId)}${encodeURIComponent(linkId)}`);
}
