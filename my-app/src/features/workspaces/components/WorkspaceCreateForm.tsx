"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getWorkspaceError, type Workspace } from "../api/workspace.api";
import { useCreateWorkspace } from "../hooks/useCreateWorkspace";
import { workspaceSchema, type WorkspaceFormData } from "../schemas/workspace.schema";

function toSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/, "");
}

const fieldClassName =
  "h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] px-4 text-sm text-[#191B35] outline-none transition placeholder:text-[#83869C] focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-[#7059EE]/10 aria-invalid:border-red-400";

const WorkspaceCreateForm = ({ onCreated }: { onCreated: (workspace: Workspace) => void }) => {
  const [open, setOpen] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const createWorkspace = useCreateWorkspace();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "", slug: "" },
  });

  const close = () => {
    setOpen(false);
    setSlugEdited(false);
    reset();
  };

  const onSubmit = handleSubmit(async (values) => {
    let workspace: Workspace;

    try {
      workspace = await createWorkspace.mutateAsync(values);
    } catch (error) {
      setError("root.server", {
        message: getWorkspaceError(error, "Could not create the workspace. Please try again."),
      });
      return;
    }

    close();
    onCreated(workspace);
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
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7059EE] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(112,89,238,0.22)] transition hover:bg-[#614ADB] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7059EE]"
        >
          <Plus size={18} aria-hidden="true" />
          Create workspace
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[#191B35]/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl border border-[#E4E6F0] bg-white p-6 shadow-2xl sm:p-7">
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              disabled={isSubmitting}
              className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-[#686C85] hover:bg-[#F4F1FF] focus-visible:outline-2 focus-visible:outline-[#7059EE] disabled:opacity-50"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </Dialog.Close>

          <Dialog.Title className="pr-10 text-xl font-semibold text-[#191B35]">
            Create workspace
          </Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm leading-6 text-[#686C85]">
            Choose a name and a URL slug for your team.
          </Dialog.Description>

          <form noValidate onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="create-workspace-name" className="mb-1.5 block text-sm font-medium text-[#191B35]">
                Workspace name
              </label>
              <input
                id="create-workspace-name"
                placeholder="e.g. Product team"
                maxLength={100}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "create-workspace-name-error" : undefined}
                className={fieldClassName}
                {...register("name", {
                  onChange: (event) => {
                    clearErrors("root.server");
                    if (!slugEdited) {
                      setValue("slug", toSlug(event.target.value), { shouldValidate: isSubmitted });
                    }
                  },
                })}
              />
              {errors.name && (
                <p id="create-workspace-name-error" className="mt-1.5 text-sm text-red-700">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="create-workspace-slug" className="mb-1.5 block text-sm font-medium text-[#191B35]">
                URL slug
              </label>
              <input
                id="create-workspace-slug"
                placeholder="e.g. product-team"
                maxLength={50}
                spellCheck={false}
                autoCapitalize="none"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={errors.slug ? "create-workspace-slug-error" : "create-workspace-slug-hint"}
                className={fieldClassName}
                {...register("slug", {
                  onChange: () => {
                    setSlugEdited(true);
                    clearErrors("root.server");
                  },
                })}
              />
              {errors.slug ? (
                <p id="create-workspace-slug-error" className="mt-1.5 text-sm text-red-700">
                  {errors.slug.message}
                </p>
              ) : (
                <p id="create-workspace-slug-hint" className="mt-1.5 text-sm text-[#686C85]">
                  Use lowercase letters, numbers, or hyphens.
                </p>
              )}
            </div>

            {errors.root?.server?.message && (
              <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {errors.root.server.message}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="min-h-11 rounded-xl border border-[#E4E6F0] px-4 py-2.5 text-sm font-semibold text-[#191B35] hover:bg-[#F7F8FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7059EE] disabled:opacity-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7059EE] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#614ADB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7059EE] disabled:opacity-65"
              >
                {isSubmitting && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
                {isSubmitting ? "Creating…" : "Create workspace"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WorkspaceCreateForm;
