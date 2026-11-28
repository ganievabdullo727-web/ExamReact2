"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ProjectState } from "@/features/projects/states/api/state.api";
import { getIssueError, type Issue } from "../api/issue.api";
import { useDeleteIssue } from "../hooks/useDeleteIssue";
import { useUpdateIssue } from "../hooks/useUpdateIssue";
import { toUpdateIssueData } from "../schemas/issue.schema";
import IssueEditForm from "./IssueEditForm";

const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const dangerButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-50";
const confirmButton = "inline-flex min-h-10 items-center justify-center rounded-lg bg-red-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50";
const overlayClass = "fixed inset-0 z-40 bg-slate-950/45";
const dialogClass = "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl";

export default function IssueActions({
  slug,
  projectId,
  projectIdentifier,
  issue,
  states,
}: {
  slug: string;
  projectId: string;
  projectIdentifier: string;
  issue: Issue;
  states: ProjectState[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const update = useUpdateIssue(slug, projectId, issue.id);
  const remove = useDeleteIssue(slug, projectId, issue.id);
  const busy = update.isPending || remove.isPending;
  const issueKey = `${projectIdentifier}-${issue.sequence_id}`;
  const listHref = `/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues`;

  async function confirmDelete() {
    try {
      await remove.mutateAsync();
      setDeleteOpen(false);
      router.replace(listHref);
    } catch {
      // The confirmation stays open and displays the backend error.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {notice && <p role="status" className="sr-only">{notice}</p>}
      <Dialog.Root
        open={editOpen}
        onOpenChange={(open) => {
          if (busy) return;
          if (open) setNotice("");
          setEditOpen(open);
        }}
      >
        <Dialog.Trigger asChild>
          <button type="button" data-issue-action="edit" className={secondaryButton} disabled={busy}>
            <Pencil size={15} aria-hidden="true" /> Edit issue
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={overlayClass} />
          <Dialog.Content className={dialogClass + " max-w-xl"}>
            <Dialog.Title className="text-base font-semibold">Edit issue</Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm text-slate-600">
              Update {issueKey} in this project.
            </Dialog.Description>
            {editOpen && (
              <IssueEditForm
                slug={slug}
                projectId={projectId}
                projectIdentifier={projectIdentifier}
                issue={issue}
                states={states}
                onSubmit={async (values, original) => {
                  const patch = toUpdateIssueData(values, original);
                  if (Object.keys(patch).length > 0) {
                    await update.mutateAsync(patch);
                    setNotice(`${issueKey} updated.`);
                  }
                  setEditOpen(false);
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root
        open={deleteOpen}
        onOpenChange={(open) => {
          if (busy) return;
          if (open) remove.reset();
          setDeleteOpen(open);
        }}
      >
        <AlertDialog.Trigger asChild>
          <button type="button" data-issue-action="delete" className={dangerButton} disabled={busy}>
            <Trash2 size={15} aria-hidden="true" /> Delete issue
          </button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={overlayClass} />
          <AlertDialog.Content className={dialogClass + " max-w-md"}>
            <AlertDialog.Title className="text-base font-semibold">Delete {issueKey}?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-slate-600">
              This issue will be removed from the project’s issue list.
            </AlertDialog.Description>
            <p className="mt-3 wrap-break-word rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium">
              {issue.title}
            </p>
            {remove.isError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {getIssueError(remove.error, "Could not delete the issue.")}
              </p>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" className={secondaryButton} disabled={remove.isPending}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  data-issue-action="confirm-delete"
                  className={confirmButton}
                  disabled={remove.isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    void confirmDelete();
                  }}
                >
                  {remove.isPending ? "Deleting…" : "Delete issue"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
