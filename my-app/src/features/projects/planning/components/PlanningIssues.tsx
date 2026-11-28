"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, Plus, RotateCw, Search, Unlink2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectError } from "../../api/project.api";
import type { PlanningIssue, PlanningIssuePage, PlanningIssuePriority, PlanningKind } from "../api/planning-issue.api";
import { planningIssueQueryKeys } from "../hooks/planning-issue-query-keys";
import { useAvailablePlanningIssues } from "../hooks/useAvailablePlanningIssues";
import { useLinkedPlanningIssues } from "../hooks/useLinkedPlanningIssues";

const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const overlay = "fixed inset-0 z-40 bg-slate-950/45";
const dialogContent = "fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl";

const priorityClasses = {
  none: "bg-slate-100 text-slate-600",
  low: "bg-sky-50 text-sky-700",
  medium: "bg-indigo-50 text-indigo-700",
  high: "bg-amber-50 text-amber-800",
  urgent: "bg-red-50 text-red-700",
} satisfies Record<PlanningIssuePriority, string>;

function collectIssues(pages: PlanningIssuePage[] = []) {
  return Array.from(new Map(pages.flatMap((page) => page.data.map((issue) => [issue.id, issue] as const))).values());
}

function IssueSummary({ issue }: { issue: PlanningIssue }) {
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2.5">
          <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
            #{issue.sequence_id}
          </span>
          <span className="min-w-0 wrap-break-word text-sm font-medium text-slate-900 group-hover:text-indigo-700">{issue.title}</span>
        </span>
      </span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityClasses[issue.priority]}`}>
        {issue.priority === "none" ? "No priority" : issue.priority}
      </span>
    </>
  );
}

function LoadMore({ busy, onLoad }: { busy: boolean; onLoad: () => void }) {
  return (
    <div className="flex justify-center border-t border-slate-100 px-4 py-3">
      <button type="button" className={secondaryButton} onClick={onLoad} disabled={busy}>
        {busy ? "Loading…" : "Load more issues"}
      </button>
    </div>
  );
}

function IssueListError({ message, retry, busy }: { message: string; retry: () => void; busy: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
      <p role="alert" className="text-sm text-red-700">{message}</p>
      <button type="button" className={secondaryButton} onClick={retry} disabled={busy}>
        <RotateCw size={15} className={busy ? "motion-safe:animate-spin" : undefined} aria-hidden="true" />
        {busy ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

export default function PlanningIssues({
  slug,
  projectId,
  kind,
  containerId,
  canManage,
  onAdd,
  onRemove,
  busy = false,
}: {
  slug: string;
  projectId: string;
  kind: PlanningKind;
  containerId: string;
  canManage: boolean;
  onAdd: (issueIds: string[]) => Promise<unknown>;
  onRemove: (issueId: string) => Promise<unknown>;
  busy?: boolean;
}) {
  const titleId = useId();
  const searchId = useId();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const container = { kind, id: containerId };
  const linked = useLinkedPlanningIssues(slug, projectId, container);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [issueToRemove, setIssueToRemove] = useState<PlanningIssue | null>(null);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<string[]>([]);
  const [acting, setActing] = useState<"add" | "remove" | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchText.trim()), 220);
    return () => window.clearTimeout(timeout);
  }, [searchText]);

  const available = useAvailablePlanningIssues(slug, projectId, container, search, canManage && pickerOpen);
  const linkedIssues = collectIssues(linked.data?.pages);
  const availableIssues = collectIssues(available.data?.pages);
  const availableIds = new Set(availableIssues.map((issue) => issue.id));
  const selectedIds = selection.filter((id) => availableIds.has(id));
  const searchPending = search !== searchText.trim();
  const isBusy = busy || acting !== null;
  const mayAdd = !isBusy && !searchPending && !available.isError && selectedIds.length > 0;

  function resetPicker() {
    setPickerOpen(false);
    setSearchText("");
    setSearch("");
    setSelection([]);
  }

  function focusPrevious(event: Event) {
    event.preventDefault();
    if (trigger.current?.isConnected) trigger.current.focus();
    else heading.current?.focus();
  }

  function refreshIssueLists() {
    return queryClient.invalidateQueries({ queryKey: planningIssueQueryKeys.project(userId, slug, projectId) });
  }

  async function addSelectedIssues() {
    if (!canManage || !mayAdd) return;

    setActing("add");
    setActionError("");
    setNotice("");
    try {
      await onAdd(selectedIds);
      await refreshIssueLists();
      setNotice("Issue links updated.");
      resetPicker();
    } catch (error) {
      setActionError(getProjectError(error, "Could not add these issues."));
    } finally {
      setActing(null);
    }
  }

  async function removeIssue() {
    if (!canManage || !issueToRemove || isBusy) return;

    setActing("remove");
    setActionError("");
    setNotice("");
    try {
      await onRemove(issueToRemove.id);
      await refreshIssueLists();
      setNotice("Issue unlinked.");
      setIssueToRemove(null);
    } catch (error) {
      setActionError(getProjectError(error, "Could not unlink this issue."));
    } finally {
      setActing(null);
    }
  }

  return (
    <section aria-labelledby={titleId} className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <Link2 size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 ref={heading} tabIndex={-1} id={titleId} className="text-sm font-semibold text-slate-900 outline-none">Linked issues</h2>
            <p className="mt-0.5 text-xs text-slate-600">Issues in this {kind}.</p>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            className={primaryButton}
            disabled={isBusy}
            onClick={(event) => {
              trigger.current = event.currentTarget;
              setActionError("");
              setPickerOpen(true);
            }}
          >
            <Plus size={16} aria-hidden="true" /> Add issues
          </button>
        )}
      </header>

      {notice && <p role="status" className="border-b border-slate-100 px-5 py-3 text-sm text-emerald-800">{notice}</p>}
      {linked.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading linked issues…</p>}
      {linked.isError && (
        <IssueListError
          message={getProjectError(linked.error, "Could not load linked issues.")}
          retry={() => void (linked.isFetchNextPageError ? linked.fetchNextPage() : linked.refetch())}
          busy={linked.isFetching}
        />
      )}
      {linked.data && linkedIssues.length === 0 && (
        <p className="px-5 py-6 text-sm text-slate-600">No issues linked yet.</p>
      )}
      {linkedIssues.length > 0 && (
        <ul className="divide-y divide-slate-100" aria-label="Linked issues">
          {linkedIssues.map((issue) => (
            <li key={issue.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <Link
                href={`/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issue.id)}`}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <IssueSummary issue={issue} />
              </Link>
              {canManage && (
                <button
                  type="button"
                  aria-label={`Unlink ${issue.title}`}
                  title="Unlink issue"
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-50"
                  disabled={isBusy}
                  onClick={(event) => {
                    trigger.current = event.currentTarget;
                    setActionError("");
                    setIssueToRemove(issue);
                  }}
                >
                  <Unlink2 size={16} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {linked.hasNextPage && !linked.isFetchNextPageError && (
        <LoadMore busy={linked.isFetching} onLoad={() => void linked.fetchNextPage()} />
      )}

      <Dialog.Root open={canManage && pickerOpen} onOpenChange={(open) => { if (!open && !isBusy) resetPicker(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className={overlay} />
          <Dialog.Content className={`${dialogContent} max-w-lg`} onCloseAutoFocus={focusPrevious}>
            <Dialog.Title className="text-base font-semibold">Add issues</Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm text-slate-600">
              {kind === "cycle"
                ? "Each issue can belong to one cycle. Adding one here moves it from any previous cycle."
                : "An issue can belong to multiple modules."}
            </Dialog.Description>
            <label htmlFor={searchId} className="mt-4 block text-sm font-medium">Search issues</label>
            <div className="relative mt-1.5">
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                id={searchId}
                type="search"
                value={searchText}
                autoComplete="off"
                placeholder="Search by title or description"
                disabled={isBusy}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setSelection([]);
                  setActionError("");
                }}
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />
            </div>

            <div className="mt-4 rounded-lg border border-slate-200">
              {searchPending || available.isPending ? (
                <p role="status" className="px-4 py-5 text-sm text-slate-600">Loading available issues…</p>
              ) : (
                <>
                  {available.isError && (
                    <IssueListError
                      message={getProjectError(available.error, "Could not load available issues.")}
                      retry={() => void (available.isFetchNextPageError ? available.fetchNextPage() : available.refetch())}
                      busy={available.isFetching}
                    />
                  )}
                  {available.data && availableIssues.length === 0 && (
                    <p className="px-4 py-5 text-sm text-slate-600">
                      {available.hasNextPage
                        ? "No available issues on the loaded pages. Load more to keep looking."
                        : "No available issues found."}
                    </p>
                  )}
                  {availableIssues.length > 0 && (
                    <ul aria-label="Available issues" className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                      {availableIssues.map((issue) => (
                        <li key={issue.id}>
                          <label className="flex min-w-0 cursor-pointer flex-wrap items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(issue.id)}
                              disabled={isBusy}
                              className="size-4 shrink-0 accent-indigo-600"
                              onChange={(event) => {
                                const checked = event.target.checked;
                                setSelection((ids) => checked ? [...ids, issue.id] : ids.filter((id) => id !== issue.id));
                              }}
                            />
                            <IssueSummary issue={issue} />
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                  {available.hasNextPage && !available.isFetchNextPageError && (
                    <LoadMore busy={available.isFetching || isBusy} onLoad={() => void available.fetchNextPage()} />
                  )}
                </>
              )}
            </div>
            {actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-600">{selectedIds.length} selected</p>
              <div className="ml-auto flex flex-wrap justify-end gap-2">
                <Dialog.Close asChild>
                  <button type="button" className={secondaryButton} disabled={isBusy}>Cancel</button>
                </Dialog.Close>
                <button type="button" className={primaryButton} disabled={!mayAdd} onClick={() => void addSelectedIssues()}>
                  {acting === "add" ? "Adding…" : "Add selected issues"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={canManage && issueToRemove !== null} onOpenChange={(open) => { if (!open && !isBusy) setIssueToRemove(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={overlay} />
          <AlertDialog.Content className={`${dialogContent} max-w-md`} onCloseAutoFocus={focusPrevious}>
            <AlertDialog.Title className="text-base font-semibold">Unlink issue?</AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 wrap-break-word text-sm text-slate-600">
              {issueToRemove?.title} will be removed from this {kind}. It will stay in the project.
            </AlertDialog.Description>
            {actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" className={secondaryButton} disabled={isBusy}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  disabled={isBusy}
                  className="min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                  onClick={(event) => { event.preventDefault(); void removeIssue(); }}
                >
                  {acting === "remove" ? "Unlinking…" : "Unlink issue"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
