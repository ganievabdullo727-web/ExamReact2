import { LogOut } from "lucide-react";

import LogoutButton from "@/features/auth/components/LogoutButton";
import ProfileForms from "@/features/auth/components/ProfileForms";

export default function ProfilePage() {
  return (
    <section aria-labelledby="profile-page-title" className="mx-auto w-full max-w-5xl text-slate-900">
      <header className="mb-7">
        <h1 id="profile-page-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Account settings
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-600">
          Manage your personal information, password, and current session.
        </p>
      </header>

      <div className="max-w-3xl space-y-5">
        <ProfileForms />

        <section
          aria-labelledby="profile-session-title"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-900/5 sm:px-6"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
              <LogOut size={17} aria-hidden="true" />
            </span>
            <div>
              <h2 id="profile-session-title" className="font-semibold text-slate-900">
                Current session
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Sign out of TaskFlow on this device.
              </p>
            </div>
          </div>
          <LogoutButton />
        </section>
      </div>
    </section>
  );
}
