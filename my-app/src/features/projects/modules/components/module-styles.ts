import type { ModuleStatus } from "../api/module.api";

export const fieldStyle = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50";
export const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
export const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
export const dangerButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50";
export const overlayStyle = "fixed inset-0 z-40 bg-slate-950/45";
export const dialogStyle = "fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl";

export const moduleStatusLabels = {
  backlog: "Backlog",
  in_progress: "In progress",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
} satisfies Record<ModuleStatus, string>;

export const moduleStatusStyles = {
  backlog: "bg-slate-100 text-slate-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  paused: "bg-amber-50 text-amber-800",
  completed: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-rose-50 text-rose-800",
} satisfies Record<ModuleStatus, string>;
