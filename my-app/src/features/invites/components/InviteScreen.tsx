"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Mail, RotateCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { User } from "@/features/auth/api/auth.api";
import LoginForm from "@/features/auth/components/LoginForm";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { workspaceQueryKeys } from "@/features/workspaces/hooks/workspace-query-keys";
import { queryKeys } from "@/shared/api/query-keys";
import { getInviteError, invitationPath, isUnavailableInvite } from "../api/invite.api";
import { useAcceptInvite } from "../hooks/useAcceptInvite";
import { inviteQueryKey, useInvite } from "../hooks/useInvite";

const primary = "inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[#7059EE] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6049DE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50";
const secondary = "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50";
const expiryFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function InviteCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-4 py-10">
      <section aria-labelledby="invite-title" className="w-full max-w-[440px] space-y-5 rounded-[24px] border border-[#E9EAF2] bg-white p-8 shadow-[0_12px_50px_rgba(30,27,75,0.06)] sm:p-10">
        <span className="grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
          <Mail size={22} aria-hidden="true" />
        </span>
        {children}
      </section>
    </main>
  );
}

const titleClass = "break-words text-2xl font-bold tracking-tight text-[#191B35]";

export default function InviteScreen({ token, mode }: { token: string; mode?: "login" | "register" }) {
  const route = invitationPath(token);
  const loginHref = `${route}?mode=login`;
  const registerHref = `${route}?mode=register`;
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useInvite(token);
  const session = useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout(loginHref);
  const accept = useAcceptInvite(token);
  const invite = query.data;

  if (query.isPending || session.isPending) {
    return (
      <InviteCard>
        <h1 id="invite-title" className={titleClass}>Workspace invitation</h1>
        <p role="status" className="text-sm text-slate-600">Loading invitation…</p>
      </InviteCard>
    );
  }

  if (query.isError || !invite) {
    const unavailable = isUnavailableInvite(query.error);
    return (
      <InviteCard>
        <h1 id="invite-title" className={titleClass}>Workspace invitation</h1>
        <p role="alert" className="text-sm text-red-700">{getInviteError(query.error, "Could not load this invitation.")}</p>
        {!unavailable && (
          <button type="button" className={primary} onClick={() => void query.refetch()}>
            <RotateCw size={16} aria-hidden="true" className="mr-2" />
            Try again
          </button>
        )}
        <Link href={user ? "/workspaces" : "/login"} className={secondary}>{user ? "Back to workspaces" : "Go to sign in"}</Link>
      </InviteCard>
    );
  }

  const workspaceHref = `/workspaces/${encodeURIComponent(invite.workspace.slug)}`;
  const acceptedByEmail = user?.email.toLowerCase() === invite.email.toLowerCase();

  if (!user && mode === "login") {
    return (
      <LoginForm invite={{
        email: invite.email,
        workspaceName: invite.workspace.name,
        registerHref,
        onAuthenticated: (person) => {
          queryClient.setQueryData(queryKeys.auth.me, person);
          router.replace(route);
        },
      }} />
    );
  }

  if (!user && mode === "register") {
    const enterWorkspace = async (person: User) => {
      queryClient.setQueryData(queryKeys.auth.me, person);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list(person.id), exact: true }),
        queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(person.id, invite.workspace.slug) }),
        queryClient.invalidateQueries({ queryKey: inviteQueryKey(token), exact: true, refetchType: "none" }),
      ]);
      router.replace(workspaceHref);
    };
    return <RegisterForm invite={{
      token,
      email: invite.email,
      workspaceName: invite.workspace.name,
      loginHref,
      onAuthenticated: (person) => void enterWorkspace(person),
    }} />;
  }

  const expires = new Date(invite.expires_at);
  return (
    <InviteCard>
      <div className="space-y-2">
        <h1 id="invite-title" className={titleClass}>Join {invite.workspace.name}</h1>
        <p className="break-words text-sm leading-relaxed text-slate-600">
          {invite.invited_by.display_name} invited you to join <span className="font-semibold text-slate-900">{invite.workspace.name}</span>.
        </p>
      </div>
      <dl className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <dt className="text-slate-600">Invited email</dt><dd className="wrap-anywhere font-medium text-slate-900">{invite.email}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-x-4">
          <dt className="text-slate-600">Role</dt><dd className="font-medium text-slate-900 capitalize">{invite.role}</dd>
        </div>
        {!Number.isNaN(expires.getTime()) && (
          <div className="flex items-baseline justify-between gap-x-4">
            <dt className="text-slate-600">Expires</dt><dd className="font-medium text-slate-900"><time dateTime={invite.expires_at}>{expiryFormat.format(expires)}</time></dd>
          </div>
        )}
      </dl>
      {!user ? (
        <div className="space-y-2">
          <Link href={loginHref} prefetch={false} className={primary}>Sign in to accept</Link>
          <Link href={registerHref} prefetch={false} className={secondary}>Create an account</Link>
        </div>
      ) : acceptedByEmail ? (
        <div className="space-y-2">
          <button
            type="button"
            className={primary}
            disabled={accept.isPending || accept.isSuccess || isUnavailableInvite(accept.error)}
            onClick={() => accept.mutate({ invite, userId: user.id }, { onSuccess: () => router.replace(workspaceHref) })}
          >
            {accept.isPending || accept.isSuccess ? "Joining…" : "Accept invitation"}
          </button>
          {accept.isError && <p role="alert" className="text-sm text-red-700">{getInviteError(accept.error, "Could not accept this invitation. Try again.")}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <p role="alert" className="wrap-anywhere text-sm text-red-700">
            You are signed in as {user.email}. Sign in with {invite.email} to accept.
          </p>
          <button type="button" className={primary} onClick={() => logout.mutate()} disabled={logout.isPending}>
            {logout.isPending ? "Signing out…" : "Switch account"}
          </button>
        </div>
      )}
    </InviteCard>
  );
}
