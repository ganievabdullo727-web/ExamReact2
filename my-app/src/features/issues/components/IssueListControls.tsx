"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProjectLabels } from "@/features/projects/labels/hooks/useProjectLabels";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/useWorkspaceMembers";
import { issueGroupFields, issuePriorities, type IssueGroupBy, type IssueListFilters, type IssuePriority } from "../api/issue.api";
import type { ProjectState } from "@/features/projects/states/api/state.api";

const filterClass = "min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-100 disabled:opacity-50";
const listKeys = ["state", "priority", "assignee", "label"] as const;
const filterKeys = ["search", ...listKeys, "due_after", "due_before", "sort", "group_by"] as const;
type FilterKey = (typeof filterKeys)[number];
const sortOptions = [
  { id: "newest", label: "Newest first", sortBy: "created_at", order: "desc" },
  { id: "oldest", label: "Oldest first", sortBy: "created_at", order: "asc" },
  { id: "updated", label: "Recently updated", sortBy: "updated_at", order: "desc" },
  { id: "priority", label: "Highest priority", sortBy: "priority", order: "desc" },
  { id: "due", label: "Due date", sortBy: "due_date", order: "asc" },
  { id: "manual", label: "Sort order", sortBy: "sort_order", order: "asc" },
] as const;
const groupLabels: Record<IssueGroupBy, string> = { state: "State", priority: "Priority", assignee: "Assignee" };
const byValue = (value: string) => Boolean(value.trim());

function validDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const day = new Date(value + "T00:00:00.000Z");
  return Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== value ? "" : value;
}

export function issuePriorityLabel(value: IssuePriority) {
  return value === "none" ? "No priority" : value[0].toUpperCase() + value.slice(1);
}

export function useIssueListControls() {
  const params = useSearchParams();
  const searchInput = params.get("search") ?? "";
  const [search, setSearch] = useState(searchInput.trim());
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  const selected = {
    state: Array.from(new Set(params.getAll("state").filter(byValue))),
    priority: Array.from(new Set(params.getAll("priority").filter((item): item is IssuePriority => issuePriorities.some((priority) => priority === item)))),
    assignee: Array.from(new Set(params.getAll("assignee").filter(byValue))),
    label: Array.from(new Set(params.getAll("label").filter(byValue))),
  };
  const after = validDate(params.get("due_after"));
  const before = validDate(params.get("due_before"));
  const sort = sortOptions.find((option) => option.id === params.get("sort")) ?? sortOptions[0];
  const groupBy = issueGroupFields.find((group) => group === params.get("group_by"));
  const hasFilters = Boolean(searchInput || after || before || listKeys.some((key) => selected[key].length));
  const filters: IssueListFilters = {
    search,
    state: selected.state.length ? selected.state : undefined,
    priority: selected.priority.length ? selected.priority : undefined,
    assignee: selected.assignee.length ? selected.assignee : undefined,
    label: selected.label.length ? selected.label : undefined,
    due_after: after ? after + "T00:00:00.000Z" : undefined,
    due_before: before ? before + "T23:59:59.999Z" : undefined,
    sort_by: sort.sortBy,
    order: sort.order,
  };

  function updateParams(update: Partial<Record<FilterKey, string | string[]>>) {
    const url = new URL(window.location.href);
    for (const key of filterKeys) {
      const value = update[key];
      if (value === undefined) continue;
      url.searchParams.delete(key);
      for (const entry of typeof value === "string" ? [value] : value) {
        if (entry) url.searchParams.append(key, entry);
      }
    }
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  return {
    filters, selected, searchInput, searching: searchInput.trim() !== search, after, before, sort, groupBy, hasFilters, updateParams,
    clear: () => updateParams({ search: "", state: [], priority: [], assignee: [], label: [], due_after: "", due_before: "", sort: "", group_by: "" }),
  };
}

type Controls = ReturnType<typeof useIssueListControls>;
type FilterOption = { value: string; label: string };

function MultiFilter({ label, value, options, onChange }: {
  label: string;
  value: string[];
  options: FilterOption[];
  onChange: (value: string[]) => void;
}) {
  const known = new Set(options.map((option) => option.value));
  const entries = [...options, ...value.filter((item) => !known.has(item)).map((item) => ({ value: item, label: "Unavailable" }))];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className={filterClass + " inline-flex items-center gap-2"} disabled={!entries.length} aria-label={`Filter by ${label.toLowerCase()}`}>
          {label}
          {value.length > 0 && <span className="rounded-full bg-indigo-50 px-1.5 text-xs text-indigo-700">{value.length}</span>}
          <ChevronDown size={14} aria-hidden="true" className="text-slate-500" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={5} className="z-30 max-h-72 min-w-40 max-w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          {entries.map((entry) => (
            <DropdownMenu.CheckboxItem
              key={entry.value}
              checked={value.includes(entry.value)}
              className="relative cursor-default rounded-md py-1.5 pr-3 pl-8 text-sm text-slate-700 outline-none data-highlighted:bg-indigo-50 data-highlighted:text-indigo-800"
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) => onChange(checked ? [...value, entry.value] : value.filter((item) => item !== entry.value))}
            >
              <DropdownMenu.ItemIndicator className="absolute left-2 top-2"><Check size={14} aria-hidden="true" /></DropdownMenu.ItemIndicator>
              {entry.label}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function IssueListControls({ slug, projectId, states, controls }: {
  slug: string; projectId: string; states: ProjectState[]; controls: Controls;
}) {
  const memberQuery = useWorkspaceMembers(slug);
  const labelQuery = useProjectLabels(slug, projectId);
  const { selected, updateParams, hasFilters, sort, groupBy, clear } = controls;
  const options = {
    state: states.map(({ id, name }) => ({ value: id, label: name })),
    priority: issuePriorities.map((priority) => ({ value: priority, label: issuePriorityLabel(priority) })),
    assignee: (memberQuery.data ?? []).map(({ user_id, user }) => ({ value: user_id, label: user.display_name || user.email })),
    label: (labelQuery.data ?? []).map(({ id, name }) => ({ value: id, label: name })),
  };

  return (
    <div className="space-y-2 border-b border-slate-100 px-5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 max-w-sm flex-1">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute top-2.5 left-3 text-slate-400" />
          <input aria-label="Search issues" type="search" placeholder="Search issues" value={controls.searchInput} onChange={(event) => updateParams({ search: event.currentTarget.value })} className={filterClass + " w-full pl-9"} />
        </div>
        {listKeys.map((key) => <MultiFilter key={key} label={key[0].toUpperCase() + key.slice(1)} options={options[key]} value={selected[key]} onChange={(value) => updateParams({ [key]: value })} />)}
        {(hasFilters || groupBy || sort.id !== "newest") && (
          <button type="button" onClick={clear} className="min-h-9 rounded-lg px-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-500">Reset view</button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">Due from <input type="date" value={controls.after} max={controls.before || undefined} onChange={(event) => updateParams({ due_after: event.currentTarget.value })} className={filterClass} /></label>
        <label className="inline-flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">Due through <input type="date" value={controls.before} min={controls.after || undefined} onChange={(event) => updateParams({ due_before: event.currentTarget.value })} className={filterClass} /></label>
        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">Sort <select className={filterClass} value={sort.id} onChange={(event) => updateParams({ sort: event.currentTarget.value === "newest" ? "" : event.currentTarget.value })}>
          {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select></label>
        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">Group by <select className={filterClass} value={groupBy ?? ""} onChange={(event) => updateParams({ group_by: event.currentTarget.value })}>
          <option value="">None</option>
          {issueGroupFields.map((group) => <option key={group} value={group}>{groupLabels[group]}</option>)}
        </select></label>
      </div>
      {(memberQuery.isError || labelQuery.isError) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <p role="alert" className="text-red-700">Some filter options could not be loaded.</p>
          <button type="button" onClick={() => {
            if (memberQuery.isError) void memberQuery.refetch();
            if (labelQuery.isError) void labelQuery.refetch();
          }} className="font-medium text-indigo-700 hover:underline">Try again</button>
        </div>
      )}
    </div>
  );
}
