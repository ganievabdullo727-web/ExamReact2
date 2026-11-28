import { z } from "zod";

import {
  moduleStatuses,
  type CreateModuleData,
  type ProjectModule,
  type UpdateModuleData,
} from "../api/module.api";

const optionalDate = z.union([z.literal(""), z.iso.date()], {
  error: "Enter a valid date.",
});

export const moduleFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a module name.").max(255, "Use 255 characters or fewer."),
  description: z.string().trim().max(10000, "Use 10,000 characters or fewer."),
  status: z.enum(moduleStatuses),
  leadId: z.union([z.literal(""), z.uuid()], { error: "Choose a project member." }),
  startDate: optionalDate,
  targetDate: optionalDate,
}).refine(({ startDate, targetDate }) => !startDate || !targetDate || targetDate >= startDate, {
  path: ["targetDate"],
  error: "The target date must be on or after the start date.",
});

export type ModuleFormData = z.infer<typeof moduleFormSchema>;

const asIsoDateTime = (value: string) => value ? value + "T00:00:00.000Z" : null;

export function getModuleFormValues(module?: ProjectModule): ModuleFormData {
  return {
    name: module?.name ?? "",
    description: module?.description ?? "",
    status: module?.status ?? "backlog",
    leadId: module?.lead_id ?? "",
    startDate: module?.start_date?.slice(0, 10) ?? "",
    targetDate: module?.target_date?.slice(0, 10) ?? "",
  };
}

export function toCreateModuleData(values: ModuleFormData): CreateModuleData {
  return {
    name: values.name,
    ...(values.description && { description: values.description }),
    status: values.status,
    lead_id: values.leadId || null,
    start_date: asIsoDateTime(values.startDate),
    target_date: asIsoDateTime(values.targetDate),
  };
}

export function toUpdateModuleData(values: ModuleFormData, previous: ProjectModule): UpdateModuleData {
  const before = getModuleFormValues(previous);
  return {
    ...(before.name !== values.name && { name: values.name }),
    ...(before.description !== values.description && { description: values.description || null }),
    ...(before.status !== values.status && { status: values.status }),
    ...(before.leadId !== values.leadId && { lead_id: values.leadId || null }),
    ...(before.startDate !== values.startDate && { start_date: asIsoDateTime(values.startDate) }),
    ...(before.targetDate !== values.targetDate && { target_date: asIsoDateTime(values.targetDate) }),
  };
}
