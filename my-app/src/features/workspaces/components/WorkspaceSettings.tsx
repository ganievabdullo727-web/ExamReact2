"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import {
  getWorkspaceError,
  type Workspace,
  type WorkspaceMember,
  type WorkspaceRole,
} from "../api/workspace.api";
import { useDeleteWorkspace } from "../hooks/useDeleteWorkspace";
import { useLeaveWorkspace } from "../hooks/useLeaveWorkspace";
import { useTransferOwnership } from "../hooks/useTransferOwnership";
import { useUpdateWorkspace } from "../hooks/useUpdateWorkspace";
import { workspaceSchema, type WorkspaceFormData } from "../schemas/workspace.schema";

type WorkspaceAction = "transfer" | "delete" | "leave";

const inputClass = "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 aria-invalid:border-red-400 disabled:bg-slate-50 disabled:text-slate-600";
const primaryButton = "inline-flex min-h-10 items-center justify-center rounded-lg bg-[#594BDB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#483BC3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600";
const secondaryButton = "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50";
const dangerButton = "inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50";

export default function WorkspaceSettings({
  workspace,
  members,
  currentRole,
}: {
  workspace: Workspace;
  members: WorkspaceMember[];
  currentRole: WorkspaceRole;
}) {
  const router = useRouter();
  const { slug, name } = workspace;
  const update = useUpdateWorkspace(slug);
  const leave = useLeaveWorkspace(slug);
  const remove = useDeleteWorkspace(slug);
  const transfer = useTransferOwnership(slug);

  const [notice, setNotice] = useState("");
  const [action, setAction] = useState<WorkspaceAction | null>(null);
  const [actionError, setActionError] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [confirmedSlug, setConfirmedSlug] = useState("");
  const actionTrigger = useRef<HTMLButtonElement | null>(null);
  const owner = currentRole === "owner";
  const canEdit = owner || currentRole === "admin";
  const possibleOwners = members.filter((member) => member.user_id !== workspace.owner_id);
  const selectedOwner = possibleOwners.find((member) => member.user_id === newOwnerId);
  const confirming = leave.isPending || remove.isPending || transfer.isPending;
  const busy = update.isPending || confirming;
  const {
    register,
    handleSubmit,
    reset,
    formState: { dirtyFields, errors, isDirty },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name, slug },
  });

  const save = handleSubmit(async (values) => {
    if (!canEdit || busy) return;
    setNotice("");
    try {
      const updated = await update.mutateAsync({
        ...(dirtyFields.name ? { name: values.name } : {}),
        ...(dirtyFields.slug ? { slug: values.slug } : {}),
      });
      reset({ name: updated.name, slug: updated.slug });
      if (updated.slug !== slug) {
        router.replace(`/workspaces/${encodeURIComponent(updated.slug)}/settings`);
      } else {
        setNotice("Workspace settings saved.");
      }
    } catch {
      // React Query exposes the server error below the form.
    }
  });

  function openAction(next: WorkspaceAction, trigger: HTMLButtonElement) {
    actionTrigger.current = trigger;
    setActionError("");
    setConfirmedSlug("");
    setAction(next);
  }

  async function confirmAction() {
    try {
      if (action === "transfer" && owner && selectedOwner) {
        await transfer.mutateAsync({ user_id: selectedOwner.user_id });
        setNewOwnerId("");
        setNotice("Ownership transferred. Your role is now admin.");
      } else if (action === "delete" && owner && confirmedSlug === slug) {
        await remove.mutateAsync();
        router.replace("/workspaces");
      } else if (action === "leave" && !owner) {
        await leave.mutateAsync();
        router.replace("/workspaces");
      } else {
        return;
      }
      setAction(null);
    } catch (error) {
      setActionError(getWorkspaceError(error, "Could not complete this action. Try again."));
    }
  }

  const actionTitle = action === "delete" ? "Delete workspace" : action === "leave" ? "Leave workspace" : "Transfer ownership";
  const actionDescription = action === "delete"
    ? `Deleting ${name} permanently removes the workspace and its projects.`
    : action === "leave"
      ? `You will lose access to ${name} and its projects.`
      : `${selectedOwner?.user.display_name ?? "The selected member"} will become the owner. You will become an admin.`;
  const actionAllowed = action === "delete"
    ? owner && confirmedSlug === slug
    : action === "transfer" ? owner && Boolean(selectedOwner) : !owner;

  return (
    <div className="w-full max-w-3xl space-y-5">
      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      <section aria-labelledby="general-settings" className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 id="general-settings" className="font-semibold text-slate-900">General settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            {canEdit ? "Change the workspace name and its address." : "Only owners and admins can edit these settings."}
          </p>
        </div>
        {canEdit ? (
          <form onSubmit={save}>
            <div className="grid gap-5 px-5 py-5 sm:px-6 md:grid-cols-2">
              <div>
                <label htmlFor="workspace-name" className="mb-2 block text-sm font-medium text-slate-800">Workspace name</label>
                <input
                  id="workspace-name"
                  className={inputClass}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "workspace-name-error" : undefined}
                  disabled={busy}
                  {...register("name")}
                />
                {errors.name && <p id="workspace-name-error" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="workspace-slug" className="mb-2 block text-sm font-medium text-slate-800">Workspace URL slug</label>
                <div className="flex">
                  <span aria-hidden="true" className="flex shrink-0 items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-2.5 font-mono text-xs text-slate-600">/workspaces/</span>
                  <input
                    id="workspace-slug"
                    className={`${inputClass} rounded-l-none`}
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={Boolean(errors.slug)}
                    aria-describedby={errors.slug ? "workspace-slug-error" : "workspace-slug-help"}
                    disabled={busy}
                    {...register("slug")}
                  />
                </div>
                {errors.slug ? <p id="workspace-slug-error" className="mt-1 text-sm text-red-700">{errors.slug.message}</p> : (
                  <p id="workspace-slug-help" className="mt-2 text-xs text-slate-600">Use lowercase letters, numbers, and hyphens.</p>
                )}
              </div>
              {update.error && (
                <p role="alert" className="text-sm text-red-700 md:col-span-2">
                  {getWorkspaceError(update.error, "Could not save workspace settings.")}
                </p>
              )}
            </div>
            <div className="flex justify-end rounded-b-xl border-t border-slate-100 bg-slate-50/75 px-5 py-3 sm:px-6">
              <button type="submit" disabled={!isDirty || busy} className={primaryButton}>
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
            <div><dt className="text-sm text-slate-600">Workspace name</dt><dd className="mt-1 break-words text-sm font-medium text-slate-900">{name}</dd></div>
            <div><dt className="text-sm text-slate-600">Workspace URL slug</dt><dd className="mt-1 break-all font-mono text-sm font-medium text-slate-900">{slug}</dd></div>
          </dl>
        )}
      </section>

      {owner && (
        <section aria-labelledby="ownership-settings" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
              <ShieldCheck size={17} aria-hidden="true" />
            </span>
            <div>
              <h2 id="ownership-settings" className="font-semibold text-slate-900">Ownership</h2>
              <p className="mt-0.5 text-sm text-slate-600">Transfer ownership to another workspace member.</p>
            </div>
          </div>
          {possibleOwners.length === 0 ? (
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">Add another member before transferring ownership.</p>
          ) : (
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="w-full sm:max-w-sm">
                <label htmlFor="new-owner" className="mb-2 block text-sm font-medium text-slate-800">New owner</label>
                <select id="new-owner" value={newOwnerId} onChange={(event) => setNewOwnerId(event.target.value)} className={inputClass} disabled={busy}>
                  <option value="">Select a member</option>
                  {possibleOwners.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.user.display_name} ({member.user.email})
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className={secondaryButton} disabled={!selectedOwner || busy} onClick={(event) => openAction("transfer", event.currentTarget)}>
                Transfer ownership
              </button>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="workspace-access" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-5 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-700">
            {owner ? <Trash2 size={17} aria-hidden="true" /> : <LogOut size={17} aria-hidden="true" />}
          </span>
          <div>
            <h2 id="workspace-access" className="font-semibold text-slate-900">
              {owner ? "Delete workspace" : "Leave workspace"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              {owner ? "Permanently remove this workspace and its projects." : "Remove your access to this workspace and its projects."}
            </p>
          </div>
        </div>
        <button type="button" onClick={(event) => openAction(owner ? "delete" : "leave", event.currentTarget)} disabled={busy} className={dangerButton}>
          {owner ? "Delete workspace" : "Leave workspace"}
        </button>
      </section>

      <AlertDialog.Root open={action !== null} onOpenChange={(open) => { if (!open && !confirming) setAction(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/50" />
          <AlertDialog.Content
            className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl"
            onCloseAutoFocus={(event) => {
              if (actionTrigger.current?.isConnected) {
                event.preventDefault();
                actionTrigger.current.focus();
              }
            }}
          >
            <AlertDialog.Title className="text-lg font-semibold">{actionTitle}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-slate-700">{actionDescription}</AlertDialog.Description>
            {action === "delete" && (
              <div className="mt-4">
                <label htmlFor="confirmed-workspace-slug" className="mb-2 block break-words text-sm font-medium">
                  Type <span className="font-semibold">{slug}</span> to confirm
                </label>
                <input id="confirmed-workspace-slug" className={inputClass} value={confirmedSlug} onChange={(event) => setConfirmedSlug(event.target.value)} autoCapitalize="none" spellCheck={false} disabled={confirming} />
              </div>
            )}
            {actionError && <p role="alert" className="mt-4 text-sm text-red-700">{actionError}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" disabled={confirming} className={secondaryButton}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    void confirmAction();
                  }}
                  disabled={!actionAllowed || confirming}
                  className={action === "transfer" ? primaryButton : dangerButton}
                >
                  {confirming ? "Working…" : actionTitle}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
