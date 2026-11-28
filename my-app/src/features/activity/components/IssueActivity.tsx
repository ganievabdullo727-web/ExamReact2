"use client";

import { Activity, ChevronDown, RotateCw } from "lucide-react";

import { useProjectLabels } from "@/features/projects/labels/hooks/useProjectLabels";
import type { ProjectState } from "@/features/projects/states/api/state.api";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/useWorkspaceMembers";
import { getActivityError, type IssueActivity as ActivityEntry } from "../api/activity.api";
import { useIssueActivity } from "../hooks/useIssueActivity";

const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const timestamp = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
const calendarDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

const fieldNames: Readonly<Partial<Record<string, string>>> = {
  title: "title",
  description: "description",
  state_id: "state",
  priority: "priority",
  parent_id: "parent issue",
  start_date: "start date",
  due_date: "due date",
  estimate_points: "estimate points",
};

type ActivityNames = {
  states: Map<string, string>;
  members: Map<string, string>;
  labels: Map<string, string>;
};

function isAssigneeAction(action: string) {
  return action === "issue.assignee_added" || action === "issue.assignee_removed";
}

function isLabelAction(action: string) {
  return action === "issue.label_added" || action === "issue.label_removed";
}

function describeActivity(entry: ActivityEntry, names: ActivityNames) {
  const { action, field, old_value: oldValue, new_value: newValue } = entry;

  switch (action) {
    case "issue.created":
      return { summary: "created this issue" };
    case "issue.updated":
      return { summary: field && fieldNames[field] ? `updated the ${fieldNames[field]}` : "updated this issue" };
    case "issue.deleted":
      return { summary: "deleted this issue" };
    case "issue.assignee_added":
      return { summary: "added an assignee", detail: newValue ? names.members.get(newValue) : undefined };
    case "issue.assignee_removed":
      return { summary: "removed an assignee", detail: oldValue ? names.members.get(oldValue) : undefined };
    case "issue.label_added":
      return { summary: "added a label", detail: newValue ? names.labels.get(newValue) : undefined };
    case "issue.label_removed":
      return { summary: "removed a label", detail: oldValue ? names.labels.get(oldValue) : undefined };
    case "comment.created":
      return { summary: "added a comment" };
    case "comment.updated":
      return { summary: "edited a comment" };
    case "comment.deleted":
      return { summary: "deleted a comment" };
    case "issue.attachment_added":
      return { summary: "added an attachment", detail: newValue };
    case "issue.attachment_removed":
      return { summary: "removed an attachment", detail: oldValue };
    default:
      return { summary: "recorded activity on this issue" };
  }
}

function displayValue(field: string, value: string | null, states: Map<string, string>) {
  if (value === null || value === "") return "Not set";
  if (field === "state_id") return states.get(value) ?? value;
  if (field === "priority") return value === "none" ? "No priority" : value[0].toUpperCase() + value.slice(1);
  if (field === "start_date" || field === "due_date") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : calendarDate.format(date);
  }
  return value;
}

function ChangeValue({ label, value }: { label: string; value: string }) {
  const valueClass = "whitespace-pre-wrap wrap-anywhere text-sm text-slate-700";

  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd>
        {value.length > 280 ? (
          <details>
            <summary className="cursor-pointer text-sm font-medium text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500">Show full text</summary>
            <p className={`mt-1 ${valueClass}`}>{value}</p>
          </details>
        ) : <p className={valueClass}>{value}</p>}
      </dd>
    </div>
  );
}

function ActivityRow({ entry, names }: { entry: ActivityEntry; names: ActivityNames }) {
  const actor = entry.actor?.display_name?.trim() || "Workspace member";
  const initials = actor.split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();
  const date = new Date(entry.created_at);
  const { summary, detail } = describeActivity(entry, names);

  return (
    <li data-activity-id={entry.id} data-activity-action={entry.action} className="flex items-start gap-3 px-5 py-4">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">{initials}</span>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-sm wrap-anywhere text-slate-700">
            <span className="font-semibold text-slate-900">{actor}</span> {summary}
            {detail && <span className="font-medium text-slate-900"> · {detail}</span>}
          </p>
          {!Number.isNaN(date.getTime()) && (
            <time dateTime={entry.created_at} className="text-xs text-slate-500">{timestamp.format(date)}</time>
          )}
        </div>
        {entry.action === "issue.updated" && entry.field && (
          <dl className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 sm:grid-cols-2">
            <ChangeValue label="Before" value={displayValue(entry.field, entry.old_value, names.states)} />
            <ChangeValue label="After" value={displayValue(entry.field, entry.new_value, names.states)} />
          </dl>
        )}
      </div>
    </li>
  );
}

export default function IssueActivity({ slug, projectId, issueId, states = [] }: {
  slug: string;
  projectId: string;
  issueId: string;
  states?: ProjectState[];
}) {
  const query = useIssueActivity(slug, projectId, issueId);
  const entries = query.data?.pages.flatMap((page) => page.data) ?? [];
  const members = useWorkspaceMembers(entries.some(({ action }) => isAssigneeAction(action)) ? slug : "");
  const labels = useProjectLabels(slug, entries.some(({ action }) => isLabelAction(action)) ? projectId : "");
  const names: ActivityNames = {
    states: new Map(states.map(({ id, name }) => [id, name])),
    members: new Map(members.data?.map(({ user_id, user }) => [user_id, user.display_name])),
    labels: new Map(labels.data?.map(({ id, name }) => [id, name])),
  };
  const pageError = query.isFetchNextPageError;
  const refreshError = query.isError && !pageError;
  const refreshLabel = refreshError ? "Try again" : "Refresh";

  return (
    <section aria-labelledby="issue-activity-title" className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <Activity size={18} aria-hidden="true" />
          </span>
          <h2 id="issue-activity-title" className="text-sm font-semibold text-slate-900">Activity</h2>
        </div>
        <button type="button" data-activity-control="reload" className={secondaryButton} disabled={query.isFetching} onClick={() => void query.refetch()}>
          <RotateCw size={15} aria-hidden="true" className={query.isFetching && !query.isFetchingNextPage ? "motion-safe:animate-spin" : undefined} />
          {query.isRefetching ? "Refreshing…" : refreshLabel}
        </button>
      </header>
      {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading activity…</p>}
      {refreshError && (
        <p role="alert" className="px-5 py-4 text-sm text-red-700">{getActivityError(query.error, "Could not load activity.")}</p>
      )}
      {query.data && !refreshError && entries.length === 0 && (
        <p className="px-5 py-6 text-sm text-slate-600">No activity yet.</p>
      )}
      {entries.length > 0 && (
        <ul aria-label="Issue activity" aria-busy={query.isFetching} className="divide-y divide-slate-100">
          {entries.map((entry) => <ActivityRow key={entry.id} entry={entry} names={names} />)}
        </ul>
      )}
      {query.hasNextPage && (
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-5 py-3">
          {pageError && <p role="alert" className="text-sm text-red-700">{getActivityError(query.error, "Could not load older activity.")}</p>}
          <button type="button" data-activity-control="more" className={`ml-auto ${secondaryButton}`} disabled={query.isFetching} onClick={() => void query.fetchNextPage()}>
            <ChevronDown size={15} aria-hidden="true" />
            {query.isFetchingNextPage ? "Loading…" : pageError ? "Try again" : "Load older activity"}
          </button>
        </footer>
      )}
    </section>
  );
}
