import { Action, Brand } from "@/shared/ui/Ui";

export default function HomePage() {
  return (
    <main id="content" className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="w-full max-w-[440px] space-y-6 rounded-[24px] border border-line bg-white px-8 py-10 text-center shadow-panel sm:px-10">
        <div className="mb-5"><Brand /></div>
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-ink">Welcome to TaskFlow</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Preview workspaces, projects, planning, and notifications.</p>
        </div>
        <div className="grid gap-3"><Action href="/workspaces">Open workspaces</Action><Action href="/w/taskflow" quiet>Explore the demo</Action></div>
        <p className="font-mono text-xs text-muted">app · design preview</p>
      </section>
    </main>
  );
}
