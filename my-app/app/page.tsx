import Link from "next/link";
import { WorkspaceShell } from "./_components/workspace-shell";

const cards = [
  { href: "/projects", folder: "projects", title: "Проекты", detail: "Список проектов рабочего пространства." },
  { href: "/tasks", folder: "tasks", title: "Задачи", detail: "Список задач и их статусы." },
  { href: "/settings", folder: "settings", title: "Настройки", detail: "Параметры рабочего пространства." },
] as const;

export default function HomePage() {
  return (
    <WorkspaceShell section="/" summary="Выберите раздел. Пока это вёрстка: данные и настройки подключим позже.">
      <section aria-labelledby="sections-title">
        <h2 id="sections-title" className="mb-4 text-lg font-semibold text-white">Разделы</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ href, folder, title, detail }) => (
            <Link key={href} href={href} className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-400/40 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-cyan-300">
              <span className="mb-5 flex items-center justify-between font-mono text-xs text-cyan-200">
                {folder}
                <span aria-hidden="true" className="text-base">↗</span>
              </span>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}
