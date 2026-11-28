"use client";

import { Plus, Tag, Users, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { useProjectLabels } from "@/features/projects/labels/hooks/useProjectLabels";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/useWorkspaceMembers";
import { getIssueError, type Issue, type IssueAssignmentChange } from "../api/issue.api";
import { useChangeIssueAssignment } from "../hooks/useChangeIssueAssignment";
import { useIssueAssignmentDetails } from "../hooks/useIssueAssignmentDetails";

type Option = { id: string; name: string; color?: string };
const actionClass = "inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";

export default function IssueAssignments({ slug, issue, canManage }: { slug: string; issue: Issue; canManage: boolean }) {
  const members = useWorkspaceMembers(canManage || issue.assigneesUnavailable ? slug : "");
  const labels = useProjectLabels(slug, canManage || issue.labelsUnavailable ? issue.project_id : "");
  const mutation = useChangeIssueAssignment(slug, issue.project_id, issue.id);
  const lookup = useIssueAssignmentDetails(slug, issue, labels.data?.map(({ id }) => id).sort());
  const availablePeople = members.data?.map(({ user_id, user }) => ({ id: user_id, name: user.display_name || user.email })) ?? [];
  const availableTags = labels.data?.map(({ id, name, color }) => ({ id, name, color })) ?? [];
  const people = issue.assigneesUnavailable && lookup.assignees.data
    ? lookup.assignees.data.map((id) => availablePeople.find((person) => person.id === id) ?? { id, name: "Workspace member" })
    : issue.assignees.map(({ user_id, user }) => ({ id: user_id, name: user.display_name || user.email }));
  const resolvedLabels = lookup.labels.data;
  const tags = issue.labelsUnavailable && resolvedLabels
    ? availableTags.filter(({ id }) => resolvedLabels.includes(id))
    : issue.labels.map(({ label_id, label }) => ({ id: label_id, name: label.name, color: label.color }));
  const resolvingPeople = Boolean(issue.assigneesUnavailable && lookup.assignees.isFetching);
  const resolvingLabels = Boolean(issue.labelsUnavailable && (labels.isPending || lookup.labels.isFetching));

  async function change(input: IssueAssignmentChange) {
    await mutation.mutateAsync(input);
  }

  return (
    <div className="grid gap-4 border-t border-slate-200 px-5 py-4 sm:grid-cols-2">
      <AssignmentGroup
        kind="assignees" items={people} options={availablePeople} canManage={canManage} busy={mutation.isPending}
        unavailable={Boolean(issue.assigneesUnavailable && !lookup.assignees.isSuccess)} resolving={resolvingPeople}
        sourceError={members.isError || lookup.assignees.isError}
        onRetry={() => { if (members.isError) void members.refetch(); if (lookup.assignees.isError) void lookup.assignees.refetch(); }}
        loading={members.isPending} onChange={change}
      />
      <AssignmentGroup
        kind="labels" items={tags} options={availableTags} canManage={canManage} busy={mutation.isPending}
        unavailable={Boolean(issue.labelsUnavailable && !lookup.labels.isSuccess)} resolving={resolvingLabels}
        sourceError={labels.isError || lookup.labels.isError}
        onRetry={() => { if (labels.isError) void labels.refetch(); if (lookup.labels.isError) void lookup.labels.refetch(); }}
        loading={labels.isPending} onChange={change}
      />
    </div>
  );
}

function AssignmentGroup({ kind, items, options, canManage, busy, unavailable, resolving, sourceError, onRetry, loading, onChange }: {
  kind: IssueAssignmentChange["kind"];
  items: Option[];
  options: Option[];
  canManage: boolean;
  busy: boolean;
  unavailable: boolean;
  resolving: boolean;
  sourceError: boolean;
  onRetry: () => void;
  loading: boolean;
  onChange: (input: IssueAssignmentChange) => Promise<void>;
}) {
  const id = useId();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const singular = kind === "assignees" ? "assignee" : "label";
  const Icon = kind === "assignees" ? Users : Tag;
  const attached = new Set(items.map((item) => item.id));
  const available = options.filter((option) => !attached.has(option.id));

  async function change(action: "add" | "remove", option: string) {
    if (busy || !canManage) return;
    setError("");
    setNotice("");
    try {
      await onChange({ kind, action, id: option });
      if (action === "add") setSelected("");
      setNotice(action === "add" ? "Added." : "Removed.");
    } catch (error) {
      setError(getIssueError(error, `Could not ${action} the ${singular}.`));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (available.some((option) => option.id === selected)) void change("add", selected);
  }

  return (
    <section aria-labelledby={id} className="min-w-0 space-y-2">
      <h3 id={id} className="flex items-center gap-2 text-sm font-semibold text-slate-900 capitalize">
        <Icon size={15} aria-hidden="true" className="text-indigo-700" /> {kind}
      </h3>
      {items.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label={kind}>
          {items.map((item) => (
            <li key={item.id} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-0.5 pr-1.5 pl-2 text-xs font-medium text-slate-700">
              {item.color && <span aria-hidden="true" className="size-2 shrink-0 rounded-full border border-slate-900/15" style={{ backgroundColor: item.color }} />}
              <span className="wrap-anywhere">{item.name}</span>
              {canManage && (
                <button type="button" aria-label={`Remove ${singular} ${item.name}`} disabled={busy} className="rounded-full p-1 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-50" onClick={() => void change("remove", item.id)}>
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : !unavailable && <p className="text-xs text-slate-600">{kind === "assignees" ? "Unassigned" : "No labels"}</p>}
      {unavailable && resolving && <p role="status" className="text-xs text-slate-600">Loading {kind}…</p>}
      {sourceError && (
        <div className="flex flex-wrap items-center gap-2">
          <p role="alert" className="text-xs text-red-700">Could not load available {kind}.</p>
          <button className={actionClass} type="button" onClick={onRetry}>Try again</button>
        </div>
      )}
      {canManage && !sourceError && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <select aria-label={`Choose ${singular}`} value={available.some((option) => option.id === selected) ? selected : ""} disabled={loading || resolving || busy || !available.length} onChange={(event) => { setSelected(event.currentTarget.value); setError(""); }} className="min-h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60">
            <option value="">{loading ? "Loading…" : available.length ? `Choose ${singular}` : `No available ${kind}`}</option>
            {available.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          <button type="submit" disabled={busy || resolving || !available.some((option) => option.id === selected)} className={actionClass}><Plus size={14} aria-hidden="true" /> Add {singular}</button>
        </form>
      )}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {notice && <p role="status" className="sr-only">{notice}</p>}
    </section>
  );
}
