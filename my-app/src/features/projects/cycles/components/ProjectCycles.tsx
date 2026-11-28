"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { isAxiosError } from "axios";
import { ArrowLeft, ArrowUpRight, CalendarRange, RotateCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getProjectError } from "../../api/project.api";
import PlanningIssues from "../../planning/components/PlanningIssues";
import PlanningProgress from "../../planning/components/PlanningProgress";
import type { CycleStatus, ProjectCycleDetails, UpdateCycleData } from "../api/cycle.api";
import { useAddCycleIssues } from "../hooks/useAddCycleIssues";
import { useCreateProjectCycle } from "../hooks/useCreateProjectCycle";
import { useDeleteProjectCycle } from "../hooks/useDeleteProjectCycle";
import { useProjectCycle } from "../hooks/useProjectCycle";
import { useProjectCycles } from "../hooks/useProjectCycles";
import { useRemoveCycleIssue } from "../hooks/useRemoveCycleIssue";
import { useUpdateProjectCycle } from "../hooks/useUpdateProjectCycle";
import type { CycleFormData } from "../schemas/cycle.schema";
import CycleEditor, { cycleFormValues } from "./CycleEditor";
import { formatCycleDate, formatCycleRange, toCycleDate } from "./cycle-dates";

const panel = "overflow-hidden rounded-xl border border-slate-200 bg-white";
const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const danger = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-50";
const statusStyle: Record<CycleStatus, string> = {
  active: "bg-indigo-50 text-indigo-700",
  upcoming: "bg-sky-50 text-sky-800",
  completed: "bg-emerald-50 text-emerald-800",
};

type CycleScope = { slug: string; projectId: string; canManage: boolean };

const listHref = (slug: string, projectId: string) =>
  `/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/cycles`;

function CycleBadge({ status }: { status: CycleStatus }) {
  return <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-medium capitalize ${statusStyle[status]}`}>{status}</span>;
}

function LoadError({ error, fallback, fetching, retry }: {
  error: unknown;
  fallback: string;
  fetching: boolean;
  retry: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
      <p role="alert" className="text-sm text-red-700">{getProjectError(error, fallback)}</p>
      <button type="button" className={button} disabled={fetching} onClick={retry}>
        <RotateCw size={15} aria-hidden="true" className={fetching ? "motion-safe:animate-spin" : undefined} />
        {fetching ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

function CyclesList({ slug, projectId, canManage }: CycleScope) {
  const query = useProjectCycles(slug, projectId);
  const create = useCreateProjectCycle(slug, projectId);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | CycleStatus>("all");
  const href = listHref(slug, projectId);
  const term = search.trim().toLowerCase();
  const visible = query.data?.filter((cycle) => (
    (status === "all" || cycle.status === status)
    && (!term || `${cycle.name} ${cycle.description ?? ""}`.toLowerCase().includes(term))
  )) ?? [];

  async function createCycle(values: CycleFormData) {
    if (!canManage) return;
    const created = await create.mutateAsync({
      name: values.name,
      description: values.description || undefined,
      start_date: toCycleDate(values.start_date, "start"),
      end_date: toCycleDate(values.end_date, "end"),
    });
    router.push(`${href}/${encodeURIComponent(created.id)}`);
  }

  return (
    <section aria-labelledby="cycle-list-heading" className={panel}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><CalendarRange size={18} aria-hidden="true" /></span>
          <div>
            <h2 id="cycle-list-heading" className="text-sm font-semibold">Cycles</h2>
            <p className="mt-0.5 text-sm text-slate-600">Plan work in scheduled iterations.</p>
          </div>
        </div>
        {canManage && <CycleEditor onSave={createCycle} busy={create.isPending} />}
      </header>

      {query.isError && <LoadError error={query.error} fallback="Could not load cycles." fetching={query.isFetching} retry={() => void query.refetch()} />}
      {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading cycles…</p>}
      {query.data && query.data.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
          <label className="flex min-h-10 max-w-md flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-500 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search cycles</span>
            <input type="search" className="min-w-0 flex-1 text-slate-900 outline-none" placeholder="Search cycles…" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label>
            <span className="sr-only">Filter cycles by status</span>
            <select className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" value={status} onChange={(event) => setStatus(event.target.value as "all" | CycleStatus)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
      )}

      {query.data && (visible.length ? (
        <ul aria-label="Project cycles" className="divide-y divide-slate-100">
          {visible.map((cycle) => (
            <li key={cycle.id}>
              <Link href={`${href}/${encodeURIComponent(cycle.id)}`} className="group flex flex-wrap items-center gap-3 px-5 py-3.5 outline-none hover:bg-slate-50 focus-visible:bg-indigo-50">
                <div className="min-w-0 flex-1">
                  <p className="wrap-break-word text-sm font-semibold">{cycle.name}</p>
                  <p className="mt-1 text-xs text-slate-600">{formatCycleRange(cycle.start_date, cycle.end_date)}</p>
                </div>
                <CycleBadge status={cycle.status} />
                <ArrowUpRight size={16} className="shrink-0 text-slate-400 group-hover:text-indigo-700" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600"><CalendarRange size={19} aria-hidden="true" /></span>
          <p className="text-sm font-medium">{query.data.length === 0 ? "No cycles yet" : "No cycles match these filters"}</p>
          {query.data.length === 0 && canManage && <p className="text-sm text-slate-600">Create a cycle to plan your next iteration.</p>}
        </div>
      ))}
    </section>
  );
}

function CycleDetails({ slug, projectId, canManage, cycle }: CycleScope & { cycle: ProjectCycleDetails }) {
  const router = useRouter();
  const update = useUpdateProjectCycle(slug, projectId, cycle.id);
  const remove = useDeleteProjectCycle(slug, projectId, cycle.id);
  const addIssues = useAddCycleIssues(slug, projectId, cycle.id);
  const removeIssue = useRemoveCycleIssue(slug, projectId, cycle.id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const busy = update.isPending || remove.isPending || addIssues.isPending || removeIssue.isPending;
  const href = listHref(slug, projectId);

  async function saveCycle(values: CycleFormData) {
    if (!canManage || busy) return;
    const original = cycleFormValues(cycle);
    const changes: UpdateCycleData = {};
    if (values.name !== original.name) changes.name = values.name;
    if (values.description !== original.description.trim()) changes.description = values.description || null;
    if (values.start_date !== original.start_date) changes.start_date = toCycleDate(values.start_date, "start");
    if (values.end_date !== original.end_date) changes.end_date = toCycleDate(values.end_date, "end");
    if (!Object.keys(changes).length) return;
    await update.mutateAsync(changes);
    setNotice("Cycle updated.");
  }

  async function confirmDelete() {
    if (!canManage || busy) return;
    try {
      await remove.mutateAsync();
      setDeleteOpen(false);
      router.replace(href);
    } catch {
      // Keep the confirmation open and display the server error.
    }
  }

  return (
    <div className="space-y-4">
      <Link href={href} className="inline-flex items-center gap-2 rounded text-sm font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to cycles
      </Link>
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">{notice}</p>}
      <section aria-labelledby="cycle-details-heading" className={panel}>
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><CalendarRange size={18} aria-hidden="true" /></span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="cycle-details-heading" className="wrap-break-word text-base font-semibold">{cycle.name}</h2>
                <CycleBadge status={cycle.status} />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">Cycle details</p>
            </div>
          </div>
          {canManage && (
            <div className="flex flex-wrap gap-2">
              <CycleEditor cycle={cycle} onSave={saveCycle} busy={busy} />
              <AlertDialog.Root open={deleteOpen} onOpenChange={(open) => {
                if (!remove.isPending) {
                  if (open) remove.reset();
                  setDeleteOpen(open);
                }
              }}>
                <AlertDialog.Trigger asChild>
                  <button type="button" className={danger} disabled={busy}><Trash2 size={16} aria-hidden="true" /> Delete cycle</button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
                  <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
                    <AlertDialog.Title className="wrap-break-word text-base font-semibold">Delete {cycle.name}?</AlertDialog.Title>
                    <AlertDialog.Description className="mt-1.5 text-sm text-slate-600">
                      Issues in this cycle will stay in the project and be unassigned from the cycle.
                    </AlertDialog.Description>
                    {remove.isError && <p role="alert" className="mt-3 text-sm text-red-700">{getProjectError(remove.error, "Could not delete this cycle.")}</p>}
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      <AlertDialog.Cancel asChild><button type="button" className={button} disabled={remove.isPending}>Cancel</button></AlertDialog.Cancel>
                      <AlertDialog.Action asChild>
                        <button type="button" className="min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-50" disabled={busy} onClick={(event) => {
                          event.preventDefault();
                          void confirmDelete();
                        }}>{remove.isPending ? "Deleting…" : "Delete cycle"}</button>
                      </AlertDialog.Action>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            </div>
          )}
        </header>
        <div className="space-y-4 px-5 py-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs font-medium text-slate-600">Start date</dt><dd className="mt-1 text-sm">{formatCycleDate(cycle.start_date)}</dd></div>
            <div><dt className="text-xs font-medium text-slate-600">End date</dt><dd className="mt-1 text-sm">{formatCycleDate(cycle.end_date)}</dd></div>
          </dl>
          {cycle.description && <p className="border-t border-slate-100 pt-4 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">{cycle.description}</p>}
        </div>
      </section>
      <PlanningProgress progress={cycle.progress} />
      <PlanningIssues
        slug={slug}
        projectId={projectId}
        kind="cycle"
        containerId={cycle.id}
        canManage={canManage}
        busy={busy}
        onAdd={addIssues.mutateAsync}
        onRemove={removeIssue.mutateAsync}
      />
    </div>
  );
}

function CycleDetailsRoute({ slug, projectId, canManage, cycleId }: CycleScope & { cycleId: string }) {
  const query = useProjectCycle(slug, projectId, cycleId);
  const href = listHref(slug, projectId);
  const unavailable = isAxiosError(query.error)
    && [401, 403, 404].includes(query.error.response?.status ?? 0);
  if (query.data && query.data.project_id !== projectId) {
    return (
      <div className={panel}>
        <p role="alert" className="px-5 py-4 text-sm text-slate-700">Cycle not found in this project.</p>
        <Link href={href} className="mx-5 mb-4 inline-block text-sm font-medium text-indigo-700 hover:underline">Back to cycles</Link>
      </div>
    );
  }

  if (!query.data || unavailable) {
    return (
      <div className={panel}>
        {query.isError
          ? <LoadError error={query.error} fallback="Could not load this cycle." fetching={query.isFetching} retry={() => void query.refetch()} />
          : <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading cycle…</p>}
        <Link href={href} className="mx-5 mb-4 inline-block text-sm font-medium text-indigo-700 hover:underline">Back to cycles</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {query.isError && <div className={panel}><LoadError error={query.error} fallback="Could not refresh this cycle." fetching={query.isFetching} retry={() => void query.refetch()} /></div>}
      <CycleDetails key={query.data.id} slug={slug} projectId={projectId} canManage={canManage} cycle={query.data} />
    </div>
  );
}

export default function ProjectCycles({ slug, projectId, canManage, cycleId }: CycleScope & { cycleId?: string }) {
  return cycleId
    ? <CycleDetailsRoute slug={slug} projectId={projectId} canManage={canManage} cycleId={cycleId} />
    : <CyclesList slug={slug} projectId={projectId} canManage={canManage} />;
}

