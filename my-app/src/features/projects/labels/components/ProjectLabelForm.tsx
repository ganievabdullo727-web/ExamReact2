"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, LoaderCircle } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { getProjectError } from "../../api/project.api";
import type { ProjectLabel } from "../api/label.api";
import { labelColorPattern, projectLabelSchema, type ProjectLabelFormData } from "../schemas/label.schema";

const palette = [
  { name: "Indigo", hex: "#594BDB" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Teal", hex: "#0F766E" },
  { name: "Green", hex: "#15803D" },
  { name: "Amber", hex: "#B45309" },
  { name: "Orange", hex: "#C2410C" },
  { name: "Rose", hex: "#BE185D" },
  { name: "Slate", hex: "#475569" },
];
const defaultColor = palette[0].hex;
const fieldStyle = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50";

export default function ProjectLabelForm({ label, onSave }: {
  label?: ProjectLabel;
  onSave: (values: ProjectLabelFormData) => Promise<void>;
}) {
  const {
    register,
    control,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProjectLabelFormData>({
    resolver: zodResolver(projectLabelSchema),
    defaultValues: { name: label?.name ?? "", color: label?.color ?? defaultColor },
  });
  const name = useWatch({ control, name: "name" });
  const color = useWatch({ control, name: "color" }).trim().toUpperCase();
  const previewColor = labelColorPattern.test(color) ? color : defaultColor;

  const save = handleSubmit(async (values) => {
    try {
      await onSave(values);
    } catch (error) {
      setError("root.server", { message: getProjectError(error, "Could not save the label. Please try again.") });
    }
  });

  function pickColor(value: string) {
    setValue("color", value.toUpperCase(), { shouldDirty: true, shouldValidate: true });
    clearErrors("root.server");
  }

  return (
    <form onSubmit={save} noValidate className="mt-5 space-y-4">
      <div>
        <label htmlFor="project-label-name" className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
        <input
          id="project-label-name"
          type="text"
          autoComplete="off"
          placeholder="e.g. Bug"
          maxLength={50}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "project-label-name-error" : undefined}
          className={fieldStyle}
          {...register("name", { onChange: () => clearErrors("root.server") })}
        />
        {errors.name && <p id="project-label-name-error" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="project-label-color" className="mb-1.5 block text-sm font-medium text-slate-700">Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            aria-label="Pick a custom label color"
            value={previewColor.toLowerCase()}
            onChange={(event) => pickColor(event.target.value)}
            disabled={isSubmitting}
            className="size-10 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1.5 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-default"
          />
          <input
            id="project-label-color"
            type="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={7}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.color)}
            aria-describedby={errors.color ? "project-label-color-error" : "project-label-color-hint"}
            className={`${fieldStyle} font-mono`}
            {...register("color", { onChange: () => clearErrors("root.server") })}
          />
        </div>
        {errors.color ? (
          <p id="project-label-color-error" className="mt-1 text-sm text-red-700">{errors.color.message}</p>
        ) : (
          <p id="project-label-color-hint" className="mt-1 text-xs text-slate-600">Use a six-digit hex value or select a color below.</p>
        )}
        <div role="group" aria-label="Preset label colors" className="mt-3 flex flex-wrap gap-2">
          {palette.map(({ name, hex }) => {
            const selected = color === hex;
            return (
              <button
                key={hex}
                type="button"
                title={`${name} (${hex})`}
                aria-label={name}
                aria-pressed={selected}
                className={`grid size-7 place-items-center rounded-full text-white outline-offset-2 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50 ${selected ? "ring-2 ring-indigo-600 ring-offset-2" : ""}`}
                style={{ backgroundColor: hex }}
                disabled={isSubmitting}
                onClick={() => pickColor(hex)}
              >
                {selected && <Check size={15} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="text-xs font-medium text-slate-600">Preview</span>
        <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-slate-800" style={{ backgroundColor: `${previewColor}1A` }}>
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full border border-slate-900/10" style={{ backgroundColor: previewColor }} />
          <span className="truncate">{name.trim() || "Label"}</span>
        </span>
      </div>
      {errors.root?.server?.message && <p role="alert" className="text-sm text-red-700">{errors.root.server.message}</p>}

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <Dialog.Close asChild>
          <button type="button" disabled={isSubmitting} className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50">
            Cancel
          </button>
        </Dialog.Close>
        <button type="submit" disabled={isSubmitting || (Boolean(label) && !isDirty)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#594BDB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60">
          {isSubmitting && <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Saving…" : label ? "Save changes" : "Create label"}
        </button>
      </div>
    </form>
  );
}
