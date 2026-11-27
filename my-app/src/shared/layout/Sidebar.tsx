"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({ slug, projectId }: { slug: string; projectId: string }) {
  const path = usePathname();
  const workspace = `/w/${slug}`;
  const project = `${workspace}/p/${projectId}`;
  const groups = [
    { title: "Workspace", links: [{ title: "Overview", href: workspace }, { title: "Projects", href: `${workspace}/projects` }, { title: "Members", href: `${workspace}/members` }, { title: "Notifications", href: `${workspace}/notifications` }, { title: "Settings", href: `${workspace}/settings` }] },
    { title: "Project", links: [{ title: "Overview", href: project }, { title: "Cycles", href: `${project}/cycles` }, { title: "Modules", href: `${project}/modules` }, { title: "Settings", href: `${project}/settings` }] },
  ];
  return (
    <nav aria-label="Dashboard navigation" className="space-y-4 rounded-[24px] border border-line bg-white p-4 shadow-panel md:sticky md:top-5">
      {groups.map(({ title, links }) => (
        <div key={title}>
          <p className="px-2.5 text-xs font-semibold text-muted">{title}</p>
          <div className="mt-2 flex flex-wrap gap-1 md:grid">
            {links.map(({ href, title: label }) => {
              const current = path === href;
              return (
                <Link key={href} href={href} aria-current={current ? "page" : undefined} className={`rounded-xl px-2.5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-primary ${current ? "bg-violet-50 text-violet-800" : "text-copy hover:bg-field hover:text-primary"}`}>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
