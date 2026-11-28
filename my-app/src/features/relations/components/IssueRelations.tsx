"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ArrowUpRight, Link2, Plus, RotateCw, Unlink2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { getRelationError, relationTypes, type IssueRelation } from "../api/relation.api";
import { useCreateRelation } from "../hooks/useCreateRelation";
import { useDeleteRelation } from "../hooks/useDeleteRelation";
import { useIssueRelations } from "../hooks/useIssueRelations";
import RelationPicker, { relationLabels } from "./RelationPicker";

const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const primaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";

export default function IssueRelations({ slug, projectId, projectIdentifier, issueId, canManage }: {
  slug: string;
  projectId: string;
  projectIdentifier: string;
  issueId: string;
  canManage: boolean;
}) {
  const query = useIssueRelations(slug, projectId, issueId);
  const create = useCreateRelation(slug, projectId, issueId);
  const remove = useDeleteRelation(slug, projectId, issueId);
  const projects = useProjects(slug);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [target, setTarget] = useState<IssueRelation | null>(null);
  const [removeError, setRemoveError] = useState("");
  const [notice, setNotice] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const groups = relationTypes.flatMap((type) => {
    const items = query.data?.[type] ?? [];
    return items.length ? [{ type, items }] : [];
  });
  const identifiers = new Map(projects.data?.map((project) => [project.id, project.identifier]));
  identifiers.set(projectId, projectIdentifier);
  const canChange = canManage && query.isSuccess;

  function restoreFocus(event: Event) {
    event.preventDefault();
    if (trigger.current?.isConnected) trigger.current.focus();
    else heading.current?.focus();
  }

  async function deleteRelation() {
    if (!target || !canManage || remove.isPending) return;
    setRemoveError("");
    try {
      await remove.mutateAsync(target);
      setTarget(null);
      setNotice("Relation removed.");
    } catch (error) {
      setRemoveError(getRelationError(error, "Could not remove the relation."));
    }
  }

  return (
    <section aria-labelledby="issue-relations-title" className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <Link2 size={18} aria-hidden="true" />
          </span>
          <h2 id="issue-relations-title" ref={heading} tabIndex={-1} className="rounded-sm text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500">Relations</h2>
        </div>
        {canManage && (
          <button type="button" className={primaryButton} disabled={!canChange || remove.isPending} onClick={(event) => {
            trigger.current = event.currentTarget;
            setNotice("");
            setPickerOpen(true);
          }}>
            <Plus size={16} aria-hidden="true" /> Add relation
          </button>
        )}
      </header>
      {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading relations…</p>}
      {query.isError && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <p role="alert" className="text-sm text-red-700">{getRelationError(query.error, "Could not load relations.")}</p>
          <button type="button" className={secondaryButton} onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RotateCw size={15} aria-hidden="true" className={query.isFetching ? "motion-safe:animate-spin" : undefined} />
            {query.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {query.isSuccess && !groups.length && <p className="px-5 py-6 text-sm text-slate-600">No related issues yet.</p>}
      {notice && <p role="status" className="px-5 py-3 text-sm text-emerald-800">{notice}</p>}
      {groups.map(({ type, items }) => (
        <div key={type} className="border-t border-slate-100 first:border-t-0">
          <h3 className="px-5 pt-3 text-xs font-semibold text-slate-600">{relationLabels[type]}</h3>
          <ul aria-label={relationLabels[type]} className="divide-y divide-slate-100">
            {items.map((relation) => {
              const issue = relation.related_issue;
              const identifier = identifiers.get(issue.project_id);

              return (
                <li key={relation.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Link
                    href={`/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(issue.project_id)}/issues/${encodeURIComponent(issue.id)}`}
                    className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-md text-sm font-medium text-slate-900 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">{identifier ? `${identifier}-${issue.sequence_id}` : `#${issue.sequence_id}`}</span>
                    <span className="wrap-anywhere">{issue.title}</span>
                    <ArrowUpRight size={14} aria-hidden="true" className="shrink-0 text-slate-400 group-hover:text-indigo-700" />
                  </Link>
                  {canManage && (
                    <button
                      type="button"
                      aria-label={`Remove ${relationLabels[type].toLowerCase()} relation with ${issue.title}`}
                      title="Remove relation"
                      disabled={remove.isPending}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-50"
                      onClick={(event) => {
                        trigger.current = event.currentTarget;
                        setNotice("");
                        setRemoveError("");
                        setTarget(relation);
                      }}
                    >
                      <Unlink2 size={16} aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {canManage && pickerOpen && (
        <RelationPicker
          slug={slug}
          projectId={projectId}
          issueId={issueId}
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onCloseAutoFocus={restoreFocus}
          relations={query.data}
          onAdd={async (input) => {
            await create.mutateAsync(input);
            setNotice("Relation added.");
          }}
        />
      )}
      <AlertDialog.Root open={canManage && target !== null} onOpenChange={(open) => { if (!open && !remove.isPending) setTarget(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
          <AlertDialog.Content
            className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl"
            onCloseAutoFocus={restoreFocus}
          >
            <AlertDialog.Title className="text-base font-semibold">Remove relation?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 wrap-anywhere text-sm text-slate-600">
              The connection with <span className="font-medium text-slate-900">{target?.related_issue.title}</span> will be removed from both issues.
            </AlertDialog.Description>
            {removeError && <p role="alert" className="mt-3 text-sm text-red-700">{removeError}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" className={secondaryButton} disabled={remove.isPending}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button type="button" className="inline-flex min-h-9 items-center justify-center rounded-lg bg-red-700 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50" disabled={remove.isPending} onClick={(event) => {
                  event.preventDefault();
                  void deleteRelation();
                }}>
                  {remove.isPending ? "Removing…" : "Remove relation"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
