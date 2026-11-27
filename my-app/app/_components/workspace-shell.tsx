import Link from "next/link";
import type { ReactNode } from "react";

const sections = [
  { href: "/", label: "Обзор", folder: "app", index: "01" },
  { href: "/projects", label: "Проекты", folder: "projects", index: "02" },
  { href: "/tasks", label: "Задачи", folder: "tasks", index: "03" },
  { href: "/settings", label: "Настройки", folder: "settings", index: "04" },
] as const;

type Section = (typeof sections)[number]["href"];

export function WorkspaceShell({
  section,
  summary,
  children,
}: {
  section: Section;
  summary: string;
  children: ReactNode;
}) {
  const active = sections.find((item) => item.href === section)!;

  return (
    <div className="mx-auto grid min-h-screen max-w-[92rem] md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="border-b border-slate-800 px-5 py-6 md:border-r md:border-b-0 md:px-4 md:py-8 lg:px-6">
        <Link href="/" className="inline-flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-cyan-300">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-cyan-300 text-sm font-black text-slate-950">A</span>
          <span>
            <span className="block text-sm font-semibold text-white">ExamReact2</span>
            <span className="block text-xs text-slate-400">Рабочее пространство</span>
          </span>
        </Link>
        <nav aria-label="Разделы" className="mt-6 flex flex-wrap gap-2 md:mt-10 md:grid">
          {sections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === section ? "page" : undefined}
              className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800/70 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300 aria-[current=page]:border-cyan-400/25 aria-[current=page]:bg-cyan-300/10 aria-[current=page]:text-cyan-200"
            >
              <span aria-hidden="true" className="font-mono text-[0.65rem] opacity-70">{item.index}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main id="content" className="min-w-0 px-5 py-8 sm:px-9 lg:px-14 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <header className="mb-7 rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-cyan-950/50 p-6 sm:mb-9 sm:p-9">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-cyan-400/25 bg-cyan-300/10 px-3 py-1 font-mono text-xs text-cyan-200">{active.folder}</span>
              <span className="text-xs text-slate-400">Макет · без API</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">{active.label}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">{summary}</p>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}

export function EmptyPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-8 sm:p-10">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{children}</p>
    </section>
  );
}
