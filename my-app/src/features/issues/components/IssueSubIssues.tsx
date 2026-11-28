"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, GitFork, Link2, RotateCw, Search, Unlink2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { ProjectState } from "@/features/projects/states/api/state.api";
import { getIssueError, type Issue, type IssuePage } from "../api/issue.api";
import { useIssues } from "../hooks/useIssues";
import { useUpdateIssue } from "../hooks/useUpdateIssue";
import IssueCreateDialog from "./IssueCreateDialog";

const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const overlay = "fixed inset-0 z-40 bg-slate-950/45";
const panel = "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl";

type IssueScope = { slug: string; projectId: string; projectIdentifier: string };

function collectIssues(pages: IssuePage[] = []) {
  return Array.from(new Map(pages.flatMap(({ data }) => data.map((item) => [item.id, item] as const))).values());
}

export default function IssueSubIssues({ slug, projectId, projectIdentifier, issue, states, canManage }: IssueScope & {
  issue: Issue;
  states: ProjectState[];
  canManage: boolean;
}) {
  const headingId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const unlinkTrigger = useRef<HTMLButtonElement>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<Issue | null>(null);
  const [notice, setNotice] = useState("");
  const children = useIssues(slug, projectId, { parent_id: issue.id });
  const update = useUpdateIssue(slug, projectId, unlinkTarget?.id ?? "");
  const items = collectIssues(children.data?.pages);
  const issueListHref = `/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues`;
  const canAdd = canManage && !issue.parent_id;
  const missing = !children.data && children.isError;

  return (
    <section aria-labelledby={headingId} className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <GitFork size={18} aria-hidden="true" />
          </span>
          <h2 ref={heading} id={headingId} tabIndex={-1} className="rounded-sm text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500">Sub-issues</h2>
        </div>
        {canAdd && (
          <div className="flex flex-wrap gap-2">
            <LinkSubIssueDialog
              slug={slug}
              projectId={projectId}
              projectIdentifier={projectIdentifier}
              issueId={issue.id}
              onLinked={() => setNotice("Sub-issue linked.")}
            />
            <IssueCreateDialog
              slug={slug}
              projectId={projectId}
              listHref={issueListHref}
              states={states}
              parentId={issue.id}
              onCreated={() => setNotice("Sub-issue created.")}
            />
          </div>
        )}
      </header>
      {notice && <p role="status" className="sr-only">{notice}</p>}
      {children.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading sub-issues…</p>}
      {(missing || children.isRefetchError) && (
        <QueryError error={children.error} fallback="Could not load sub-issues." busy={children.isFetching} onRetry={() => void children.refetch()} />
      )}
      {children.isSuccess && items.length === 0 && (
        <p className="px-5 py-6 text-sm text-slate-600">{issue.parent_id ? "Sub-issues can only be one level deep." : "No sub-issues yet."}</p>
      )}
      {items.length > 0 && (
        <ul aria-label="Sub-issues" aria-busy={children.isFetching} className="divide-y divide-slate-100">
          {items.map((child) => {
            const key = `${projectIdentifier}-${child.sequence_id}`;
            const state = states.find(({ id }) => id === child.state_id);
            return (
              <li key={child.id} className="flex flex-wrap items-center gap-2.5 px-5 py-3">
                <Link href={`${issueListHref}/${encodeURIComponent(child.id)}`} className="group flex min-w-0 flex-1 items-start gap-2.5 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-indigo-500">
                  <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">{key}</span>
                  <span className="min-w-0 wrap-anywhere font-medium text-slate-900 group-hover:text-indigo-700">{child.title}</span>
                  <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-slate-400 group-hover:text-indigo-700" />
                </Link>
                {state && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700">
                    <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: state.color }} />
                    {state.name}
                  </span>
                )}
                {canManage && (
                  <button
                    type="button"
                    aria-label={`Unlink ${key}`}
                    className="inline-grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600"
                    onClick={(event) => {
                      unlinkTrigger.current = event.currentTarget;
                      update.reset();
                      setNotice("");
                      setUnlinkTarget(child);
                    }}
                  >
                    <Unlink2 size={16} aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {children.hasNextPage && (
        <Pagination
          busy={children.isFetching}
          error={children.isFetchNextPageError ? children.error : null}
          onLoad={() => void children.fetchNextPage()}
        />
      )}
      <AlertDialog.Root open={Boolean(unlinkTarget)} onOpenChange={(open) => {
        if (!open && !update.isPending) setUnlinkTarget(null);
      }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={overlay} />
          <AlertDialog.Content
            className={panel + " max-w-md"}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (unlinkTrigger.current?.isConnected) unlinkTrigger.current.focus();
              else heading.current?.focus();
            }}
          >
            <AlertDialog.Title className="text-base font-semibold">Unlink sub-issue?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 wrap-anywhere text-sm text-slate-600">
              <strong className="font-medium text-slate-900">{unlinkTarget?.title}</strong> will become a standalone issue.
            </AlertDialog.Description>
            {update.isError && <p role="alert" className="mt-3 text-sm text-red-700">{getIssueError(update.error, "Could not unlink the sub-issue.")}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" className={secondaryButton} disabled={update.isPending}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-red-700 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-50"
                  disabled={!canManage || !unlinkTarget || update.isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    if (!canManage || !unlinkTarget || update.isPending) return;
                    update.mutate({ parent_id: null }, {
                      onSuccess: () => {
                        setUnlinkTarget(null);
                        setNotice("Sub-issue unlinked.");
                      },
                    });
                  }}
                >
                  {update.isPending ? "Unlinking…" : "Unlink"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}

function LinkSubIssueDialog({ slug, projectId, projectIdentifier, issueId, onLinked }: IssueScope & {
  issueId: string;
  onLinked: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const searchId = useId();
  const selectionId = useId();

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchText.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const candidates = useIssues(slug, open ? projectId : "", { search });
  const options = collectIssues(candidates.data?.pages).filter((candidate) => candidate.id !== issueId && !candidate.parent_id);
  const selected = options.find(({ id }) => id === selectedId);
  const candidateChildren = useIssues(slug, selected ? projectId : "", { parent_id: selected?.id });
  const hasChildren = Boolean(candidateChildren.data?.pages.some(({ data }) => data.length > 0));
  const update = useUpdateIssue(slug, projectId, selectedId);
  const searching = searchText.trim() !== search || candidates.isPending;
  const canSubmit = Boolean(selected) && !searching && !candidates.isError && candidateChildren.isSuccess
    && !candidateChildren.isFetching && !hasChildren && !update.isPending;

  function changeOpen(next: boolean) {
    if (update.isPending) return;
    setOpen(next);
    setSearch("");
    setSearchText("");
    setSelectedId("");
    update.reset();
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={secondaryButton}><Link2 size={16} aria-hidden="true" /> Link existing</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={overlay} />
        <Dialog.Content className={panel + " max-w-lg"}>
          <Dialog.Title className="text-base font-semibold">Link existing issue</Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm text-slate-600">
            Choose a project issue without a parent or sub-issues.
          </Dialog.Description>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!canSubmit) return;
              update.mutate({ parent_id: issueId }, {
                onSuccess: () => {
                  setOpen(false);
                  setSearch("");
                  setSearchText("");
                  setSelectedId("");
                  onLinked();
                },
              });
            }}
          >
            <div>
              <label htmlFor={searchId} className="mb-1.5 block text-sm font-medium">Search issues</label>
              <div className="relative">
                <Search size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                <input
                  id={searchId}
                  type="search"
                  autoComplete="off"
                  value={searchText}
                  disabled={update.isPending}
                  onChange={(event) => {
                    setSearchText(event.currentTarget.value);
                    setSelectedId("");
                    update.reset();
                  }}
                  className="min-h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div>
              <label htmlFor={selectionId} className="mb-1.5 block text-sm font-medium">Issue</label>
              <select
                id={selectionId}
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                value={selectedId}
                disabled={searching || update.isPending}
                onChange={(event) => {
                  setSelectedId(event.currentTarget.value);
                  update.reset();
                }}
              >
                <option value="">{searching ? "Loading issues…" : options.length ? "Choose an issue" : "No matching issues"}</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>{projectIdentifier}-{option.sequence_id} · {option.title}</option>
                ))}
              </select>
            </div>
            {candidates.isError && !candidates.isFetchNextPageError && (
              <QueryError error={candidates.error} fallback="Could not load issues." busy={candidates.isFetching} onRetry={() => void candidates.refetch()} />
            )}
            {!searching && candidates.hasNextPage && (
              <Pagination
                busy={candidates.isFetching || update.isPending}
                error={candidates.isFetchNextPageError ? candidates.error : null}
                onLoad={() => void candidates.fetchNextPage()}
              />
            )}
            {selected && candidateChildren.isFetching && <p role="status" className="text-sm text-slate-600">Checking whether this issue can be linked…</p>}
            {selected && candidateChildren.isError && (
              <QueryError error={candidateChildren.error} fallback="Could not check this issue." busy={candidateChildren.isFetching} onRetry={() => void candidateChildren.refetch()} />
            )}
            {hasChildren && <p role="alert" className="text-sm text-red-700">This issue already has sub-issues. Choose another issue.</p>}
            {update.isError && <p role="alert" className="text-sm text-red-700">{getIssueError(update.error, "Could not link the sub-issue.")}</p>}
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
              <Dialog.Close asChild><button type="button" className={secondaryButton} disabled={update.isPending}>Cancel</button></Dialog.Close>
              <button type="submit" className={primaryButton} disabled={!canSubmit}>{update.isPending ? "Linking…" : "Link issue"}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function QueryError({ error, fallback, busy, onRetry }: {
  error: unknown;
  fallback: string;
  busy: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-3">
      <p role="alert" className="text-sm text-red-700">{getIssueError(error, fallback)}</p>
      <button type="button" className={secondaryButton} onClick={onRetry} disabled={busy}>
        <RotateCw size={15} aria-hidden="true" /> {busy ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

function Pagination({ busy, error, onLoad }: { busy: boolean; error: unknown; onLoad: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 px-5 py-3">
      {Boolean(error) && <p role="alert" className="text-sm text-red-700">{getIssueError(error, "Could not load more issues.")}</p>}
      <button type="button" className={secondaryButton} onClick={onLoad} disabled={busy}>
        {busy ? "Loading…" : "Load more issues"}
      </button>
    </div>
  );
}
