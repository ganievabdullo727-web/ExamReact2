"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { WorkspaceMember } from "@/features/workspaces/api/workspace.api";
import { getProjectError, type Project } from "../api/project.api";
import { useDeleteProject } from "../hooks/useDeleteProject";
import { useUpdateProject } from "../hooks/useUpdateProject";
import { updateProjectSchema, type UpdateProjectFormData } from "../schemas/project.schema";

const panel = "overflow-hidden rounded-xl border border-slate-200 bg-white";
const field = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50 disabled:text-slate-600";
const primaryButton = "min-h-10 rounded-lg bg-[#594BDB] px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-[#473BC5] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-600";
const secondaryButton = "min-h-10 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50";
const dangerButton = "min-h-10 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 outline-none hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50";

function formValues(project: Project): UpdateProjectFormData {
  return { name: project.name, description: project.description ?? "", lead_id: project.lead_id ?? "" };
}

export default function ProjectSettings({ slug, project, workspaceMembers, canManage, projectsHref }: {
  slug: string;
  project: Project;
  workspaceMembers: WorkspaceMember[];
  canManage: boolean;
  projectsHref: string;
}) {
  const router = useRouter();
  const update = useUpdateProject(slug, project.id);
  const archive = useUpdateProject(slug, project.id);
  const remove = useDeleteProject(slug, project.id);
  const [notice, setNotice] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const busy = update.isPending || archive.isPending || remove.isPending;
  const hasMissingLead = project.lead_id && !workspaceMembers.some((member) => member.user_id === project.lead_id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { dirtyFields, errors, isDirty },
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: formValues(project),
  });

  const save = handleSubmit(async (values) => {
    if (!canManage || busy || !isDirty) return;
    setNotice("");
    try {
      const saved = await update.mutateAsync({
        ...(dirtyFields.name ? { name: values.name } : {}),
        ...(dirtyFields.description ? { description: values.description || null } : {}),
        ...(dirtyFields.lead_id ? { lead_id: values.lead_id || null } : {}),
      });
      reset(formValues(saved));
      setNotice("Project settings saved.");
    } catch {
      // The mutation error is rendered alongside the form.
    }
  });

  async function toggleArchive() {
    if (!canManage || busy) return;
    setNotice("");
    try {
      const updated = await archive.mutateAsync({ is_archived: !project.is_archived });
      setNotice(updated.is_archived ? "Project archived." : "Project restored.");
    } catch {
      // The mutation error is rendered in the project status section.
    }
  }

  async function deleteProject() {
    if (!canManage || busy || confirmation !== project.identifier) return;
    try {
      await remove.mutateAsync();
      setDeleteOpen(false);
      router.replace(projectsHref);
    } catch {
      // Keep the dialog open so the user can retry.
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      <section aria-labelledby="project-general-settings" className={panel}>
        <header className="border-b border-slate-200 px-5 py-4">
          <h2 id="project-general-settings" className="text-sm font-semibold">General settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            {canManage ? "Update project information and choose a lead." : "Workspace owners and admins can edit these settings."}
          </p>
        </header>
        <form onSubmit={save} noValidate>
          <fieldset disabled={!canManage || busy} className="grid min-w-0 gap-4 p-5 sm:grid-cols-3">
            <div className="min-w-0 sm:col-span-2">
              <label htmlFor="project-settings-name" className="mb-1.5 block text-sm font-medium">Project name</label>
              <input id="project-settings-name" maxLength={100} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "project-name-error" : undefined} className={field} {...register("name")} />
              {errors.name && <p id="project-name-error" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
            </div>
            <div className="min-w-0">
              <label htmlFor="project-settings-identifier" className="mb-1.5 block text-sm font-medium">Identifier</label>
              <input id="project-settings-identifier" value={project.identifier} readOnly className={`${field} bg-slate-50 font-mono`} />
            </div>
            <div className="min-w-0 sm:col-span-3">
              <label htmlFor="project-settings-description" className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea id="project-settings-description" rows={3} maxLength={500} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "project-description-error" : undefined} className={`${field} resize-y`} {...register("description")} />
              {errors.description && <p id="project-description-error" className="mt-1 text-sm text-red-700">{errors.description.message}</p>}
            </div>
            <div className="min-w-0 sm:col-span-2">
              <label htmlFor="project-settings-lead" className="mb-1.5 block text-sm font-medium">Project lead</label>
              <select id="project-settings-lead" aria-invalid={Boolean(errors.lead_id)} aria-describedby={errors.lead_id ? "project-lead-error" : undefined} className={field} {...register("lead_id")}>
                <option value="">Unassigned</option>
                {hasMissingLead && <option value={project.lead_id}>Unavailable member</option>}
                {workspaceMembers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>{member.user?.display_name || member.user?.email || member.user_id}</option>
                ))}
              </select>
              {errors.lead_id && <p id="project-lead-error" className="mt-1 text-sm text-red-700">{errors.lead_id.message}</p>}
            </div>
          </fieldset>
          {canManage && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
              {update.isError && <p role="alert" className="text-sm text-red-700">{getProjectError(update.error, "Could not save the project.")}</p>}
              <button type="submit" disabled={!isDirty || busy} className={`ml-auto ${primaryButton}`}>
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </form>
      </section>

      {canManage && (
        <>
          <section aria-labelledby="project-status" className={`${panel} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                  {project.is_archived ? <ArchiveRestore size={18} aria-hidden="true" /> : <Archive size={18} aria-hidden="true" />}
                </span>
                <div>
                  <h2 id="project-status" className="text-sm font-semibold">Project status</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {project.is_archived ? "Restore the project to the active list." : "Archive this project when work ends. You can restore it later."}
                  </p>
                </div>
              </div>
              <button type="button" className={secondaryButton} disabled={busy} onClick={() => void toggleArchive()}>
                {archive.isPending ? "Updating…" : project.is_archived ? "Restore project" : "Archive project"}
              </button>
            </div>
            {archive.isError && <p role="alert" className="mt-3 text-sm text-red-700">{getProjectError(archive.error, "Could not change project status.")}</p>}
          </section>

          <AlertDialog.Root
            open={deleteOpen}
            onOpenChange={(open) => {
              if (remove.isPending) return;
              setDeleteOpen(open);
              setConfirmation("");
              remove.reset();
            }}
          >
            <section aria-labelledby="project-delete" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-700"><Trash2 size={18} aria-hidden="true" /></span>
                <div>
                  <h2 id="project-delete" className="text-sm font-semibold">Delete project</h2>
                  <p className="mt-1 text-sm text-slate-600">Permanently remove this project and its data.</p>
                </div>
              </div>
              <AlertDialog.Trigger asChild>
                <button type="button" disabled={busy} className={dangerButton}>Delete project</button>
              </AlertDialog.Trigger>
            </section>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
              <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100%_-_2rem,27rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
                <AlertDialog.Title className="font-semibold">Delete {project.name}?</AlertDialog.Title>
                <AlertDialog.Description className="mt-2 text-sm text-slate-600">This permanently removes the project and its data.</AlertDialog.Description>
                <label htmlFor="confirm-project-identifier" className="mt-4 block text-sm font-medium">Type <strong>{project.identifier}</strong> to confirm</label>
                <input id="confirm-project-identifier" className={`mt-1.5 ${field}`} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={remove.isPending} autoComplete="off" />
                {remove.isError && <p role="alert" className="mt-3 text-sm text-red-700">{getProjectError(remove.error, "Could not delete the project.")}</p>}
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <AlertDialog.Cancel asChild>
                    <button type="button" className={secondaryButton} disabled={remove.isPending}>Cancel</button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button type="button" className={dangerButton} disabled={busy || confirmation !== project.identifier} onClick={(event) => { event.preventDefault(); void deleteProject(); }}>
                      {remove.isPending ? "Deleting…" : "Delete project"}
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </>
      )}
    </div>
  );
}
