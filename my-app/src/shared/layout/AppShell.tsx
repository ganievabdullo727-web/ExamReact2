import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children, slug = "taskflow", projectId = "web" }: { children: ReactNode; slug?: string; projectId?: string }) {
  return (
    <>
      <Topbar slug={slug} />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8">
        <aside><Sidebar slug={slug} projectId={projectId} /></aside>
        <main id="content" className="min-w-0">
          <div className="mb-5 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Design preview</div>
          {children}
        </main>
      </div>
    </>
  );
}
