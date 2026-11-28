import { z } from "zod";

const dateField = z.union([z.literal(""), z.iso.date("Choose a valid calendar date.")]);

export const cycleSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a cycle name.").max(255, "Use 255 characters or fewer."),
    description: z.string().trim().max(10000, "Use 10,000 characters or fewer."),
    start_date: dateField,
    end_date: dateField,
  })
  .refine(
    ({ start_date, end_date }) => !start_date || !end_date || end_date >= start_date,
    { path: ["end_date"], message: "End date must be on or after the start date." },
  );

export type CycleFormData = z.infer<typeof cycleSchema>;

