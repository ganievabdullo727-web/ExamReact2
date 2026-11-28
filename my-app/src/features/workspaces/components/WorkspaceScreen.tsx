"use client";

import { ArrowUpRight, FolderOpen, RotateCw, Settings, Users } from "lucide-react";
import Link from "next/link";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getWorkspaceError, type Workspace, type WorkspaceRole } from "../api/workspace.api";
import { useWorkspace } from "../hooks/useWorkspace";
import { useWorkspaceMembers } from "../hooks/useWorkspaceMembers";
import WorkspaceMembers from "./WorkspaceMembers";
import WorkspaceSettings from "./WorkspaceSettings";

type View = "overview" | "settings" | "members";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const pageTitles: Record<View, string> = {
  overview: "Workspace overview",
  settings: "Workspace settings",
  members: "Members",
};
const panelStyle = "rounded-xl border border-[#E2E5EE] bg-white";

export default function WorkspaceScreen({ slug, view }: { slug: string; view: View }) {
  const userId = useAuthStore((state) => state.user?.id);
  const workspace = useWorkspace(slug);
  const members = useWorkspaceMembers(slug);
  const base = `/workspaces/${encodeURIComponent(slug)}`;
  const currentRole = members.data?.find((member) => member.user_id === userId)?.role;
  const error = workspace.error ?? members.error;
  const isFetching = workspace.isFetching || members.isFetching;
  const workspaceName = workspace.data?.name;

  return (
    <section aria-labelledby="workspace-page-title" className="mx-auto w-full max-w-5xl text-slate-900">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 id="workspace-page-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {pageTitles[view]}
          </h1>
          {workspaceName && (
            <p className="mt-1.5 break-words text-sm leading-6 text-slate-600">
              {workspaceName}
            </p>
          )}
        </div>
        {currentRole && view !== "overview" && (
          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium capitalize text-indigo-700">
            {currentRole}
          </span>
        )}
      </header>

      {error ? (
        <div className={`${panelStyle} p-5`}>
          <p role="alert" className="text-sm text-red-700">
            {getWorkspaceError(error, "Could not load this workspace.")}
          </p>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => {
              if (workspace.isError) void workspace.refetch();
              if (members.isError) void members.refetch();
            }}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60"
          >
            <RotateCw size={15} aria-hidden="true" className={isFetching ? "motion-safe:animate-spin" : undefined} />
            {isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : !workspace.data || !members.data || !userId ? (
        <div role="status" className={`${panelStyle} p-5 text-sm text-slate-600`}>
          Loading workspace…
        </div>
      ) : !currentRole ? (
        <p role="alert" className={`${panelStyle} p-5 text-sm text-slate-700`}>
          You no longer have access to this workspace.
        </p>
      ) : view === "members" ? (
        <WorkspaceMembers slug={slug} members={members.data} currentUserId={userId} currentRole={currentRole} />
      ) : view === "settings" ? (
        <WorkspaceSettings key={slug} workspace={workspace.data} members={members.data} currentRole={currentRole} />
      ) : (
        <WorkspaceOverview
          base={base}
          workspace={workspace.data}
          role={currentRole}
          ownerName={members.data.find((member) => member.user_id === workspace.data.owner_id)?.user?.display_name}
          memberCount={members.data.length}
        />
      )}
    </section>
  );
}

function WorkspaceOverview({
  base,
  workspace,
  role,
  ownerName,
  memberCount,
}: {
  base: string;
  workspace: Workspace;
  role: WorkspaceRole;
  ownerName?: string;
  memberCount: number;
}) {
  const details = [
    { label: "Owner", value: ownerName ?? "Unavailable" },
    { label: "Your role", value: role, capitalize: true },
    { label: "Created", value: dateFormat.format(new Date(workspace.created_at)) },
    { label: "URL slug", value: workspace.slug },
  ];
  const shortcuts = [
    { label: "Projects", caption: "Browse projects in this workspace", icon: FolderOpen, href: `${base}/projects` },
    { label: "Members", caption: `${memberCount} ${memberCount === 1 ? "person" : "people"} in this workspace`, icon: Users, href: `${base}/settings/members` },
    { label: "Settings", caption: "Workspace details and access", icon: Settings, href: `${base}/settings` },
  ];

  return (
    <div className="space-y-4">
      <section aria-labelledby="workspace-details" className={`${panelStyle} overflow-hidden`}>
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 id="workspace-details" className="text-sm font-semibold">Workspace details</h2>
        </div>
        <dl className="grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
          {details.map(({ label, value, capitalize }) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-slate-600">{label}</dt>
              <dd className={`mt-1 break-words text-sm font-medium ${capitalize ? "capitalize" : ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map(({ href, label, caption, icon: Icon }) => (
          <li key={href}>
          <Link href={href} className={`${panelStyle} group flex h-full items-center gap-3.5 p-4 transition-colors hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-indigo-500 sm:px-5`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon size={19} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="mt-1 block text-sm text-slate-600">{caption}</span>
            </span>
            <ArrowUpRight size={17} aria-hidden="true" className="shrink-0 text-slate-400 group-hover:text-indigo-600" />
          </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
