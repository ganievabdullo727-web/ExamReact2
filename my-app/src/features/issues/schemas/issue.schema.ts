import { z } from "zod";
import { issuePriorities, type CreateIssueData, type Issue, type UpdateIssueData } from "../api/issue.api";

export const issueTitleMaxLength = 500;
export const issueDescriptionMaxLength = 50_000;

const calendarDate = z.union([z.literal(""), z.iso.date("Enter a valid date.")]);
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

function isFiniteDecimal(value: string) {
  return decimal.test(value) && Number.isFinite(Number(value));
}

const estimate = z.string().trim().refine(
  (value) => value === "" || (isFiniteDecimal(value) && Number(value) >= 0),
  "Enter a non-negative number.",
);

export const createIssueSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(issueTitleMaxLength),
  description: z.string().max(issueDescriptionMaxLength).optional(),
  state_id: z.uuid("Choose a project state."),
  priority: z.enum(issuePriorities).optional(),
  start_date: calendarDate,
  due_date: calendarDate,
  estimate_points: estimate,
  parent_id: z.union([z.literal(""), z.uuid("Choose a parent from this project.")]),
  assignee_ids: z.array(z.uuid()),
  label_ids: z.array(z.uuid()),
});

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;

export function toCreateIssueData(values: CreateIssueFormData, parentId?: string): CreateIssueData {
  return {
    title: values.title,
    description: values.description,
    state_id: values.state_id,
    priority: values.priority,
    parent_id: parentId || values.parent_id || undefined,
    start_date: values.start_date ? `${values.start_date}T00:00:00.000Z` : undefined,
    due_date: values.due_date ? `${values.due_date}T00:00:00.000Z` : undefined,
    estimate_points: values.estimate_points === "" ? undefined : Number(values.estimate_points),
    assignee_ids: values.assignee_ids.length ? values.assignee_ids : undefined,
    label_ids: values.label_ids.length ? values.label_ids : undefined,
  };
}

export const updateIssueSchema = z.object({
  title: z.string().max(issueTitleMaxLength).refine((value) => value.trim().length > 0, "Enter a title."),
  description: z.string().max(issueDescriptionMaxLength),
  state_id: z.uuid("Choose a project state."),
  priority: z.enum(issuePriorities),
  parent_id: z.union([z.literal(""), z.uuid("Choose an issue from this project.")]),
  start_date: calendarDate,
  due_date: calendarDate,
  estimate_points: estimate,
  sort_order: z.string().trim().refine(isFiniteDecimal, "Enter a number for sort order."),
});

export type UpdateIssueFormData = z.infer<typeof updateIssueSchema>;

export function issueToEditForm(issue: Issue): UpdateIssueFormData {
  return {
    title: issue.title,
    description: issue.description ?? "",
    state_id: issue.state_id,
    priority: issue.priority,
    parent_id: issue.parent_id ?? "",
    start_date: issue.start_date?.slice(0, 10) ?? "",
    due_date: issue.due_date?.slice(0, 10) ?? "",
    estimate_points: issue.estimate_points?.toString() ?? "",
    sort_order: String(issue.sort_order ?? 0),
  };
}

export function toUpdateIssueData(values: UpdateIssueFormData, issue: Issue): UpdateIssueData {
  const original = issueToEditForm(issue);
  const patch: UpdateIssueData = {};
  const title = values.title.trim();
  const estimatePoints = values.estimate_points === "" ? null : Number(values.estimate_points);
  const sortOrder = Number(values.sort_order);

  if (values.title !== original.title && title !== issue.title) patch.title = title;
  if (values.description !== original.description) patch.description = values.description || null;
  if (values.state_id !== original.state_id) patch.state_id = values.state_id;
  if (values.priority !== original.priority) patch.priority = values.priority;
  if (values.parent_id !== original.parent_id) patch.parent_id = values.parent_id || null;
  if (estimatePoints !== (issue.estimate_points ?? null)) patch.estimate_points = estimatePoints;
  if (sortOrder !== (issue.sort_order ?? 0)) patch.sort_order = sortOrder;

  for (const field of ["start_date", "due_date"] as const) {
    if (values[field] !== original[field]) {
      patch[field] = values[field] ? `${values[field]}T00:00:00.000Z` : null;
    }
  }

  return patch;
}
