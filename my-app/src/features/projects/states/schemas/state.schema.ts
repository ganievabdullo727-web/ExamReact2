import { z } from "zod";
import { stateGroups } from "../api/state.api";

export const stateColorPattern = /^#[0-9A-Fa-f]{6}$/;
export const maxStateOrder = 2_147_483_647;

export const projectStateSchema = z.object({
  name: z.string().trim().min(1, "State name is required.").max(50, "Use at most 50 characters."),
  color: z.string().trim().regex(stateColorPattern, "Use a color like #4F46E5."),
  group: z.enum(stateGroups),
  order: z.number({ error: "Enter a whole number." }).int().min(0).max(maxStateOrder),
  is_default: z.boolean(),
});

export type ProjectStateFormData = z.infer<typeof projectStateSchema>;
