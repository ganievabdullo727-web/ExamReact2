import { z } from "zod";

export const commentMaxLength = 50_000;

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, "Enter a comment.").max(commentMaxLength, "Comments can contain up to 50,000 characters."),
});

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
