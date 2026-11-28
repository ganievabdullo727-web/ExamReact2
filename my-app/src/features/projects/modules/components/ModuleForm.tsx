"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";

import { getProjectError } from "../../api/project.api";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import { moduleStatuses, type ProjectModule } from "../api/module.api";
import { getModuleFormValues, moduleFormSchema, type ModuleFormData } from "../schemas/module.schema";
import { fieldStyle, moduleStatusLabels, primaryButton, secondaryButton } from "./module-styles";

type Props = {
  slug: string;
  projectId: string;
  module?: ProjectModule;
  onSave: (values: ModuleFormData) => Promise<void>;
};

export default function ModuleForm({ slug, projectId, module, onSave }: Props) {
  const membersQuery = useProjectMembers(slug, projectId);
  const members = membersQuery.data ?? [];
  const {
    register, handleSubmit, clearErrors, setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: getModuleFormValues(module),
  });

  const submit = handleSubmit(async (values) => {
    clearErrors("root.server");
    try {
      await onSave(values);
    } catch (error) {
      setError("root.server", { message: getProjectError(error, "Could not save the module. Please try again.") });
    }
  });
  const assignedLeadIsUnavailable = module?.lead_id && !members.some((member) => member.user_id === module.lead_id);

  return (
    <>
      <Dialog.Title className="text-base font-semibold">{module ? "Edit module" : "Create module"}</Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-slate-600">
        Set a module’s status, lead, and schedule.
      </Dialog.Description>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <fieldset disabled={isSubmitting} className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <label htmlFor="project-module-name" className="mb-1.5 block text-sm font-medium">Name</label>
            <input id="project-module-name" autoComplete="off" maxLength={255} placeholder="e.g. Account settings" className={fieldStyle} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "project-module-name-error" : undefined} {...register("name")} />
            {errors.name && <p id="project-module-name-error" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
          </div>
          <div className="min-w-0 sm:col-span-2">
            <label htmlFor="project-module-description" className="mb-1.5 block text-sm font-medium">Description <span className="font-normal text-slate-500">(optional)</span></label>
            <textarea id="project-module-description" rows={3} maxLength={10000} className={fieldStyle + " resize-y"} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "project-module-description-error" : undefined} {...register("description")} />
            {errors.description && <p id="project-module-description-error" className="mt-1 text-sm text-red-700">{errors.description.message}</p>}
          </div>
          <div className="min-w-0">
            <label htmlFor="project-module-status" className="mb-1.5 block text-sm font-medium">Status</label>
            <select id="project-module-status" className={fieldStyle} {...register("status")}>
              {moduleStatuses.map((status) => <option key={status} value={status}>{moduleStatusLabels[status]}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="project-module-lead" className="mb-1.5 block text-sm font-medium">Module lead</label>
            <select id="project-module-lead" className={fieldStyle} aria-invalid={Boolean(errors.leadId)} aria-describedby={errors.leadId ? "project-module-lead-error" : undefined} {...register("leadId")}>
              <option value="">Unassigned</option>
              {assignedLeadIsUnavailable && <option value={module.lead_id ?? ""}>Current lead</option>}
              {members.map((member) => <option key={member.user_id} value={member.user_id}>{member.user?.display_name || member.user?.email || member.user_id}</option>)}
            </select>
            {errors.leadId && <p id="project-module-lead-error" className="mt-1 text-sm text-red-700">{errors.leadId.message}</p>}
            {membersQuery.isPending && <p role="status" className="mt-1 text-xs text-slate-600">Loading project members…</p>}
            {membersQuery.isError && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <p role="alert" className="text-red-700">Could not load project members.</p>
                <button type="button" onClick={() => void membersQuery.refetch()} disabled={membersQuery.isFetching} className="text-indigo-700 underline underline-offset-2">Retry</button>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <label htmlFor="project-module-start-date" className="mb-1.5 block text-sm font-medium">Start date</label>
            <input type="date" id="project-module-start-date" className={fieldStyle} aria-invalid={Boolean(errors.startDate)} aria-describedby={errors.startDate ? "project-module-start-error" : undefined} {...register("startDate")} />
            {errors.startDate && <p id="project-module-start-error" className="mt-1 text-sm text-red-700">{errors.startDate.message}</p>}
          </div>
          <div className="min-w-0">
            <label htmlFor="project-module-target-date" className="mb-1.5 block text-sm font-medium">Target date</label>
            <input type="date" id="project-module-target-date" className={fieldStyle} aria-invalid={Boolean(errors.targetDate)} aria-describedby={errors.targetDate ? "project-module-target-error" : undefined} {...register("targetDate")} />
            {errors.targetDate && <p id="project-module-target-error" className="mt-1 text-sm text-red-700">{errors.targetDate.message}</p>}
          </div>
        </fieldset>
        {errors.root?.server?.message && <p role="alert" className="text-sm text-red-700">{errors.root.server.message}</p>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <Dialog.Close asChild><button type="button" className={secondaryButton} disabled={isSubmitting}>Cancel</button></Dialog.Close>
          <button type="submit" className={primaryButton} disabled={isSubmitting || Boolean(module && !isDirty)}>
            {isSubmitting ? "Saving…" : module ? "Save changes" : "Create module"}
          </button>
        </div>
      </form>
    </>
  );
}
