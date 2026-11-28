"use client";

import { ArrowUpRight, ListTodo, RotateCw, Search, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjectError, type Project } from "@/features/projects/api/project.api";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useProjectStates } from "@/features/projects/states/hooks/useProjectStates";
import { getIssueError } from "../api/issue.api";
import { useIssues } from "../hooks/useIssues";

const panel = "rounded-xl border border-slate-200 bg-white";
const input = "min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const button = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const calendarDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export default function WorkspaceIssues({ slug, assignedToMe = false }: { slug: string; assignedToMe?: boolean }) {
  const userId = useAuthStore((state) => state.user?.id);
  const workspaceProjects = useProjects(slug);
  const [selectedProject, setSelectedProject] = useState("");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const id = useId();
  const projects = workspaceProjects.data ?? [];
  const visibleProjects = selectedProject ? projects.filter((project) => project.id === selectedProject) : projects;
  const Icon = assignedToMe ? UserRoundCheck : ListTodo;

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchText.trim()), 220);
    return () => window.clearTimeout(timeout);
  }, [searchText]);

  return (
    <section aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-5xl space-y-4 text-slate-900">
      <header className="mb-6 flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700">
          <Icon size={23} aria-hidden="true" />
        </span>
        <div>
          <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-tight sm:text-3xl">{assignedToMe ? "My issues" : "Issues"}</h1>
          <p className="mt-1 text-sm text-slate-600">{assignedToMe ? "Issues assigned to you in this workspace." : "Browse issues across workspace projects."}</p>
        </div>
      </header>
      {workspaceProjects.isPending && <p role="status" className={`${panel} p-5 text-sm text-slate-600`}>Loading workspace projects…</p>}
      {workspaceProjects.isError && (
        <ListError
          message={getProjectError(workspaceProjects.error, "Could not load workspace projects.")}
          retry={() => void workspaceProjects.refetch()}
          busy={workspaceProjects.isFetching}
        />
      )}
      {workspaceProjects.isSuccess && projects.length === 0 && (
        <p className={`${panel} p-5 text-sm text-slate-600`}>No projects in this workspace yet.</p>
      )}
      {projects.length > 0 && (
        <>
          <div className={`${panel} flex flex-wrap items-center gap-3 p-4`}>
            <div className="relative min-w-44 flex-1">
              <label htmlFor={`${id}-search`} className="sr-only">Search issues</label>
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input id={`${id}-search`} type="search" value={searchText} placeholder="Search issues" onChange={(event) => setSearchText(event.target.value)} className={`${input} w-full pl-9`} />
            </div>
            <label htmlFor={`${id}-project`} className="sr-only">Filter by project</label>
            <select id={`${id}-project`} value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)} className={`${input} max-w-full sm:max-w-52`}>
              <option value="">All projects</option>
              {selectedProject && visibleProjects.length === 0 && <option value={selectedProject} disabled>Unavailable project</option>}
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </div>
          {visibleProjects.length === 0 && <p className={`${panel} p-5 text-sm text-slate-600`}>Select an available project.</p>}
          <div className="space-y-3">
            {visibleProjects.map((project) => (
              <WorkspaceProjectIssues key={project.id} slug={slug} project={project} search={search} searchPending={searchText.trim() !== search} assignee={assignedToMe ? userId : undefined} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function WorkspaceProjectIssues({ slug, project, search, searchPending, assignee }: {
  slug: string;
  project: Project;
  search: string;
  searchPending: boolean;
  assignee?: string;
}) {
  const issues = useIssues(slug, project.id, { search, assignee });
  const states = useProjectStates(slug, project.id);
  const listHref = `/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(project.id)}/issues`;
  const stateById = new Map(states.data?.map((state) => [state.id, state]));
  const items = Array.from(new Map(issues.data?.pages.flatMap((page) => page.data.map((issue) => [issue.id, issue] as const))).values());

  return (
    <section aria-labelledby={`issues-${project.id}`} className={panel}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 id={`issues-${project.id}`} className="wrap-anywhere text-sm font-semibold text-slate-900">{project.name}</h2>
          {project.is_archived && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Archived</span>}
        </div>
        <Link href={listHref} className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
          Project issues <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </header>
      {searchPending || issues.isPending ? (
        <p role="status" className="px-5 py-4 text-sm text-slate-600">Loading issues…</p>
      ) : (
        <>
          {issues.isError && (
            <ListError
              message={getIssueError(issues.error, "Could not load issues for this project.")}
              retry={() => void (issues.isFetchNextPageError ? issues.fetchNextPage() : issues.refetch())}
              busy={issues.isFetching}
            />
          )}
          {issues.data && !issues.isError && items.length === 0 && (
            <p className="px-5 py-4 text-sm text-slate-600">{search ? "No matching issues." : assignee ? "No issues assigned to you." : "No issues yet."}</p>
          )}
          {items.length > 0 && (
            <ul aria-label={`${project.name} issues`} aria-busy={issues.isFetching} className="divide-y divide-slate-100">
              {items.map((issue) => {
                const state = stateById.get(issue.state_id);
                const due = issue.due_date ? new Date(issue.due_date) : undefined;
                return (
                  <li key={issue.id}>
                    <Link href={`${listHref}/${encodeURIComponent(issue.id)}`} className="group flex flex-wrap items-center justify-between gap-2.5 px-5 py-3 text-sm hover:bg-indigo-50/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500">
                      <span className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">{project.identifier}-{issue.sequence_id}</span>
                        <span className="wrap-anywhere font-medium group-hover:text-indigo-800">{issue.title}</span>
                      </span>
                      {state && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700">
                          <span aria-hidden="true" className="size-2 shrink-0 rounded-full border border-slate-900/15" style={{ backgroundColor: state.color }} /> {state.name}
                        </span>
                      )}
                      {due && Number.isFinite(due.getTime()) && <time dateTime={issue.due_date ?? undefined} className="text-xs text-slate-500">{calendarDate.format(due)}</time>}
                      <ArrowUpRight size={15} aria-hidden="true" className="text-slate-400 group-hover:text-indigo-700" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {issues.hasNextPage && !issues.isFetchNextPageError && (
            <div className="flex justify-center border-t border-slate-100 px-5 py-3">
              <button type="button" className={button} disabled={issues.isFetching} onClick={() => void issues.fetchNextPage()}>
                {issues.isFetchingNextPage ? "Loading…" : "Load more issues"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ListError({ message, retry, busy }: { message: string; retry: () => void; busy: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-5 py-3">
      <p role="alert" className="text-sm text-red-700">{message}</p>
      <button type="button" disabled={busy} onClick={retry} className={button}>
        <RotateCw size={15} aria-hidden="true" /> {busy ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}
