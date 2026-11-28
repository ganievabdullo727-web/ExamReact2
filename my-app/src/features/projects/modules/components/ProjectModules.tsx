"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowUpRight, Boxes, Pencil, Plus, RotateCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getProjectError } from "../../api/project.api";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import PlanningIssues from "../../planning/components/PlanningIssues";
import PlanningProgress from "../../planning/components/PlanningProgress";
import { moduleStatuses, type ModuleStatus, type ProjectModule } from "../api/module.api";
import { useCreateModule, useModuleMutations } from "../hooks/useModuleMutations";
import { useProjectModule } from "../hooks/useProjectModule";
import { useProjectModules } from "../hooks/useProjectModules";
import { toCreateModuleData, toUpdateModuleData, type ModuleFormData } from "../schemas/module.schema";
import ModuleForm from "./ModuleForm";
import {
  dangerButton, dialogStyle, fieldStyle, moduleStatusLabels, moduleStatusStyles,
  overlayStyle, primaryButton, secondaryButton,
} from "./module-styles";

type ModuleScope = { slug: string; projectId: string; canManage: boolean };

const section = "rounded-xl border border-slate-200 bg-white";
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

function listHref(slug: string, projectId: string) {
  return "/workspaces/" + encodeURIComponent(slug) + "/projects/" + encodeURIComponent(projectId) + "/modules";
}

function displayDate(value: string | null) {
  return value ? dateFormat.format(new Date(value)) : "Not set";
}

function schedule(module: ProjectModule) {
  if (!module.start_date && !module.target_date) return "No schedule";
  if (!module.start_date) return "Target " + displayDate(module.target_date);
  if (!module.target_date) return "Starts " + displayDate(module.start_date);
  return displayDate(module.start_date) + " – " + displayDate(module.target_date);
}

function StatusBadge({ status }: { status: ModuleStatus }) {
  return <span className={"rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap " + moduleStatusStyles[status]}>{moduleStatusLabels[status]}</span>;
}

function LoadError({ message, retry, fetching }: { message: string; retry: () => void; fetching: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
      <p role="alert" className="text-sm text-red-700">{message}</p>
      <button type="button" className={secondaryButton} disabled={fetching} onClick={retry}>
        <RotateCw size={15} aria-hidden="true" className={fetching ? "motion-safe:animate-spin" : undefined} />
        {fetching ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

export default function ProjectModules({ moduleId, ...scope }: ModuleScope & { moduleId?: string }) {
  return moduleId ? <ModuleDetails key={moduleId} {...scope} moduleId={moduleId} /> : <ModuleList {...scope} />;
}

function ModuleList({ slug, projectId, canManage }: ModuleScope) {
  const router = useRouter();
  const [editorOpen, setEditorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ModuleStatus | "all">("all");
  const query = useProjectModules(slug, projectId);
  const create = useCreateModule(slug, projectId);
  const base = listHref(slug, projectId);
  const term = search.trim().toLocaleLowerCase();
  const filtered = (query.data ?? []).filter((module) =>
    (status === "all" || status === module.status) && module.name.toLocaleLowerCase().includes(term));

  async function createModule(values: ModuleFormData) {
    if (!canManage) return;
    const created = await create.mutateAsync(toCreateModuleData(values));
    setEditorOpen(false);
    router.push(base + "/" + encodeURIComponent(created.id));
  }

  return (
    <section className={section} aria-labelledby="project-modules-heading">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><Boxes size={18} aria-hidden="true" /></span>
          <div>
            <h2 id="project-modules-heading" className="text-sm font-semibold">Modules</h2>
            <p className="mt-0.5 text-sm text-slate-600">Group related issues and track progress toward a shared goal.</p>
          </div>
        </div>
        {canManage && (
          <Dialog.Root open={editorOpen} onOpenChange={(next) => { if (next || !create.isPending) setEditorOpen(next); }}>
            <Dialog.Trigger asChild><button type="button" className={primaryButton}><Plus size={16} aria-hidden="true" />New module</button></Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={overlayStyle} />
              <Dialog.Content className={dialogStyle}>
                <ModuleForm slug={slug} projectId={projectId} onSave={createModule} />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </header>

      {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading modules…</p>}
      {query.isError && <LoadError message={getProjectError(query.error, "Could not load modules.")} retry={() => void query.refetch()} fetching={query.isFetching} />}
      {query.data?.length === 0 && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium">No modules yet</p>
          {canManage && <p className="mt-1 text-sm text-slate-600">Create a module to group related issues.</p>}
        </div>
      )}
      {Boolean(query.data?.length) && (
        <>
          <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 sm:px-5">
            <label className="relative min-w-0 flex-1 sm:max-w-xs">
              <span className="sr-only">Search modules</span>
              <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-slate-500" />
              <input type="search" placeholder="Search modules" className={fieldStyle + " pl-9"} value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select aria-label="Filter modules by status" className={fieldStyle + " sm:w-auto"} value={status} onChange={(event) => setStatus(event.target.value as ModuleStatus | "all")}>
              <option value="all">All statuses</option>
              {moduleStatuses.map((item) => <option key={item} value={item}>{moduleStatusLabels[item]}</option>)}
            </select>
          </div>
          {filtered.length ? (
            <ul aria-label="Project modules" className="divide-y divide-slate-100">
              {filtered.map((module) => (
                <li key={module.id}>
                  <Link href={base + "/" + encodeURIComponent(module.id)} className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md px-5 py-4 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-500">
                    <div className="min-w-48 flex-1">
                      <p className="text-sm font-semibold wrap-break-word text-slate-900">{module.name}</p>
                      {module.description && <p className="mt-1 line-clamp-1 text-xs text-slate-600">{module.description}</p>}
                    </div>
                    <span className="text-xs text-slate-600">{schedule(module)}</span>
                    <StatusBadge status={module.status} />
                    <ArrowUpRight size={16} aria-hidden="true" className="ml-auto shrink-0 text-slate-400 group-hover:text-indigo-700" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="px-5 py-8 text-center text-sm text-slate-600">No modules match these filters.</p>}
        </>
      )}
    </section>
  );
}

function ModuleDetails({ slug, projectId, canManage, moduleId }: ModuleScope & { moduleId: string }) {
  const router = useRouter();
  const base = listHref(slug, projectId);
  const query = useProjectModule(slug, projectId, moduleId);
  const members = useProjectMembers(slug, projectId);
  const mutations = useModuleMutations(slug, projectId, moduleId);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const detail = query.data;
  const busy = mutations.update.isPending || mutations.remove.isPending || mutations.addIssues.isPending || mutations.removeIssue.isPending;
  const lead = members.data?.find((member) => member.user_id === detail?.lead_id)?.user;
  const moduleLead = lead?.display_name || lead?.email || (detail?.lead_id ? "Unavailable" : "Unassigned");

  async function save(values: ModuleFormData) {
    if (!detail || !canManage) return;
    const fields = toUpdateModuleData(values, detail);
    if (Object.keys(fields).length) {
      const saved = await mutations.update.mutateAsync(fields);
      setNotice(saved.name + " was updated.");
    }
    setEditorOpen(false);
  }

  async function remove() {
    if (!detail || !canManage || busy) return;
    try {
      await mutations.remove.mutateAsync();
      setDeleteOpen(false);
      router.replace(base);
    } catch {
      // Keep the confirmation open so the backend error can be shown.
    }
  }

  return (
    <div className="space-y-4">
      <Link href={base} className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-500">
        <ArrowLeft size={16} aria-hidden="true" /> All modules
      </Link>
      {query.isPending && <p role="status" className={section + " px-5 py-6 text-sm text-slate-600"}>Loading module…</p>}
      {query.isError && <div className={section}><LoadError message={getProjectError(query.error, "Could not load this module for the project.")} retry={() => void query.refetch()} fetching={query.isFetching} /></div>}
      {detail && (
        <>
          {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">{notice}</p>}
          <section className={section} aria-labelledby="module-detail-title">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><Boxes size={19} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <h2 id="module-detail-title" className="text-base font-semibold wrap-break-word">{detail.name}</h2>
                  <div className="mt-1"><StatusBadge status={detail.status} /></div>
                </div>
              </div>
              {canManage && (
                <div className="flex flex-wrap gap-2">
                  <Dialog.Root open={editorOpen} onOpenChange={(next) => { if (next || !mutations.update.isPending) setEditorOpen(next); }}>
                    <Dialog.Trigger asChild><button type="button" disabled={busy} className={secondaryButton}><Pencil size={15} aria-hidden="true" />Edit module</button></Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className={overlayStyle} />
                      <Dialog.Content className={dialogStyle}>
                        <ModuleForm slug={slug} projectId={projectId} module={detail} onSave={save} />
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                  <AlertDialog.Root open={deleteOpen} onOpenChange={(next) => {
                    if (mutations.remove.isPending) return;
                    if (next) mutations.remove.reset();
                    setDeleteOpen(next);
                  }}>
                    <AlertDialog.Trigger asChild><button type="button" disabled={busy} className={dangerButton}><Trash2 size={15} aria-hidden="true" />Delete module</button></AlertDialog.Trigger>
                    <AlertDialog.Portal>
                      <AlertDialog.Overlay className={overlayStyle} />
                      <AlertDialog.Content className={dialogStyle}>
                        <AlertDialog.Title className="text-base font-semibold wrap-break-word">Delete {detail.name}?</AlertDialog.Title>
                        <AlertDialog.Description className="mt-2 text-sm text-slate-600">This removes the module and its issue links. The issues remain in the project.</AlertDialog.Description>
                        {mutations.remove.isError && <p role="alert" className="mt-3 text-sm text-red-700">{getProjectError(mutations.remove.error, "Could not delete the module.")}</p>}
                        <div className="mt-5 flex flex-wrap justify-end gap-2">
                          <AlertDialog.Cancel asChild><button type="button" className={secondaryButton} disabled={mutations.remove.isPending}>Cancel</button></AlertDialog.Cancel>
                          <AlertDialog.Action asChild>
                            <button type="button" className={dangerButton} disabled={mutations.remove.isPending} onClick={(event) => { event.preventDefault(); void remove(); }}>
                              {mutations.remove.isPending ? "Deleting…" : "Delete module"}
                            </button>
                          </AlertDialog.Action>
                        </div>
                      </AlertDialog.Content>
                    </AlertDialog.Portal>
                  </AlertDialog.Root>
                </div>
              )}
            </header>
            <div className="space-y-4 p-5">
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">{detail.description || "No description yet."}</p>
              <dl className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                {[
                  { label: "Module lead", value: moduleLead },
                  { label: "Start date", value: displayDate(detail.start_date) },
                  { label: "Target date", value: displayDate(detail.target_date) },
                ].map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs font-medium text-slate-600">{label}</dt>
                    <dd className="mt-1 text-sm font-medium wrap-break-word">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
          <PlanningProgress progress={detail.progress} />
          <PlanningIssues
            slug={slug}
            projectId={projectId}
            kind="module"
            containerId={detail.id}
            canManage={canManage}
            busy={busy}
            onAdd={(issueIds) => mutations.addIssues.mutateAsync(issueIds)}
            onRemove={(issueId) => mutations.removeIssue.mutateAsync(issueId)}
          />
        </>
      )}
    </div>
  );
}
