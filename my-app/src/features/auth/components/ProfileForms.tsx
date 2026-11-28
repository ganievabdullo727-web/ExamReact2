"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, UserRound } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useChangePassword } from "../hooks/useChangePassword";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordFormData,
  type UpdateProfileFormData,
} from "../schemas/auth.schema";

const panelClass = "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5";
const fieldClass = "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 aria-invalid:border-red-400 disabled:bg-slate-50 disabled:text-slate-600";
const labelClass = "mb-2 block text-sm font-medium text-slate-800";
const footerClass = "flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/75 px-5 py-3 sm:px-6";
const buttonClass = "inline-flex min-h-10 items-center justify-center rounded-lg bg-[#594BDB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#483BC3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600";

function getAvatarSource(value?: string | null) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    return undefined;
  }
}

function ProfileIdentity({ name, email, avatar }: { name?: string; email?: string; avatar?: string | null }) {
  const [failedAvatar, setFailedAvatar] = useState<string>();
  const src = getAvatarSource(avatar);
  const initials = (name ?? "").trim().split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5">
      <div aria-hidden="true" className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-indigo-100 text-sm font-semibold text-indigo-800">
        {initials || <UserRound size={20} />}
        {src && src !== failedAvatar && (
          <Image
            src={src}
            alt=""
            width={48}
            height={48}
            className="absolute inset-0 size-full object-cover"
            referrerPolicy="no-referrer"
            unoptimized
            onError={() => setFailedAvatar(src)}
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-slate-900">{name || "Your profile"}</p>
        {email && <p className="mt-0.5 break-all text-sm text-slate-600">{email}</p>}
      </div>
    </div>
  );
}

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

  const profileErrors = profileForm.formState.errors;
  const passwordErrors = passwordForm.formState.errors;

  return (
    <>
      <form
        aria-labelledby="profile-information-title"
        className={panelClass}
        noValidate
        onSubmit={profileForm.handleSubmit(onUpdateProfile)}
      >
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 id="profile-information-title" className="font-semibold text-slate-900">
            Personal information
          </h2>
          <p className="mt-1 text-sm text-slate-600">Update how your name and photo appear in TaskFlow.</p>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <ProfileIdentity name={user?.display_name} email={user?.email} avatar={user?.avatar_url} />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="profile-display-name" className={labelClass}>Display name</label>
              <input
                id="profile-display-name"
                {...profileForm.register("display_name")}
                autoComplete="nickname"
                className={fieldClass}
                placeholder="Enter your display name"
                aria-invalid={Boolean(profileErrors.display_name)}
                aria-describedby={profileErrors.display_name ? "profile-display-name-error" : undefined}
              />
              {profileErrors.display_name && (
                <p id="profile-display-name-error" className="mt-1.5 text-sm text-red-700">{profileErrors.display_name.message}</p>
              )}
            </div>

            <div className="min-w-0">
              <label htmlFor="profile-avatar-url" className={labelClass}>Avatar URL</label>
              <input
                id="profile-avatar-url"
                {...profileForm.register("avatar_url")}
                type="url"
                className={fieldClass}
                placeholder="https://example.com/avatar.png"
                aria-invalid={Boolean(profileErrors.avatar_url)}
                aria-describedby={profileErrors.avatar_url ? "profile-avatar-url-error" : "profile-avatar-url-help"}
              />
              {profileErrors.avatar_url ? (
                <p id="profile-avatar-url-error" className="mt-1.5 text-sm text-red-700">{profileErrors.avatar_url.message}</p>
              ) : (
                <p id="profile-avatar-url-help" className="mt-2 text-xs text-slate-600">Leave blank to use your initials.</p>
              )}
            </div>
          </div>
        </div>

        <div className={footerClass}>
          {updateMutation.isSuccess && (
            <p role="status" className="mr-auto text-sm font-medium text-emerald-700">Profile saved.</p>
          )}
          {updateMutation.isError && (
            <p role="alert" className="mr-auto text-sm font-medium text-red-700">Could not update your profile.</p>
          )}
          <button type="submit" disabled={updateMutation.isPending} className={buttonClass}>
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <form
        aria-labelledby="profile-password-title"
        className={panelClass}
        noValidate
        onSubmit={passwordForm.handleSubmit(onChangePassword)}
      >
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <KeyRound size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 id="profile-password-title" className="font-semibold text-slate-900">
              Change password
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">Changing your password signs you out.</p>
          </div>
        </div>

        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <div className="min-w-0">
            <label htmlFor="profile-current-password" className={labelClass}>Current password</label>
            <input
              id="profile-current-password"
              {...passwordForm.register("current_password")}
              type="password"
              autoComplete="current-password"
              className={fieldClass}
              aria-invalid={Boolean(passwordErrors.current_password)}
              aria-describedby={passwordErrors.current_password ? "profile-current-password-error" : undefined}
            />
            {passwordErrors.current_password && (
              <p id="profile-current-password-error" className="mt-1.5 text-sm text-red-700">{passwordErrors.current_password.message}</p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="profile-new-password" className={labelClass}>New password</label>
            <input
              id="profile-new-password"
              {...passwordForm.register("new_password")}
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              aria-invalid={Boolean(passwordErrors.new_password)}
              aria-describedby={passwordErrors.new_password ? "profile-new-password-error" : "profile-new-password-help"}
            />
            {passwordErrors.new_password ? (
              <p id="profile-new-password-error" className="mt-1.5 text-sm text-red-700">{passwordErrors.new_password.message}</p>
            ) : (
              <p id="profile-new-password-help" className="mt-2 text-xs text-slate-600">Use at least 8 characters.</p>
            )}
          </div>
        </div>

        <div className={footerClass}>
          {passwordMutation.isSuccess && (
            <p role="status" className="mr-auto text-sm font-medium text-emerald-700">Password changed.</p>
          )}
          {passwordMutation.isError && (
            <p role="alert" className="mr-auto text-sm font-medium text-red-700">Could not change your password.</p>
          )}
          <button type="submit" disabled={passwordMutation.isPending} className={buttonClass}>
            {passwordMutation.isPending ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </>
  );
}
