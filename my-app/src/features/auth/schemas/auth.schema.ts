
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email нодуруст аст"),

  password: z
    .string()
    .min(8, "Парол бояд на камтар аз 8 символ бошад"),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  display_name: z.string().min(1, "Ном ҳатмист"),

  email: z.email("Email нодуруст аст"),

  password: z
    .string()
    .min(8, "Парол бояд на камтар аз 8 символ бошад"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;


export const updateProfileSchema = z.object({
  display_name: z.string().min(1, "Ном ҳатмист"),
  avatar_url: z.union([z.url(), z.literal("")]),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Пароли ҳозира ҳатмист"),
  new_password: z.string().min(8, "Пароли нав бояд 8 символ бошад"),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
