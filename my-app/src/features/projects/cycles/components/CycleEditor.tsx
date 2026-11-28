"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { getProjectError } from "../../api/project.api";
import type { ProjectCycle } from "../api/cycle.api";
import { cycleSchema, type CycleFormData } from "../schemas/cycle.schema";
import { toDateField } from "./cycle-dates";

const field = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50";
const primary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60";
const secondary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";

export function cycleFormValues(cycle?: ProjectCycle): CycleFormData {
  return {
    name: cycle?.name ?? "",
    description: cycle?.description ?? "",
    start_date: toDateField(cycle?.start_date ?? null),
    end_date: toDateField(cycle?.end_date ?? null),
  };
}

export default function CycleEditor({ cycle, onSave, busy = false }: {
  cycle?: ProjectCycle;
  onSave: (values: CycleFormData) => Promise<void>;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { register, reset, handleSubmit, setError, formState: { errors, isSubmitting, isDirty } } = useForm<CycleFormData>({
    resolver: zodResolver(cycleSchema),
    defaultValues: cycleFormValues(cycle),
  });
  const working = busy || isSubmitting;

  const submit = handleSubmit(async (values) => {
    try {
      await onSave(values);
      setOpen(false);
    } catch (error) {
      setError("root.server", { message: getProjectError(error, "Could not save this cycle. Please try again.") });
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={(next) => {
      if (working) return;
      if (next) reset(cycleFormValues(cycle));
      setOpen(next);
    }}>
      <Dialog.Trigger asChild>
        <button type="button" className={cycle ? secondary : primary} disabled={busy}>
          {cycle ? <Pencil size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {cycle ? "Edit cycle" : "New cycle"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-base font-semibold">{cycle ? "Edit cycle" : "Create cycle"}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600">Set the name, description, and optional schedule.</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" aria-label="Close" disabled={working} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-indigo-500 disabled:opacity-50">
                <X size={17} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <fieldset disabled={working} className="grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="cycle-name" className="mb-1.5 block text-sm font-medium">Name</label>
                <input id="cycle-name" className={field} maxLength={255} placeholder="e.g. November cycle" autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "cycle-name-error" : undefined} {...register("name")} />
                {errors.name && <p id="cycle-name-error" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cycle-description" className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea id="cycle-description" className={field} rows={3} maxLength={10000} placeholder="What should this cycle accomplish?" aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "cycle-description-error" : undefined} {...register("description")} />
                {errors.description && <p id="cycle-description-error" className="mt-1 text-sm text-red-700">{errors.description.message}</p>}
              </div>
              <div>
                <label htmlFor="cycle-start-date" className="mb-1.5 block text-sm font-medium">Start date</label>
                <input id="cycle-start-date" type="date" className={field} max="9999-12-31" aria-invalid={Boolean(errors.start_date)} aria-describedby={errors.start_date ? "cycle-start-error" : undefined} {...register("start_date")} />
                {errors.start_date && <p id="cycle-start-error" className="mt-1 text-sm text-red-700">{errors.start_date.message}</p>}
              </div>
              <div>
                <label htmlFor="cycle-end-date" className="mb-1.5 block text-sm font-medium">End date</label>
                <input id="cycle-end-date" type="date" className={field} max="9999-12-31" aria-invalid={Boolean(errors.end_date)} aria-describedby={errors.end_date ? "cycle-end-error" : undefined} {...register("end_date")} />
                {errors.end_date && <p id="cycle-end-error" className="mt-1 text-sm text-red-700">{errors.end_date.message}</p>}
              </div>
            </fieldset>
            {errors.root?.server?.message && <p role="alert" className="text-sm text-red-700">{errors.root.server.message}</p>}
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <Dialog.Close asChild>
                <button type="button" className={secondary} disabled={working}>Cancel</button>
              </Dialog.Close>
              <button type="submit" disabled={working || (Boolean(cycle) && !isDirty)} className={primary}>
                {working && <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
                {working ? "Saving…" : cycle ? "Save changes" : "Create cycle"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

