"use client";

import { ArrowUpRight, LayoutGrid, RotateCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getWorkspaceError } from "../api/workspace.api";
import { useWorkspaces } from "../hooks/useWorkspaces";
import WorkspaceCreateForm from "./WorkspaceCreateForm";

const workspacePath = (slug: string) => `/workspaces/${encodeURIComponent(slug)}`;
const cardStyle = "rounded-xl border border-[#E2E5EE] bg-white";

const WorkspaceList = () => {
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: workspaces = [], error, isError, isPending, isFetching, refetch } = useWorkspaces();

  return (
    <section aria-labelledby="workspaces-title" className="mx-auto w-full max-w-5xl text-slate-900">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="workspaces-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Workspaces
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            Open a workspace to manage its members and settings.
          </p>
        </div>
        <WorkspaceCreateForm onCreated={(workspace) => router.push(workspacePath(workspace.slug))} />
      </header>

          {isPending ? (
            <div role="status" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <span className="sr-only">Loading workspaces…</span>
              {[0, 1, 2].map((item) => (
                <div key={item} aria-hidden="true" className={`${cardStyle} min-h-34 p-5 motion-safe:animate-pulse`}>
                  <div className="mb-4 size-9 rounded-lg bg-indigo-50" />
                  <div className="h-4 w-28 rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : isError && workspaces.length === 0 ? (
            <div className={`${cardStyle} p-5`}>
              <p role="alert" className="mb-3 text-sm text-red-700">
                {getWorkspaceError(error, "Could not load workspaces. Please try again.")}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60"
              >
                <RotateCw size={15} className={isFetching ? "animate-spin" : undefined} aria-hidden="true" />
                {isFetching ? "Retrying…" : "Retry"}
              </button>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <span className="mb-4 grid size-11 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <LayoutGrid size={23} aria-hidden="true" />
              </span>
              <h2 className="text-base font-semibold">No workspaces yet</h2>
              <p className="mt-1.5 text-sm text-slate-600">Create a workspace to get started.</p>
            </div>
          ) : (
            <>
              {isError && (
                <p role="status" className="mb-4 text-sm text-slate-600">
                  {getWorkspaceError(error, "Could not refresh the workspace list.")}
                </p>
              )}
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {workspaces.map((workspace) => (
                  <li key={workspace.id} className="min-w-0">
                    <Link
                      href={workspacePath(workspace.slug)}
                      className={`group flex h-full min-h-34 flex-col justify-between gap-4 p-5 transition-colors hover:border-indigo-300 hover:bg-indigo-50/25 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-indigo-500 ${cardStyle}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-700">
                          {Array.from(workspace.name.trim())[0]?.toUpperCase() || "W"}
                        </span>
                        <ArrowUpRight size={17} className="shrink-0 text-slate-400 group-hover:text-indigo-600" aria-hidden="true" />
                      </div>
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="break-words text-sm font-semibold text-slate-900">{workspace.name}</h2>
                          <p className="mt-1 break-all text-xs text-slate-600">/{workspace.slug}</p>
                        </div>
                        {workspace.owner_id === currentUserId && (
                          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            Owner
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
    </section>
  );
};

export default WorkspaceList;
