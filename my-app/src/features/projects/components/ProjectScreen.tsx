"use client";

import { ArrowUpRight, CalendarRange, FolderOpen, Kanban, Layers3, ListTodo, RotateCw, Settings, SlidersHorizontal, Tag, Users } from "lucide-react";
import Link from "next/link";

import { useAuthStore } from "@/features/auth/store/auth.store";
import ProjectBoard from "@/features/issues/components/ProjectBoard";
import ProjectIssues from "@/features/issues/components/ProjectIssues";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/useWorkspaceMembers";
import { getProjectError, type Project } from "../api/project.api";
import ProjectCycles from "../cycles/components/ProjectCycles";
import { useProject } from "../hooks/useProject";
import ProjectLabels from "../labels/components/ProjectLabels";
import ProjectModules from "../modules/components/ProjectModules";
import ProjectStates from "../states/components/ProjectStates";
import ProjectMembers from "./ProjectMembers";
import ProjectSettings from "./ProjectSettings";

const pages = [
  { view: "overview", label: "Overview", suffix: "" },
  { view: "issues", label: "Issues", suffix: "/issues" },
  { view: "board", label: "Board", suffix: "/board" },
  { view: "cycles", label: "Cycles", suffix: "/cycles" },
  { view: "modules", label: "Modules", suffix: "/modules" },
  { view: "members", label: "Members", suffix: "/members" },
  { view: "settings", label: "Settings", suffix: "/settings" },
] as const;
type View = (typeof pages)[number]["view"];
const settingsPages = [
  { id: "general", label: "General", suffix: "", icon: SlidersHorizontal },
  { id: "states", label: "States", suffix: "/states", icon: ListTodo },
  { id: "labels", label: "Labels", suffix: "/labels", icon: Tag },
] as const;
type SettingsSection = (typeof settingsPages)[number]["id"];
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default function ProjectScreen({
  slug,
  projectId,
  view,
  settingsSection = "general",
  planningId,
  issueId,
}: {
  slug: string;
  projectId: string;
  view: View;
  settingsSection?: SettingsSection;
  planningId?: string;
  issueId?: string;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const projectQuery = useProject(slug, projectId);
  const workspaceMembersQuery = useWorkspaceMembers(slug);
  const projectsHref = `/workspaces/${encodeURIComponent(slug)}/projects`;
  const base = `${projectsHref}/${encodeURIComponent(projectId)}`;
  const project = projectQuery.data;
  const workspaceMembers = workspaceMembersQuery.data;
  const role = workspaceMembers?.find((member) => member.user_id === userId)?.role;
  const canManage = role === "owner" || role === "admin";
  const canWriteProjectWork = canManage || role === "member";
  const nestedPage = (view === "settings" && settingsSection !== "general") || Boolean(planningId || issueId);
  const error = (projectQuery.isLoadingError && projectQuery.error)
    || (workspaceMembersQuery.isLoadingError && workspaceMembersQuery.error);
  const isFetching = projectQuery.isFetching || workspaceMembersQuery.isFetching;
  const lead = project?.lead_id
    ? workspaceMembers?.find((member) => member.user_id === project.lead_id)?.user
    : undefined;

  return (
    <section aria-labelledby="project-title" className="mx-auto w-full max-w-5xl text-slate-900">
      <header className="mb-5 flex min-w-0 items-center gap-3.5">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700">
          <FolderOpen size={23} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 id="project-title" className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            {project?.name ?? "Project"}
          </h1>
          {project && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600">{project.identifier}</span>
              {project.is_archived && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Archived</span>}
            </div>
          )}
        </div>
      </header>

      <nav aria-label="Project navigation" className="mb-6 flex flex-wrap gap-x-5 border-b border-slate-200">
        {pages.map(({ view: page, label, suffix }) => (
          <Link
            key={page}
            href={`${base}${suffix}`}
            aria-current={view === page ? nestedPage ? "location" : "page" : undefined}
            className={`inline-flex min-h-10 items-center border-b-2 px-0.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              view === page ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-600 hover:text-indigo-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {error ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p role="alert" className="text-sm text-red-700">{getProjectError(error, "Could not load the project.")}</p>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => {
              if (projectQuery.isError) void projectQuery.refetch();
              if (workspaceMembersQuery.isError) void workspaceMembersQuery.refetch();
            }}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium hover:bg-slate-50 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            <RotateCw size={15} aria-hidden="true" />
            {isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : !project || !workspaceMembers || !userId ? (
        <p role="status" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading project…</p>
      ) : !role ? (
        <p role="alert" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">You no longer have access to this project.</p>
      ) : view === "settings" ? (
        <div className="grid items-start gap-4 lg:grid-cols-[10.5rem_minmax(0,1fr)] lg:gap-5">
          <ProjectSettingsNav href={`${base}/settings`} section={settingsSection} />
          <div className="min-w-0">
            {settingsSection === "states" ? (
              <ProjectStates key={project.id} slug={slug} projectId={project.id} canManage={canManage} />
            ) : settingsSection === "labels" ? (
              <ProjectLabels key={project.id} slug={slug} projectId={project.id} canManage={canManage} />
            ) : (
              <ProjectSettings key={project.id} slug={slug} project={project} workspaceMembers={workspaceMembers} canManage={canManage} projectsHref={projectsHref} />
            )}
          </div>
        </div>
      ) : view === "members" ? (
        <ProjectMembers key={project.id} slug={slug} projectId={project.id} workspaceMembers={workspaceMembers} canManage={canManage} />
      ) : view === "issues" ? (
        <ProjectIssues
          key={issueId ?? project.id}
          slug={slug}
          projectId={project.id}
          projectIdentifier={project.identifier}
          issueId={issueId}
          canManage={canWriteProjectWork}
          canModerate={canManage}
        />
      ) : view === "board" ? (
        <ProjectBoard key={project.id} slug={slug} projectId={project.id} projectIdentifier={project.identifier} canManage={canWriteProjectWork} />
      ) : view === "cycles" ? (
        <ProjectCycles key={planningId ?? project.id} slug={slug} projectId={project.id} cycleId={planningId} canManage={canWriteProjectWork} />
      ) : view === "modules" ? (
        <ProjectModules key={planningId ?? project.id} slug={slug} projectId={project.id} moduleId={planningId} canManage={canWriteProjectWork} />
      ) : (
        <ProjectOverview project={project} leadName={lead?.display_name || lead?.email} base={base} />
      )}
    </section>
  );
}

function ProjectSettingsNav({ href, section }: { href: string; section: SettingsSection }) {
  return (
    <nav aria-label="Project settings" className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5 lg:sticky lg:top-20 lg:flex-col">
      {settingsPages.map(({ id, label, suffix, icon: Icon }) => (
        <Link
          key={id}
          href={`${href}${suffix}`}
          aria-current={section === id ? "page" : undefined}
          className={`inline-flex min-h-10 min-w-0 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            section === id ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50 hover:text-indigo-700"
          }`}
        >
          <Icon size={16} aria-hidden="true" className="shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function ProjectOverview({ project, leadName, base }: { project: Project; leadName?: string; base: string }) {
  const details = [
    { label: "Project lead", value: leadName ?? (project.lead_id ? "Unavailable" : "Unassigned") },
    { label: "Created", value: dateFormat.format(new Date(project.created_at)) },
    { label: "Last updated", value: dateFormat.format(new Date(project.updated_at)) },
  ];
  const shortcuts = [
    { label: "Issues", caption: "See and create tasks for this project.", href: `${base}/issues`, icon: ListTodo },
    { label: "Board", caption: "Move issues through project states.", href: `${base}/board`, icon: Kanban },
    { label: "Cycles", caption: "Plan issues in a date range.", href: `${base}/cycles`, icon: CalendarRange },
    { label: "Modules", caption: "Group related issues in one place.", href: `${base}/modules`, icon: Layers3 },
    { label: "Members", caption: "See who belongs to the project.", href: `${base}/members`, icon: Users },
    { label: "Settings", caption: "Project information and status.", href: `${base}/settings`, icon: Settings },
  ];

  return (
    <div className="space-y-4">
      <section aria-labelledby="project-details" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <h2 id="project-details" className="border-b border-slate-200 px-5 py-4 text-sm font-semibold">Project details</h2>
        <div className="space-y-5 px-5 py-5">
          <div>
            <h3 className="text-xs font-medium text-slate-600">Description</h3>
            <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-800">
              {project.description || "No description yet."}
            </p>
          </div>
          <dl className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            {details.map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-slate-600">{label}</dt>
                <dd className="mt-1 wrap-break-word text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map(({ label, caption, href, icon: Icon }) => (
          <Link key={href} href={href} className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
              <Icon size={19} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="mt-1 block text-sm text-slate-600">{caption}</span>
            </span>
            <ArrowUpRight size={17} aria-hidden="true" className="shrink-0 text-slate-400 group-hover:text-indigo-700" />
          </Link>
        ))}
      </div>
    </div>
  );
}
