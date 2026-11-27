export default function Loading() {
  return (
    <main id="content" className="mx-auto max-w-4xl p-4 sm:p-8">
      <section className="rounded-[24px] border border-line bg-white p-7 shadow-panel" aria-busy="true" aria-label="Loading workspace">
        <p role="status" className="text-sm font-semibold text-muted">Loading workspace…</p>
        <div aria-hidden="true" className="mt-5 space-y-3 motion-safe:animate-pulse"><div className="h-8 w-2/5 rounded-lg bg-violet-100" /><div className="h-14 rounded-xl bg-canvas" /><div className="h-14 rounded-xl bg-canvas" /></div>
      </section>
    </main>
  );
}
