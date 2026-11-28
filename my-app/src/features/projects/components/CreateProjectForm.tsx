"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { WorkspaceMember } from "@/features/workspaces/api/workspace.api";
import { getProjectError } from "../api/project.api";
import { useCreateProject } from "../hooks/useCreateProject";
import { createProjectSchema, type CreateProjectFormData } from "../schemas/project.schema";

const fieldStyle = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-400 disabled:bg-slate-50";
const primaryButton = "inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#5D4DE0] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F40CC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60";

function identifierFromName(name: string) {
  const words = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toUpperCase().match(/[A-Z0-9]+/g) ?? [];
  if (words.length < 2) return words[0]?.slice(0, 4) ?? "";
  return words.map((word) => word[0]).join("").slice(0, 10);
}

export default function CreateProjectForm({ slug, workspaceMembers }: { slug: string; workspaceMembers: WorkspaceMember[] }) {
  const router = useRouter();
  const createProject = useCreateProject(slug);
  const [open, setOpen] = useState(false);
  const [identifierEdited, setIdentifierEdited] = useState(false);
  const { register, handleSubmit, reset, setValue, setError, clearErrors, formState } =
    useForm<CreateProjectFormData>({
      resolver: zodResolver(createProjectSchema),
      defaultValues: { name: "", identifier: "", description: "", lead_id: "" },
    });
  const { errors, isSubmitting, isSubmitted } = formState;

  const close = () => {
    setOpen(false);
    setIdentifierEdited(false);
    reset();
  };

  const submit = handleSubmit(async (values) => {
    try {
      const project = await createProject.mutateAsync({
        name: values.name,
        identifier: values.identifier,
        description: values.description?.trim() || undefined,
        lead_id: values.lead_id || null,
      });
      close();
      router.push(`/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(project.id)}`);
    } catch (error) {
      setError("root.server", {
        message: getProjectError(error, "Could not create the project. Please try again."),
      });
    }
  });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setOpen(true);
        else if (!isSubmitting) close();
      }}
    >
      <Dialog.Trigger asChild>
        <button type="button" className={primaryButton}>
          <Plus size={17} aria-hidden="true" />
          New project
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="relative border-b border-slate-100 px-5 py-5 sm:px-6">
            <Dialog.Title className="pr-10 text-lg font-semibold text-slate-900">Create project</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-600">
              Choose a name and a unique identifier for this workspace.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                disabled={isSubmitting}
                className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <form noValidate onSubmit={submit}>
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <div>
                  <label htmlFor="project-create-name" className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
                  <input
                    id="project-create-name"
                    maxLength={100}
                    placeholder="e.g. Product launch"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "project-create-name-error" : undefined}
                    className={fieldStyle}
                    {...register("name", {
                      onChange: (event) => {
                        clearErrors("root.server");
                        if (!identifierEdited) {
                          setValue("identifier", identifierFromName(event.target.value), { shouldValidate: isSubmitted });
                        }
                      },
                    })}
                  />
                  {errors.name && <p id="project-create-name-error" className="mt-1.5 text-xs text-red-700">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="project-create-identifier" className="mb-1.5 block text-sm font-medium text-slate-700">Identifier</label>
                  <input
                    id="project-create-identifier"
                    maxLength={10}
                    placeholder="e.g. PL"
                    autoCapitalize="characters"
                    spellCheck={false}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.identifier)}
                    aria-describedby={errors.identifier ? "project-create-identifier-error" : "project-create-identifier-hint"}
                    className={`${fieldStyle} font-mono uppercase`}
                    {...register("identifier", {
                      onChange: () => {
                        setIdentifierEdited(true);
                        clearErrors("root.server");
                      },
                    })}
                  />
                  {errors.identifier ? (
                    <p id="project-create-identifier-error" className="mt-1.5 text-xs text-red-700">{errors.identifier.message}</p>
                  ) : (
                    <p id="project-create-identifier-hint" className="mt-1.5 text-xs text-slate-500">Letters and digits.</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="project-create-description" className="mb-1.5 block text-sm font-medium text-slate-700">Description <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea
                  id="project-create-description"
                  maxLength={500}
                  rows={3}
                  placeholder="What is this project about?"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={errors.description ? "project-create-description-error" : undefined}
                  className={`${fieldStyle} resize-y`}
                  {...register("description")}
                />
                {errors.description && <p id="project-create-description-error" className="mt-1.5 text-xs text-red-700">{errors.description.message}</p>}
              </div>
              <div>
                <label htmlFor="project-create-lead" className="mb-1.5 block text-sm font-medium text-slate-700">Project lead <span className="font-normal text-slate-500">(optional)</span></label>
                <select
                  id="project-create-lead"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.lead_id)}
                  aria-describedby={errors.lead_id ? "project-create-lead-error" : undefined}
                  className={fieldStyle}
                  {...register("lead_id")}
                >
                  <option value="">No lead</option>
                  {workspaceMembers.map(({ user_id, user }) => (
                    <option key={user_id} value={user_id}>{user.display_name || user.email}</option>
                  ))}
                </select>
                {errors.lead_id && <p id="project-create-lead-error" className="mt-1.5 text-xs text-red-700">{errors.lead_id.message}</p>}
              </div>
              {errors.root?.server?.message && (
                <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errors.root.server.message}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="min-h-10 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" disabled={isSubmitting} className={primaryButton}>
                {isSubmitting && <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
                {isSubmitting ? "Creating…" : "Create project"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
