"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormData } from "../schemas/auth.schema";

import { useLogin } from "../hooks/useLogin";
import { useRouter } from "next/navigation";

import Link from "next/link";

const LoginForm = () => {
  const loginMutation = useLogin();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.replace("/profile");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-4 py-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-[440px] space-y-6 rounded-[24px] border border-[#E9EAF2] bg-white px-8 py-10 shadow-[0_12px_50px_rgba(30,27,75,0.06)] sm:px-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-[30px] font-bold tracking-tight text-[#191B35]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[#898CA3]">
            Sign in to your TaskFlow account
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#30334D]">
            Email address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] px-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-[#A0A3B5] focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-[#7059EE]/10"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#30334D]">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            {...register("password")}
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
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#7059EE] transition-colors hover:text-[#6049DE] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-[#7059EE] text-sm font-semibold text-white shadow-[0_6px_18px_rgba(112,89,238,0.22)] transition-all duration-200 hover:bg-[#6049DE] hover:shadow-[0_8px_24px_rgba(112,89,238,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>

        {loginMutation.isError && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            Login failed. Check your credentials.
          </p>
        )}

        {loginMutation.isSuccess && (
          <p className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-center text-sm text-green-600">
            Login request successful!
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
