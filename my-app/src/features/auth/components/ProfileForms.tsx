"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileFormData,
  type ChangePasswordFormData,
} from "../schemas/auth.schema";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useChangePassword } from "../hooks/useChangePassword";

export default function ProfileForms() {
  const router = useRouter();
  const { data: user } = useCurrentUser();

  const updateMutation = useUpdateProfile();
  const passwordMutation = useChangePassword();

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      display_name: user?.display_name ?? "",
      avatar_url: user?.avatar_url ?? "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onUpdateProfile = (data: UpdateProfileFormData) => {
    updateMutation.mutate({
      display_name: data.display_name,
      avatar_url: data.avatar_url || null,
    });
  };

  const onChangePassword = (data: ChangePasswordFormData) => {
    passwordMutation.mutate(data, {
      onSuccess: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
        router.refresh();
      },
    });
  };

 
return (
  <div className="mx-auto w-full max-w-3xl space-y-8 py-8">
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191B35]">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile and account security
          </p>
        </div>
      </div>
    </div>

    <form
      onSubmit={profileForm.handleSubmit(onUpdateProfile)}
      className="overflow-hidden rounded-2xl border border-[#E9EAF2] bg-white shadow-[0_8px_30px_rgba(30,27,75,0.04)]"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-7 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#191B35]">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update your personal details
          </p>
        </div>
      </div>

      <div className="space-y-6 p-7">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#30334D]">
            Display Name
          </label>

          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="8" r="4" />
            </svg>

            <input
              {...profileForm.register("display_name")}
              placeholder="Enter your display name"
              className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] pl-12 pr-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {profileForm.formState.errors.display_name && (
            <p className="text-sm text-red-500">
              {profileForm.formState.errors.display_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#30334D]">
            Avatar URL
          </label>

          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>

            <input
              {...profileForm.register("avatar_url")}
              placeholder="https://example.com/avatar.png"
              className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] pl-12 pr-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {profileForm.formState.errors.avatar_url && (
            <p className="text-sm text-red-500">
              {profileForm.formState.errors.avatar_url.message}
            </p>
          )}

          <p className="text-xs text-slate-400">
            Paste a link to your profile picture
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <div>
            {updateMutation.isSuccess && (
              <p className="text-sm font-medium text-green-600">
                Profile updated successfully!
              </p>
            )}

            {updateMutation.isError && (
              <p className="text-sm font-medium text-red-500">
                Profile update failed
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7059EE] px-6 text-sm font-semibold text-white shadow-[0_5px_16px_rgba(112,89,238,0.2)] transition-all duration-200 hover:bg-[#6049DE] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M17 21v-8H7v8" />
              <path d="M7 3v5h8" />
            </svg>

            {updateMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </form>

    <form
      onSubmit={passwordForm.handleSubmit(onChangePassword)}
      className="overflow-hidden rounded-2xl border border-[#E9EAF2] bg-white shadow-[0_8px_30px_rgba(30,27,75,0.04)]"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-7 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="15.5" r="1" />
            <path d="M12 16.5V18" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#191B35]">
            Change Password
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your account secure with a strong password
          </p>
        </div>
      </div>

      <div className="space-y-6 p-7">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#30334D]">
            Current Password
          </label>

          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>

            <input
              {...passwordForm.register("current_password")}
              type="password"
              placeholder="Enter current password"
              className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] pl-12 pr-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {passwordForm.formState.errors.current_password && (
            <p className="text-sm text-red-500">
              {passwordForm.formState.errors.current_password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#30334D]">
            New Password
          </label>

          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <path d="M12 15v2" />
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>

            <input
              {...passwordForm.register("new_password")}
              type="password"
              placeholder="Enter new password"
              className="h-12 w-full rounded-xl border border-[#E4E6F0] bg-[#FAFAFD] pl-12 pr-4 text-sm text-[#191B35] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#7059EE] focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {passwordForm.formState.errors.new_password && (
            <p className="text-sm text-red-500">
              {passwordForm.formState.errors.new_password.message}
            </p>
          )}

          <p className="text-xs text-slate-400">
            Password must be at least 8 characters long
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <div>
            {passwordMutation.isSuccess && (
              <p className="text-sm font-medium text-green-600">
                Password changed successfully!
              </p>
            )}

            {passwordMutation.isError && (
              <p className="text-sm font-medium text-red-500">
                Password change failed
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7059EE] px-6 text-sm font-semibold text-white shadow-[0_5px_16px_rgba(112,89,238,0.2)] transition-all duration-200 hover:bg-[#6049DE] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 7 10 17l-5-5" />
            </svg>

            {passwordMutation.isPending
              ? "Updating..."
              : "Update Password"}
          </button>
        </div>
      </div>
    </form>
  </div>
);

}
