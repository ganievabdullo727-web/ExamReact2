"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, Plus, RotateCw, Tag, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { getProjectError } from "../../api/project.api";
import type { ProjectLabel } from "../api/label.api";
import { useCreateProjectLabel } from "../hooks/useCreateProjectLabel";
import { useDeleteProjectLabel } from "../hooks/useDeleteProjectLabel";
import { useProjectLabels } from "../hooks/useProjectLabels";
import { useUpdateProjectLabel } from "../hooks/useUpdateProjectLabel";
import type { ProjectLabelFormData } from "../schemas/label.schema";
import ProjectLabelForm from "./ProjectLabelForm";

const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const rowButton = "grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 focus-visible:outline-2 disabled:opacity-50";
const overlay = "fixed inset-0 z-40 bg-slate-950/45";
const dialogBox = "fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl";

type Editor = { mode: "create" } | { mode: "edit"; label: ProjectLabel };

export default function ProjectLabels({ slug, projectId, canManage }: {
  slug: string;
  projectId: string;
  canManage: boolean;
}) {
  const query = useProjectLabels(slug, projectId);
  const create = useCreateProjectLabel(slug, projectId);
  const update = useUpdateProjectLabel(slug, projectId);
  const remove = useDeleteProjectLabel(slug, projectId);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [labelToDelete, setLabelToDelete] = useState<ProjectLabel | null>(null);
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const lastTrigger = useRef<HTMLButtonElement>(null);
  const saving = create.isPending || update.isPending;
  const busy = saving || remove.isPending;
  const labels = query.data;

  function restoreFocus(event: Event) {
    event.preventDefault();
    if (lastTrigger.current?.isConnected) lastTrigger.current.focus();
    else heading.current?.focus();
  }

  async function saveLabel(values: ProjectLabelFormData) {
    if (!canManage || !editor || busy) return;
    setNotice("");
    if (editor.mode === "edit") {
      const changes = {
        ...(values.name !== editor.label.name.trim() ? { name: values.name } : {}),
        ...(values.color !== editor.label.color.toUpperCase() ? { color: values.color } : {}),
      };
      if (changes.name !== undefined || changes.color !== undefined) {
        const saved = await update.mutateAsync({ labelId: editor.label.id, label: changes });
        setNotice(`${saved.name} was updated.`);
      }
    } else {
      const saved = await create.mutateAsync(values);
      setNotice(`${saved.name} was created.`);
    }
    setEditor(null);
  }

  async function confirmDelete() {
    if (!canManage || !labelToDelete || busy) return;
    setNotice("");
    try {
      await remove.mutateAsync(labelToDelete.id);
      setNotice(`${labelToDelete.name} was deleted.`);
      setLabelToDelete(null);
    } catch {
      // The mutation error is rendered in the confirmation dialog.
    }
  }

  return (
    <section aria-labelledby="project-labels-title" className="max-w-3xl rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <Tag size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 ref={heading} id="project-labels-title" tabIndex={-1} className="text-sm font-semibold text-slate-900 outline-none">Labels</h2>
            <p className="mt-0.5 text-sm text-slate-600">
              {canManage ? "Organize project issues with colored labels." : "Workspace owners and admins manage project labels."}
            </p>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            disabled={busy}
            className={primaryButton}
            onClick={(event) => {
              lastTrigger.current = event.currentTarget;
              setEditor({ mode: "create" });
            }}
          >
            <Plus size={16} aria-hidden="true" />
            New label
          </button>
        )}
      </header>

      {notice && <p role="status" className="border-b border-slate-100 px-5 py-3 text-sm text-emerald-800">{notice}</p>}
      {query.isError && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
          <p role="alert" className="text-sm text-red-700">{getProjectError(query.error, "Could not load project labels.")}</p>
          <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()} className={secondaryButton}>
            <RotateCw size={15} aria-hidden="true" className={query.isFetching ? "motion-safe:animate-spin" : undefined} />
            {query.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading labels…</p>}
      {labels?.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600"><Tag size={19} aria-hidden="true" /></span>
          <p className="text-sm font-medium text-slate-900">No labels yet</p>
          {canManage && <p className="text-sm text-slate-600">Create a label to categorize issues.</p>}
        </div>
      )}
      {Boolean(labels?.length) && (
        <ul aria-label="Project labels" className="divide-y divide-slate-100">
          {labels?.map((label) => (
            <li key={label.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="size-3 shrink-0 rounded-full border border-slate-900/15" style={{ backgroundColor: label.color }} aria-hidden="true" />
                <span className="wrap-break-word text-sm font-medium text-slate-900">{label.name}</span>
              </div>
              <span className="rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">{label.color.toUpperCase()}</span>
              {canManage && (
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label={`Edit ${label.name}`}
                    title={`Edit ${label.name}`}
                    className={`${rowButton} hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-indigo-600`}
                    disabled={busy}
                    onClick={(event) => {
                      lastTrigger.current = event.currentTarget;
                      setEditor({ mode: "edit", label });
                    }}
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${label.name}`}
                    title={`Delete ${label.name}`}
                    className={`${rowButton} hover:bg-red-50 hover:text-red-700 focus-visible:outline-red-600`}
                    disabled={busy}
                    onClick={(event) => {
                      lastTrigger.current = event.currentTarget;
                      remove.reset();
                      setLabelToDelete(label);
                    }}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog.Root open={canManage && editor !== null} onOpenChange={(open) => { if (!open && !saving) setEditor(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className={overlay} />
          <Dialog.Content className={dialogBox} onCloseAutoFocus={restoreFocus}>
            <Dialog.Title className="text-base font-semibold text-slate-900">{editor?.mode === "edit" ? "Edit label" : "Create label"}</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-600">Choose a name and color for this project label.</Dialog.Description>
            {editor && <ProjectLabelForm key={editor.mode === "edit" ? editor.label.id : "new"} label={editor.mode === "edit" ? editor.label : undefined} onSave={saveLabel} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root
        open={canManage && labelToDelete !== null}
        onOpenChange={(open) => { if (!open && !remove.isPending) setLabelToDelete(null); }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={overlay} />
          <AlertDialog.Content className={dialogBox} onCloseAutoFocus={restoreFocus}>
            <AlertDialog.Title className="break-words text-base font-semibold text-slate-900">Delete {labelToDelete?.name}?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-slate-600">This permanently removes the label from the project.</AlertDialog.Description>
            {remove.isError && <p role="alert" className="mt-3 text-sm text-red-700">{getProjectError(remove.error, "Could not delete the label.")}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" disabled={remove.isPending} className={secondaryButton}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  className="min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-50"
                  disabled={remove.isPending}
                  onClick={(event) => { event.preventDefault(); void confirmDelete(); }}
                >
                  {remove.isPending ? "Deleting…" : "Delete label"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
