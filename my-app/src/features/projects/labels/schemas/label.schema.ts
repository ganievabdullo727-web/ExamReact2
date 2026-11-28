import { z } from "zod";

export const labelColorPattern = /^#[0-9a-fA-F]{6}$/;

export const projectLabelSchema = z.object({
  name: z.string().trim().min(1, "Enter a label name").max(50, "Use 50 characters or fewer"),
  color: z.string().trim().toUpperCase().regex(labelColorPattern, "Enter a six-digit hex color, such as #594BDB"),
});

export type ProjectLabelFormData = z.infer<typeof projectLabelSchema>;
