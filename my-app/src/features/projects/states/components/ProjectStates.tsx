"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import { CircleDot, Pencil, Plus, RotateCw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { getProjectError } from "../../api/project.api";
import { stateGroups, type ProjectState, type StateGroup } from "../api/state.api";
import { useCreateProjectState } from "../hooks/useCreateProjectState";
import { useDeleteProjectState } from "../hooks/useDeleteProjectState";
import { useProjectStates } from "../hooks/useProjectStates";
import { useUpdateProjectState } from "../hooks/useUpdateProjectState";
import { maxStateOrder, projectStateSchema, stateColorPattern, type ProjectStateFormData } from "../schemas/state.schema";

const field = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50";
const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const primary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const danger = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50";
const overlay = "fixed inset-0 z-40 bg-slate-950/45";
const dialog = "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl";
const groupLabels = {
  backlog: "Backlog",
  unstarted: "Unstarted",
  started: "Started",
  completed: "Completed",
  cancelled: "Cancelled",
} satisfies Record<StateGroup, string>;
const groupStyles = {
  backlog: "bg-slate-100 text-slate-700",
  unstarted: "bg-slate-100 text-slate-700",
  started: "bg-amber-50 text-amber-800",
  completed: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-rose-50 text-rose-800",
} satisfies Record<StateGroup, string>;
const defaultColor = "#594BDB";

type Editor = { kind: "create"; order: number } | { kind: "edit"; state: ProjectState };

function StateEditor({ editor, onSave }: { editor: Editor; onSave: (data: ProjectStateFormData) => Promise<void> }) {
  const original = editor.kind === "edit" ? editor.state : null;
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProjectStateFormData>({
    resolver: zodResolver(projectStateSchema),
    defaultValues: original ? {
      name: original.name,
      color: original.color,
      group: original.group,
      order: original.order,
      is_default: original.is_default,
    } : {
      name: "",
      color: defaultColor,
      group: "unstarted",
      order: editor.kind === "create" ? editor.order : 0,
      is_default: false,
    },
  });
  const color = useWatch({ control, name: "color" });
  const submit = handleSubmit(async (values) => {
    clearErrors("root.server");
    try {
      await onSave(values);
    } catch (error) {
      setError("root.server", {
        message: getProjectError(error, "Could not save the state. Please try again."),
      });
    }
  });

  return (
    <>
      <Dialog.Title className="text-base font-semibold">{original ? "Edit state" : "Create state"}</Dialog.Title>
      <Dialog.Description className="mt-1.5 text-sm text-slate-600">
        {original ? "Update a status in this project’s workflow." : "Add a status to this project’s workflow."}
      </Dialog.Description>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2" disabled={isSubmitting}>
          <div className="sm:col-span-2">
            <label htmlFor="state-name" className="mb-1.5 block text-sm font-medium">Name</label>
            <input id="state-name" className={field} maxLength={50} placeholder="e.g. In review" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "state-name-error" : undefined} {...register("name")} />
            {errors.name && <p id="state-name-error" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="state-group" className="mb-1.5 block text-sm font-medium">Group</label>
            <select id="state-group" className={field} aria-invalid={Boolean(errors.group)} {...register("group")}>
              {stateGroups.map((group) => <option key={group} value={group}>{groupLabels[group]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="state-order" className="mb-1.5 block text-sm font-medium">Order</label>
            <input id="state-order" type="number" min={0} max={maxStateOrder} step={1} className={field} aria-invalid={Boolean(errors.order)} aria-describedby={errors.order ? "state-order-error" : undefined} {...register("order", { valueAsNumber: true })} />
            {errors.order && <p id="state-order-error" className="mt-1 text-sm text-red-700">{errors.order.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="state-color" className="mb-1.5 block text-sm font-medium">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick state color"
                value={stateColorPattern.test(color) ? color : defaultColor}
                onChange={(event) => setValue("color", event.target.value, { shouldDirty: true, shouldValidate: true })}
                className="h-10 w-11 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 focus-visible:outline-2 focus-visible:outline-indigo-500"
              />
              <input id="state-color" className={`${field} font-mono`} placeholder={defaultColor} autoComplete="off" aria-invalid={Boolean(errors.color)} aria-describedby={errors.color ? "state-color-error" : undefined} {...register("color")} />
            </div>
            {errors.color && <p id="state-color-error" className="mt-1 text-sm text-red-700">{errors.color.message}</p>}
          </div>
          <label htmlFor="state-default" className="flex items-start gap-2.5 rounded-lg bg-slate-50 px-3.5 py-3 text-sm sm:col-span-2">
            <input id="state-default" type="checkbox" className="mt-0.5 size-4 shrink-0 accent-indigo-600" {...register("is_default")} />
            <span>
              <span className="block font-medium">Default for this group</span>
              <span className="mt-0.5 block text-xs text-slate-600">Replaces the current default in the selected group.</span>
            </span>
          </label>
        </fieldset>
        {errors.root?.server?.message && <p role="alert" className="text-sm text-red-700">{errors.root.server.message}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Dialog.Close asChild>
            <button type="button" className={button} disabled={isSubmitting}>Cancel</button>
          </Dialog.Close>
          <button type="submit" className={primary} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : original ? "Save changes" : "Create state"}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ProjectStates({
  slug,
  projectId,
  canManage,
}: {
  slug: string;
  projectId: string;
  canManage: boolean;
}) {
  const query = useProjectStates(slug, projectId);
  const create = useCreateProjectState(slug, projectId);
  const update = useUpdateProjectState(slug, projectId);
  const remove = useDeleteProjectState(slug, projectId);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [stateToDelete, setStateToDelete] = useState<ProjectState | null>(null);
  const [reassignment, setReassignment] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");
  const activeButton = useRef<HTMLButtonElement>(null);
  const sectionTitle = useRef<HTMLHeadingElement>(null);

  const states = query.data ?? [];
  const nextOrder = Math.min(maxStateOrder, states.reduce((highest, state) => Math.max(highest, state.order), -1) + 1);
  const otherStates = states.filter((state) => state.id !== stateToDelete?.id);
  const canReassign = otherStates.some((state) => state.id === reassignment);
  const saving = create.isPending || update.isPending;

  function returnFocus(event: Event) {
    event.preventDefault();
    if (activeButton.current?.isConnected) activeButton.current.focus();
    else sectionTitle.current?.focus();
  }

  async function save(data: ProjectStateFormData) {
    if (!editor || !canManage) return;
    setNotice("");
    const saved = editor.kind === "create"
      ? await create.mutateAsync(data)
      : await update.mutateAsync({ stateId: editor.state.id, state: data });
    setNotice(`${saved.name} was ${editor.kind === "create" ? "created" : "updated"}.`);
    setEditor(null);
  }

  async function deleteState() {
    if (!stateToDelete || !canManage || !canReassign || remove.isPending) return;
    setDeleteError("");
    setNotice("");
    try {
      await remove.mutateAsync({ stateId: stateToDelete.id, transferToStateId: reassignment });
      setNotice(`${stateToDelete.name} was deleted.`);
      setStateToDelete(null);
    } catch (error) {
      setDeleteError(getProjectError(error, "Could not delete this state. Please try again."));
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white" aria-labelledby="project-states-heading">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <CircleDot size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 ref={sectionTitle} id="project-states-heading" tabIndex={-1} className="text-sm font-semibold outline-none">States</h2>
            <p className="mt-0.5 text-xs text-slate-600">Statuses available to issues in this project.</p>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            className={primary}
            disabled={!query.data}
            onClick={(event) => {
              activeButton.current = event.currentTarget;
              setEditor({ kind: "create", order: nextOrder });
            }}
          >
            <Plus size={16} aria-hidden="true" /> New state
          </button>
        )}
      </header>

      {notice && <p role="status" className="border-b border-slate-100 px-5 py-3 text-sm text-emerald-800">{notice}</p>}
      {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading states…</p>}
      {query.isError && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
          <p role="alert" className="text-sm text-red-700">{getProjectError(query.error, "Could not load states.")}</p>
          <button type="button" className={button} disabled={query.isFetching} onClick={() => void query.refetch()}>
            <RotateCw size={15} aria-hidden="true" className={query.isFetching ? "motion-safe:animate-spin" : undefined} />
            {query.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {query.data && (states.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium">No states yet</p>
          {canManage && <p className="mt-1 text-sm text-slate-600">Add a state to start building this workflow.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-100 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-5 py-3 font-medium">Group</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Order</th>
                {canManage && <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {states.map((state) => (
                <tr key={state.id}>
                  <th scope="row" className="px-5 py-3 font-medium">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="size-3 shrink-0 rounded-full border border-slate-900/15" style={{ backgroundColor: state.color }} aria-hidden="true" />
                      <span className="wrap-break-word">{state.name}</span>
                      {state.is_default && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">Default</span>}
                    </div>
                  </th>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${groupStyles[state.group]}`}>{groupLabels[state.group]}</span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-600">{state.order}</td>
                  {canManage && (
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${state.name}`}
                          title={`Edit ${state.name}`}
                          className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500"
                          onClick={(event) => {
                            activeButton.current = event.currentTarget;
                            setEditor({ kind: "edit", state });
                          }}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${state.name}`}
                          title={`Delete ${state.name}`}
                          className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600"
                          onClick={(event) => {
                            activeButton.current = event.currentTarget;
                            setDeleteError("");
                            setReassignment("");
                            setStateToDelete(state);
                          }}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <Dialog.Root open={canManage && editor !== null} onOpenChange={(open) => { if (!open && !saving) setEditor(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className={overlay} />
          <Dialog.Content className={dialog} onCloseAutoFocus={returnFocus}>
            {editor && <StateEditor key={editor.kind === "edit" ? editor.state.id : "new"} editor={editor} onSave={save} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={canManage && stateToDelete !== null} onOpenChange={(open) => { if (!open && !remove.isPending) setStateToDelete(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={overlay} />
          <AlertDialog.Content className={dialog} onCloseAutoFocus={returnFocus}>
            <AlertDialog.Title className="text-base font-semibold">Delete {stateToDelete?.name}?</AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-slate-600">
              {otherStates.length > 0
                ? "Choose another state for any issues that currently use this one."
                : "Create another state before deleting this one so there is a state to move issues to."}
            </AlertDialog.Description>
            {otherStates.length > 0 && (
              <div className="mt-4">
                <label htmlFor="state-reassignment" className="mb-1.5 block text-sm font-medium">Move issues to</label>
                <select id="state-reassignment" className={field} value={reassignment} disabled={remove.isPending} onChange={(event) => {
                  setDeleteError("");
                  setReassignment(event.target.value);
                }}>
                  <option value="">Select a state</option>
                  {otherStates.map((state) => <option key={state.id} value={state.id}>{state.name} ({groupLabels[state.group]})</option>)}
                </select>
              </div>
            )}
            {deleteError && <p role="alert" className="mt-3 text-sm text-red-700">{deleteError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild><button type="button" className={button} disabled={remove.isPending}>Cancel</button></AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button type="button" className={danger} disabled={!canReassign || remove.isPending} onClick={(event) => {
                  event.preventDefault();
                  void deleteState();
                }}>
                  {remove.isPending ? "Deleting…" : "Delete state"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
