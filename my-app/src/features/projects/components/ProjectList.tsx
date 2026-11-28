"use client";

import { ArrowUpRight, FolderKanban, RotateCw, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/useWorkspaceMembers";
import { getProjectError } from "../api/project.api";
import { useProjects } from "../hooks/useProjects";
import CreateProjectForm from "./CreateProjectForm";

const filters = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
] as const;

type Filter = (typeof filters)[number]["value"];

export default function ProjectList({ slug }: { slug: string }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const projectQuery = useProjects(slug);
  const { data: members = [] } = useWorkspaceMembers(slug);
  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");

  const projects = projectQuery.data ?? [];
  const role = members.find((member) => member.user_id === currentUserId)?.role;
  const canCreate = role === "owner" || role === "admin";
  const memberNames = new Map(
    members.map(({ user_id, user }) => [user_id, user.display_name || user.email]),
  );
  const activeCount = projects.filter((project) => !project.is_archived).length;
  const counts = {
    active: activeCount,
    archived: projects.length - activeCount,
    all: projects.length,
  };
  const searchText = search.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => {
    const statusMatches = filter === "all" || project.is_archived === (filter === "archived");
    return statusMatches && (
      !searchText ||
      project.name.toLowerCase().includes(searchText) ||
      project.identifier.toLowerCase().includes(searchText)
    );
  });

  return (
    <section className="mx-auto w-full max-w-5xl text-slate-900" aria-labelledby="projects-title">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="projects-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">Browse and manage projects in this workspace.</p>
        </div>
        {canCreate && <CreateProjectForm slug={slug} workspaceMembers={members} />}
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5">
          <div role="group" aria-label="Project status" className="flex max-w-full flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {filters.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  filter === value ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
                {projectQuery.data && <span className="text-[11px] tabular-nums text-slate-500">{counts[value]}</span>}
              </button>
            ))}
          </div>
          <label className="relative block w-full sm:w-60">
            <span className="sr-only">Search projects by name or identifier</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        {projectQuery.isPending ? (
          <div role="status" className="divide-y divide-slate-100">
            <span className="sr-only">Loading projects…</span>
            {[0, 1, 2].map((row) => (
              <div key={row} aria-hidden="true" className="flex items-center gap-3 px-5 py-4 motion-safe:animate-pulse">
                <div className="size-9 rounded-lg bg-indigo-50" />
                <div className="space-y-2">
                  <div className="h-3 w-36 rounded bg-slate-100" />
                  <div className="h-2 w-20 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : projectQuery.isError && !projectQuery.data ? (
          <div className="p-5">
            <p role="alert" className="mb-3 text-sm text-red-700">
              {getProjectError(projectQuery.error, "Could not load projects. Please try again.")}
            </p>
            <button
              type="button"
              onClick={() => void projectQuery.refetch()}
              disabled={projectQuery.isFetching}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60"
            >
              <RotateCw size={15} className={projectQuery.isFetching ? "animate-spin" : undefined} aria-hidden="true" />
              {projectQuery.isFetching ? "Retrying…" : "Retry"}
            </button>
          </div>
        ) : (
          <>
            {projectQuery.isError && (
              <p role="status" className="border-b border-slate-100 px-5 py-3 text-sm text-slate-600">
                {getProjectError(projectQuery.error, "Could not refresh the project list.")}
              </p>
            )}
            {visibleProjects.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="mb-3 grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FolderKanban size={20} aria-hidden="true" />
                </span>
                <h2 className="text-base font-semibold">
                  {searchText
                    ? "No matching projects"
                    : projects.length === 0
                      ? "No projects yet"
                      : filter === "archived"
                        ? "No archived projects"
                        : "No active projects"}
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  {searchText
                    ? "Try another name or identifier."
                    : projects.length === 0 && canCreate
                      ? "Create the first project in this workspace."
                      : projects.length === 0
                        ? "Projects will appear here once they are created."
                        : "Choose another status to see more projects."}
                </p>
              </div>
            ) : (
              <>
                <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1fr)_minmax(0,10rem)_6rem_1rem] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs font-medium text-slate-600 lg:grid">
                  <span>Project</span>
                  <span>Lead</span>
                  <span>Status</span>
                </div>
                <ul aria-label="Projects" className="divide-y divide-slate-100">
                  {visibleProjects.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={`/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(project.id)}`}
                        className="group flex items-center gap-3 px-4 py-3.5 outline-none transition-colors hover:bg-indigo-50/50 focus-visible:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_6rem_1rem] lg:gap-4"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                            <FolderKanban size={18} aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-800">{project.name}</h2>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              <span className="font-medium text-indigo-700">{project.identifier}</span>
                              {project.description && <span className="before:mx-1.5 before:content-['·']">{project.description}</span>}
                            </p>
                          </div>
                        </div>
                        <span className="hidden truncate text-sm text-slate-600 lg:block">
                          {project.lead_id ? memberNames.get(project.lead_id) || "—" : "—"}
                        </span>
                        <span
                          className={`shrink-0 self-center justify-self-start rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            project.is_archived ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {project.is_archived ? "Archived" : "Active"}
                        </span>
                        <ArrowUpRight size={16} className="hidden shrink-0 text-slate-400 group-hover:text-indigo-600 sm:block" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
