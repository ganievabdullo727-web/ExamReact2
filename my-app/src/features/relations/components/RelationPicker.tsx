"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Plus, RotateCw, Search } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import { getIssueError } from "@/features/issues/api/issue.api";
import { useIssues } from "@/features/issues/hooks/useIssues";
import { getProjectError } from "@/features/projects/api/project.api";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { getRelationError, relationTypes, type GroupedRelations, type RelationType } from "../api/relation.api";

export const relationLabels: Record<RelationType, string> = {
  blocks: "Blocks",
  blocked_by: "Blocked by",
  relates_to: "Relates to",
  duplicates: "Duplicates",
};

const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const inputClass = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50";

type RelationPickerProps = {
  slug: string;
  projectId: string;
  issueId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
  onAdd: (input: { related_issue_id: string; relation_type: RelationType }) => Promise<unknown>;
  relations?: GroupedRelations;
};

export default function RelationPicker({ open, onOpenChange, onCloseAutoFocus, ...props }: RelationPickerProps) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl"
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <Dialog.Title className="text-base font-semibold">Add relation</Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm text-slate-600">Choose how this issue is linked to another issue in this workspace.</Dialog.Description>
          <RelationForm
            {...props}
            submitting={submitting}
            setSubmitting={setSubmitting}
            onSuccess={() => onOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RelationForm({ slug, projectId, issueId, onAdd, relations, submitting, setSubmitting, onSuccess }: Omit<RelationPickerProps, "open" | "onOpenChange" | "onCloseAutoFocus"> & {
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  onSuccess: () => void;
}) {
  const id = useId();
  const [targetProjectId, setTargetProjectId] = useState(projectId);
  const [type, setType] = useState<RelationType>("relates_to");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [targetId, setTargetId] = useState("");
  const [error, setError] = useState("");
  const projects = useProjects(slug);
  const issues = useIssues(slug, targetProjectId, { search });

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchText.trim()), 220);
    return () => window.clearTimeout(timeout);
  }, [searchText]);

  const matches = projects.data ?? [];
  const currentProject = matches.find((project) => project.id === projectId);
  const targetProject = matches.find((project) => project.id === targetProjectId);
  const linkedIds = new Set(relations?.[type].map((relation) => relation.related_issue_id));
  const candidates = Array.from(new Map(
    issues.data?.pages.flatMap((page) => page.data
      .filter((issue) => issue.id !== issueId && !linkedIds.has(issue.id))
      .map((issue) => [issue.id, issue] as const)),
  ).values());
  const searching = searchText.trim() !== search;
  const canSubmit = !submitting && !searching && candidates.some((issue) => issue.id === targetId);

  function resetSelection() {
    setTargetId("");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await onAdd({ related_issue_id: targetId, relation_type: type });
      onSuccess();
    } catch (error) {
      setError(getRelationError(error, "Could not add the relation."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor={`${id}-type`} className="mb-1.5 block text-sm font-medium">Relation type</label>
          <select
            id={`${id}-type`}
            value={type}
            onChange={(event) => { setType(event.currentTarget.value as RelationType); resetSelection(); }}
            disabled={submitting}
            className={inputClass}
          >
            {relationTypes.map((relation) => <option key={relation} value={relation}>{relationLabels[relation]}</option>)}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-project`} className="mb-1.5 block text-sm font-medium">Project</label>
          <select
            id={`${id}-project`}
            value={targetProjectId}
            onChange={(event) => { setTargetProjectId(event.currentTarget.value); resetSelection(); }}
            disabled={submitting}
            className={inputClass}
          >
            <option value={projectId}>{currentProject ? `${currentProject.name} (${currentProject.identifier})` : "Current project"}</option>
            {matches.filter((project) => project.id !== projectId).map((project) => (
              <option key={project.id} value={project.id}>{project.name} ({project.identifier})</option>
            ))}
          </select>
        </div>
      </div>
      {projects.isError && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p role="alert" className="text-sm text-red-700">{getProjectError(projects.error, "Could not load workspace projects.")}</p>
          <button type="button" className={secondaryButton} onClick={() => void projects.refetch()} disabled={submitting || projects.isFetching}>
            <RotateCw size={15} aria-hidden="true" /> Retry projects
          </button>
        </div>
      )}
      <div>
        <label htmlFor={`${id}-search`} className="mb-1.5 block text-sm font-medium">Search issues</label>
        <div className="relative">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-slate-400" />
          <input
            id={`${id}-search`}
            value={searchText}
            onChange={(event) => { setSearchText(event.currentTarget.value); resetSelection(); }}
            type="search"
            autoComplete="off"
            placeholder="Search by title or description"
            disabled={submitting}
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>
      <div className="rounded-lg border border-slate-200">
        {searching || issues.isPending ? (
          <p role="status" className="px-4 py-5 text-sm text-slate-600">Loading issues…</p>
        ) : (
          <>
            {issues.isError && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <p role="alert" className="text-sm text-red-700">{getIssueError(issues.error, "Could not load issues.")}</p>
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => void (issues.isFetchNextPageError ? issues.fetchNextPage() : issues.refetch())}
                  disabled={submitting || issues.isFetching}
                >
                  <RotateCw size={15} aria-hidden="true" /> Retry issues
                </button>
              </div>
            )}
            {issues.data && candidates.length === 0 && (
              <p className="px-4 py-5 text-sm text-slate-600">
                {issues.hasNextPage ? "No matching issues on these pages. Load more to keep looking." : "No matching issues available for this relation."}
              </p>
            )}
            {candidates.length > 0 && (
              <fieldset className="min-w-0">
                <legend className="sr-only">Issue to link</legend>
                <ul className="max-h-60 divide-y divide-slate-100 overflow-y-auto">
                  {candidates.map((issue) => (
                    <li key={issue.id}>
                      <label className="flex min-w-0 cursor-pointer items-start gap-3 px-4 py-2.5 hover:bg-slate-50 has-checked:bg-indigo-50">
                        <input
                          type="radio"
                          name={`${id}-issue`}
                          checked={targetId === issue.id}
                          disabled={submitting}
                          onChange={() => { setTargetId(issue.id); setError(""); }}
                          className="mt-0.5 size-4 shrink-0 accent-indigo-600"
                        />
                        <span className="min-w-0 wrap-anywhere text-sm text-slate-900">
                          <span className="mr-2 font-mono text-xs font-medium text-indigo-700">
                            {targetProject ? `${targetProject.identifier}-` : "#"}{issue.sequence_id}
                          </span>
                          {issue.title}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
            {issues.hasNextPage && !issues.isFetchNextPageError && (
              <div className="flex justify-center border-t border-slate-100 px-4 py-3">
                <button type="button" className={secondaryButton} onClick={() => void issues.fetchNextPage()} disabled={submitting || issues.isFetching}>
                  {issues.isFetchingNextPage ? "Loading…" : "Load more issues"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <Dialog.Close asChild>
          <button type="button" className={secondaryButton} disabled={submitting}>Cancel</button>
        </Dialog.Close>
        <button type="submit" className={primaryButton} disabled={!canSubmit}>
          <Plus size={16} aria-hidden="true" /> {submitting ? "Adding…" : "Add relation"}
        </button>
      </div>
    </form>
  );
}
