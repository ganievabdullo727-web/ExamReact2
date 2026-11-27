import Link from "next/link";
import { Brand } from "@/shared/ui/Ui";

const menu = "absolute top-full right-0 z-10 mt-2 w-56 rounded-2xl border border-line bg-white p-3 shadow-panel";

export function Topbar({ slug }: { slug: string }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/workspaces" className="flex items-center gap-3 text-lg font-bold tracking-tight text-ink"><Brand small /> TaskFlow</Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <details className="relative">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-field-line bg-field px-3 text-xs font-semibold text-copy hover:border-primary sm:text-sm [&::-webkit-details-marker]:hidden">
              <span className="hidden sm:inline">Workspace</span><span className="sm:hidden">Space</span><span aria-hidden="true">⌄</span>
            </summary>
            <div className={menu}>
              <p className="px-2 py-1 text-xs font-semibold text-muted">Workspace preview</p>
              <Link href="/w/taskflow" className="block rounded-xl px-2 py-2 text-sm font-semibold hover:bg-violet-50">TaskFlow</Link>
              <Link href="/workspaces" className="block rounded-xl px-2 py-2 text-sm font-semibold text-primary hover:bg-violet-50">All workspaces</Link>
            </div>
          </details>
          <details className="relative">
            <summary aria-label="Notifications preview" className="relative grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-line text-primary hover:bg-violet-50 [&::-webkit-details-marker]:hidden">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
              <span aria-hidden="true" className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">1</span>
            </summary>
            <div className={menu}>
              <p className="px-2 py-1 text-xs font-semibold text-muted">Sample notification</p>
              <p className="px-2 py-2 text-sm font-semibold">Workspace invitation</p>
              <Link href={`/w/${slug}/notifications`} className="block rounded-xl px-2 py-2 text-sm font-semibold text-primary hover:bg-violet-50">View notifications</Link>
            </div>
          </details>
          <span aria-label="Profile placeholder" className="grid size-10 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-violet-700">A</span>
        </div>
      </div>
    </header>
  );
}
