"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { registerSchema, type RegisterFormData } from "../schemas/auth.schema";

import { useRegister } from "../hooks/useRegister";

const RegisterForm = () => {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
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
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7059EE] text-2xl font-bold text-white shadow-[0_8px_24px_rgba(112,89,238,0.25)]">
          T
        </div>

        <h1 className="text-[30px] font-bold tracking-tight text-[#191B35]">
          Create account
        </h1>

        <p className="mt-2 text-sm text-[#898CA3]">
          Get started with your TaskFlow account
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#30334D]">
          Full name
        </label>

        <input
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
        <label className="block text-sm font-semibold text-[#30334D]">
          Email address
        </label>

        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email"
          className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] px-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-[#A0A3B5] focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-[#7059EE]/10"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#30334D]">
          Password
        </label>

        <input
          {...register("password")}
          type="password"
          placeholder="Create a password"
          className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] px-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-[#A0A3B5] focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-[#7059EE]/10"
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-[#7059EE] text-sm font-semibold text-white shadow-[0_6px_18px_rgba(112,89,238,0.22)] transition-all duration-200 hover:bg-[#6049DE] hover:shadow-[0_8px_24px_rgba(112,89,238,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {registerMutation.isPending ? "Registering..." : "Create account"}
      </button>

      {registerMutation.isError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          Registration failed
        </p>
      )}
    </form>
  </div>
);

};

export default RegisterForm;
