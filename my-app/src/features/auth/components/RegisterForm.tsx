"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

import { registerSchema, type RegisterFormData } from "../schemas/auth.schema";

import { useRegister } from "../hooks/useRegister";
import type { User } from "../api/auth.api";

import Link from "next/link";

const RegisterForm = ({ invite }: { invite?: {
  token: string;
  email: string;
  workspaceName: string;
  loginHref: string;
  onAuthenticated: (user: User) => void;
} }) => {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: invite?.email ?? "", display_name: "", password: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { user } = await registerMutation.mutateAsync(invite ? { ...data, email: invite.email, invite_token: invite.token } : data);
      if (invite) invite.onAuthenticated(user);
      else router.replace("/profile");
    } catch {
      // The mutation displays the error beneath the form.
    }
  };
  const registrationError = invite && isAxiosError<{ error?: { message?: string } }>(registerMutation.error)
    ? registerMutation.error.response?.data?.error?.message
    : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-4 py-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-[440px] space-y-6 rounded-[24px] border border-[#E9EAF2] bg-white px-8 py-10 shadow-[0_12px_50px_rgba(30,27,75,0.06)] sm:px-10"
      >
     
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-[30px] font-bold tracking-tight text-[#191B35]">
            Create account
          </h1>

          <p className="mt-2 text-sm text-[#898CA3]">
            {invite ? `Create a TaskFlow account to join ${invite.workspaceName}` : "Get started with your TaskFlow account"}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-name" className="block text-sm font-semibold text-[#30334D]">
            Full name
          </label>

          <input
            id="register-name"
            autoComplete="name"
            {...register("display_name")}
            placeholder="Enter your full name"
            className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] px-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-[#A0A3B5] focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-[#7059EE]/10"
          />

          {errors.display_name && (
            <p className="mt-1 text-sm text-red-500">
              {errors.display_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email" className="block text-sm font-semibold text-[#30334D]">
            Email address
          </label>

          <input
            id="register-email"
            {...register("email")}
            type="email"
            autoComplete="email"
            readOnly={Boolean(invite)}
            placeholder="Enter your email"
            className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] px-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-[#A0A3B5] focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-[#7059EE]/10"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password" className="block text-sm font-semibold text-[#30334D]">
            Password
          </label>

          <input
            id="register-password"
            {...register("password")}
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] px-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-[#A0A3B5] focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-[#7059EE]/10"
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

         <div className="border-t border-slate-100 pt-6 text-center">
        <p className="text-sm text-[#898CA3]">
          Already have an account?{" "}
          <Link
            href={invite?.loginHref ?? "/login"}
            prefetch={invite ? false : undefined}
            className="font-semibold text-[#7059EE] transition-colors hover:text-[#6049DE] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-[#7059EE] text-sm font-semibold text-white shadow-[0_6px_18px_rgba(112,89,238,0.22)] transition-all duration-200 hover:bg-[#6049DE] hover:shadow-[0_8px_24px_rgba(112,89,238,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {registerMutation.isPending ? "Registering..." : "Create account"}
        </button>

        {registerMutation.isError && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {registrationError ?? "Registration failed"}
          </p>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;
