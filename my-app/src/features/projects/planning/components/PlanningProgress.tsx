type ProgressSummary = {
  total: number;
  backlog: number;
  unstarted: number;
  started: number;
  completed: number;
  cancelled: number;
  completion_percentage: number;
};

const groups = [
  { id: "backlog", label: "Backlog", dot: "bg-slate-400" },
  { id: "unstarted", label: "Unstarted", dot: "bg-sky-500" },
  { id: "started", label: "Started", dot: "bg-amber-500" },
  { id: "completed", label: "Completed", dot: "bg-emerald-500" },
  { id: "cancelled", label: "Cancelled", dot: "bg-rose-400" },
] as const;

const format = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

export default function PlanningProgress({ progress }: { progress: ProgressSummary }) {
  const percentage = Math.max(0, Math.min(100, progress.completion_percentage));
  const completion = `${format.format(percentage)}%`;

  return (
    <section aria-labelledby="planning-progress-heading" className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
        <h3 id="planning-progress-heading" className="text-sm font-semibold text-slate-900">Issue progress</h3>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {progress.total} {progress.total === 1 ? "issue" : "issues"}
        </span>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-700">Completion</span>
            <span className="font-semibold tabular-nums text-indigo-700">{completion}</span>
          </div>
          <div
            role="progressbar"
            aria-label="Issue completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            aria-valuetext={completion}
            className="h-2 overflow-hidden rounded-full bg-indigo-100"
          >
            <div className="h-full rounded-full bg-[#594BDB]" style={{ width: `${percentage}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-600">Completed and cancelled issues count toward completion.</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 sm:grid-cols-3 lg:grid-cols-5">
          {groups.map(({ id, label, dot }) => (
            <div key={id} className="flex items-center justify-between gap-1.5 text-xs">
              <dt className="flex items-center gap-1.5 text-slate-600">
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${dot}`} />
                {label}
              </dt>
              <dd className="font-semibold tabular-nums text-slate-900">{progress[id]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
