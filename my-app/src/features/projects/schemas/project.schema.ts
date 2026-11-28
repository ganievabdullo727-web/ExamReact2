import { z } from "zod";
import type { ProjectMemberRole } from "../api/project.api";

const projectName = z.string().trim().min(1, "Enter a project name").max(100);
const projectDescription = z.string().trim().max(500, "Use 500 characters or fewer");
const projectLead = z.union([z.literal(""), z.uuid("Select a valid workspace member")]).nullish();
const roles = ["admin", "member", "viewer"] as const satisfies readonly ProjectMemberRole[];

export const createProjectSchema = z.object({
  name: projectName,
  identifier: z.string().trim().toUpperCase().min(1, "Enter a project identifier").max(10)
    .regex(/^[A-Z0-9]+$/, "Use letters and digits only"),
  description: projectDescription.optional(),
  lead_id: projectLead,
});

export const updateProjectSchema = z.object({
  name: projectName,
  description: projectDescription.nullish(),
  lead_id: projectLead,
});

export const projectMemberSchema = z.object({
  user_id: z.uuid("Select a workspace member"),
  role: z.enum(roles),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
export type ProjectMemberFormData = z.infer<typeof projectMemberSchema>;
