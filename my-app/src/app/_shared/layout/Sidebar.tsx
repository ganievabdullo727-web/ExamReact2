"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { workspace, workspaceUrl } from "../lib/demo";

export function Sidebar() {
  const pathname = usePathname();
  const base = workspaceUrl();
  const groups = [
    { title: "Workspace", links: [["◫", "Overview", base], ["▤", "Projects", base + "/projects"], ["▥", "Workspaces", "/workspaces"]] },
    { title: "People", links: [["♙", "Members", base + "/members"], ["◉", "Notifications", base + "/notifications"], ["⚙", "Settings", base + "/settings"]] },
  ];
  return <aside className="sidebar">
    <Link className="brand" href={base}><span aria-hidden="true">◈</span>taskflow</Link>
    <Link className="workspace-switch" href="/workspaces"><span className="avatar" aria-hidden="true">T</span><span><strong>{workspace.name}</strong><small>Switch workspace</small></span></Link>
    <nav aria-label="Workspace navigation">{groups.map(group => <div className="nav-group" key={group.title}>
      <h2>{group.title}</h2>
      {group.links.map(([icon, label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}
    </div>)}</nav>
  </aside>;
}
