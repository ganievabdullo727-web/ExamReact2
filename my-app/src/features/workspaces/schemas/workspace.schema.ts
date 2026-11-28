import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z.string().trim().min(2).max(50).regex(
    /^[a-z0-9-]+$/,
    "Invalid slug"
  ),
});

export const addWorkspaceMemberSchema = z.object({
  user_id: z.uuid("Invalid user ID"),
  role: z.enum(["admin", "member", "guest"]),
});

export const inviteWorkspaceMemberSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email")),
  role: z.enum(["admin", "member", "guest"]),
});

export type WorkspaceFormData = z.infer<typeof workspaceSchema>;
export type AddWorkspaceMemberFormData = z.infer<typeof addWorkspaceMemberSchema>;
export type InviteWorkspaceMemberFormData = z.infer<typeof inviteWorkspaceMemberSchema>;