"use client";

import Link from "next/link";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main id="content" className="mx-auto mt-12 max-w-xl px-4">
      <div className="space-y-4 rounded-[24px] border border-line bg-white p-8 text-center shadow-panel">
        <h1 className="text-[30px] font-bold text-ink">Something went wrong</h1>
        <p className="text-sm text-muted">Try opening this screen again.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-button hover:bg-primary-hover">Try again</button>
          <Link href="/workspaces" className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold text-copy">Back to workspaces</Link>
        </div>
      </div>
    </main>
  );
}
