"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  ChevronRight,
  ChevronsUpDown,
  FolderOpen,
  Layers3,
  LayoutDashboard,
  LayoutGrid,
  ListTodo,
  PanelLeft,
  Settings,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Fragment, useEffect, useState, type ReactNode } from "react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useUnreadNotificationsCount } from "@/features/notifications/hooks/useUnreadNotificationsCount";
import RecentNotifications from "@/features/notifications/components/RecentNotifications";
import { useProject } from "@/features/projects/hooks/useProject";
import type { Workspace } from "../api/workspace.api";
import { useWorkspace } from "../hooks/useWorkspace";
import { useWorkspaces } from "../hooks/useWorkspaces";

const workspacesHref = "/workspaces";
const workspaceHref = (slug: string) => `${workspacesHref}/${encodeURIComponent(slug)}`;
const menuItemClass = "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-slate-700 outline-none data-highlighted:bg-indigo-50 data-highlighted:text-indigo-800";

const workspacePages = [
  { key: "overview", label: "Overview", suffix: "", icon: LayoutDashboard },
  { key: "projects", label: "Projects", suffix: "/projects", icon: FolderOpen },
  { key: "issues", label: "Issues", suffix: "/issues", icon: ListTodo },
  { key: "my-issues", label: "My issues", suffix: "/my-issues", icon: UserRoundCheck },
  { key: "notifications", label: "Notifications", suffix: "/notifications", icon: Bell },
  { key: "members", label: "Members", suffix: "/settings/members", icon: Users },
  { key: "settings", label: "Settings", suffix: "/settings", icon: Settings },
] as const;

type SidebarProps = {
  slug?: string;
  pathname: string;
  workspaceName?: string;
  workspaces: Workspace[];
  userName?: string;
  unreadNotifications: number;
  workspaceListState: "ready" | "loading" | "error";
  onNavigate?: () => void;
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase();
}

function sidebarLinkClass(active: boolean) {
  return `flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-300 ${
    active ? "bg-indigo-400/15 text-white" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
  }`;
}

function WorkspaceSidebar({
  slug,
  pathname,
  workspaceName,
  workspaces,
  userName,
  unreadNotifications,
  workspaceListState,
  onNavigate,
}: SidebarProps) {
  const label = workspaceName ?? "Select workspace";
  return (
    <>
      <div className="px-4 pt-5">
        <Link
          href={workspacesHref}
          onNavigate={onNavigate}
          className="inline-flex items-center gap-3 rounded-lg text-base font-semibold tracking-tight text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#6759F3] text-white">
            <Layers3 size={19} strokeWidth={2.2} aria-hidden="true" />
          </span>
          TaskFlow
        </Link>

        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={`Switch workspace. ${label}`}
              className="mt-7 flex min-h-13 w-full min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.055] px-2.5 text-left text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-300 data-[state=open]:bg-white/10"
            >
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-400/20 text-xs font-semibold text-indigo-100">
                {workspaceName ? initials(workspaceName) || "W" : <Building2 size={16} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] leading-4 text-slate-400">Workspace</span>
                <span className="block truncate text-sm font-medium leading-5" title={label}>{label}</span>
              </span>
              <ChevronsUpDown size={15} aria-hidden="true" className="shrink-0 text-slate-400" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={7}
              className="z-[60] w-[max(13rem,var(--radix-dropdown-menu-trigger-width))] max-w-[calc(100vw_-_2rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-950/10"
            >
              <DropdownMenu.Label className="px-2.5 pb-1 pt-1.5 text-xs font-semibold text-slate-500">
                Your workspaces
              </DropdownMenu.Label>
              <div className="max-h-[min(17rem,35dvh)] overflow-y-auto">
                {workspaces.map((workspace) => (
                  <DropdownMenu.Item key={workspace.id} className={menuItemClass} asChild>
                    <Link href={workspaceHref(workspace.slug)} onNavigate={onNavigate}>
                      <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-md bg-indigo-50 text-[10px] font-semibold text-indigo-700">
                        {initials(workspace.name) || "W"}
                      </span>
                      <span className="min-w-0 flex-1 truncate" title={workspace.name}>{workspace.name}</span>
                      {slug === workspace.slug && <Check size={16} aria-label="Current workspace" className="shrink-0 text-indigo-700" />}
                    </Link>
                  </DropdownMenu.Item>
                ))}
                {workspaces.length === 0 && (
                  <p className="px-2.5 py-2 text-sm text-slate-600">
                    {workspaceListState === "loading" ? "Loading workspaces…" : workspaceListState === "error" ? "Could not load workspaces" : "No workspaces yet"}
                  </p>
                )}
              </div>
              <DropdownMenu.Separator className="my-1 border-t border-slate-100" />
              <DropdownMenu.Item className={menuItemClass} asChild>
                <Link href={workspacesHref} onNavigate={onNavigate}>
                  <LayoutGrid size={16} aria-hidden="true" />
                  All workspaces
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <nav aria-label="Workspace navigation" className="min-h-0 flex-1 overflow-y-auto px-3 py-6">
        <Link
          href={workspacesHref}
          onNavigate={onNavigate}
          aria-current={pathname === workspacesHref ? "page" : undefined}
          className={sidebarLinkClass(pathname === workspacesHref)}
        >
          <LayoutGrid size={17} aria-hidden="true" />
          All workspaces
        </Link>
        {slug && (
          <div className="mt-5 space-y-1 border-t border-white/10 pt-4">
            <p className="px-3 pb-1 text-xs font-medium text-slate-400">Workspace</p>
            {workspacePages.map(({ key, label, suffix, icon: Icon }) => {
              const href = `${workspaceHref(slug)}${suffix}`;
              const currentPage = pathname === href;
              const active = currentPage || ((key === "projects" || key === "issues") && pathname.startsWith(`${href}/`));
              const showUnread = key === "notifications" && unreadNotifications > 0;
              const unreadLabel = showUnread ? unreadNotifications.toLocaleString("en-US") : "";
              return (
                <Link
                  key={key}
                  href={href}
                  onNavigate={onNavigate}
                  aria-current={currentPage ? "page" : active ? "location" : undefined}
                  aria-label={showUnread ? `${label}, ${unreadLabel} unread` : undefined}
                  className={sidebarLinkClass(active)}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {showUnread ? (
                    <span
                      data-unread-notifications
                      aria-hidden="true"
                      className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-[#A99BFF] px-1.5 py-0.5 text-[11px] leading-4 font-semibold tabular-nums text-[#191C30]"
                    >
                      {unreadLabel}
                    </span>
                  ) : active ? <span aria-hidden="true" className="size-1.5 rounded-full bg-[#A99BFF]" /> : null}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link href="/profile" onNavigate={onNavigate} aria-current={pathname === "/profile" ? "page" : undefined} className={`${sidebarLinkClass(pathname === "/profile")} min-w-0 px-2.5`}>
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-[#302D50] text-xs font-semibold text-indigo-100">
            {initials(userName ?? "") || "P"}
          </span>
          <span className="min-w-0 flex-1 py-1">
            <span className="block truncate text-sm font-medium text-white" title={userName}>{userName || "Profile"}</span>
            {userName && <span className="block text-[11px] text-slate-400">My profile</span>}
          </span>
          <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-slate-400" />
        </Link>
      </div>
    </>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { workspaceSlug: slug, projectId } = useParams<{ workspaceSlug?: string; projectId?: string }>();
  const pathname = usePathname().replace(/\/$/, "");
  const profilePage = pathname === "/profile";
  const userName = useAuthStore((state) => state.user?.display_name);
  const workspaces = useWorkspaces();
  const activeWorkspace = useWorkspace(slug ?? "");
  const activeProject = useProject(slug ?? "", projectId ?? "");
  const unreadNotifications = useUnreadNotificationsCount(slug ?? "");
  const workspaceName = activeWorkspace.data?.name ?? workspaces.data?.find((workspace) => workspace.slug === slug)?.name ?? slug;
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const section = slug
    ? workspacePages.find(({ key, suffix }) => {
      const href = `${workspaceHref(slug)}${suffix}`;
      return pathname === href || (key === "issues" && pathname.startsWith(`${href}/`));
    })
    : undefined;
  const breadcrumbs = profilePage ? [{ label: "Profile", href: "/profile" }] : [{ label: "Workspaces", href: workspacesHref }];
  if (slug) {
    const workspace = workspaceHref(slug);
    breadcrumbs.push({ label: workspaceName ?? slug, href: workspace });
    if (projectId) {
      const project = `${workspace}/projects/${encodeURIComponent(projectId)}`;
      breadcrumbs.push(
        { label: "Projects", href: `${workspace}/projects` },
        { label: activeProject.data?.name ?? "Project", href: project },
      );
      const projectSections = [
        { label: "Issues", href: `${project}/issues` },
        { label: "Board", href: `${project}/board` },
        { label: "Cycles", href: `${project}/cycles` },
        { label: "Modules", href: `${project}/modules` },
      ];
      const projectSection = projectSections.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
      if (projectSection) breadcrumbs.push(projectSection);
    } else if (section && section.key !== "overview") {
      breadcrumbs.push({ label: section.label, href: `${workspace}${section.suffix}` });
    }
  }
  const sidebarProps: SidebarProps = {
    slug,
    pathname,
    workspaceName,
    workspaces: workspaces.data ?? [],
    userName,
    unreadNotifications: unreadNotifications.data ?? 0,
    workspaceListState: workspaces.isPending ? "loading" : workspaces.isError ? "error" : "ready",
  };

  return (
    <div className="flex min-h-dvh bg-[#F5F6FA] text-slate-900 [font-family:var(--font-geist-sans)]">
      <a href="#workspace-content" className="sr-only z-[70] rounded-lg bg-white px-4 py-2 font-medium text-indigo-800 focus:not-sr-only focus:fixed focus:left-4 focus:top-3">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r border-[#292C44] bg-[#191C30] md:flex xl:w-[248px]">
        <WorkspaceSidebar {...sidebarProps} />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <Dialog.Trigger asChild>
                <button type="button" aria-label="Open workspace navigation" className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden">
                  <PanelLeft size={18} aria-hidden="true" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45 md:hidden" />
                <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 left-0 z-50 flex w-[min(17rem,calc(100vw_-_2rem))] flex-col bg-[#191C30] shadow-2xl outline-none md:hidden">
                  <Dialog.Title className="sr-only">Workspace navigation</Dialog.Title>
                  <Dialog.Close asChild>
                    <button type="button" aria-label="Close workspace navigation" className="absolute right-3 top-5 grid size-9 place-items-center rounded-lg text-slate-300 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-300">
                      <X size={18} aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                  <WorkspaceSidebar {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <nav aria-label="Breadcrumb" className="min-w-0 flex-1 text-sm">
              <ol className="flex min-w-0 items-center gap-2">
                {breadcrumbs.map(({ href, label }, index) => (
                  <Fragment key={href}>
                    {index > 0 && <li aria-hidden="true" className="shrink-0"><ChevronRight size={14} className="text-slate-400" /></li>}
                    <li className="min-w-0 truncate" title={label}>
                      {index === breadcrumbs.length - 1 ? (
                        <span aria-current={href === pathname ? "page" : "location"} className="font-semibold text-slate-900">{label}</span>
                      ) : (
                        <Link href={href} className="rounded text-slate-600 outline-none hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500">{label}</Link>
                      )}
                    </li>
                  </Fragment>
                ))}
              </ol>
            </nav>

            {slug && <RecentNotifications key={slug} slug={slug} unread={sidebarProps.unreadNotifications} />}
            {!profilePage && <Link href="/profile" aria-label="My profile" title={userName || "My profile"} className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-800 outline-none hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-500">
              {initials(userName ?? "") || "P"}
            </Link>}
          </div>
        </header>

        <main id="workspace-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-7 outline-none sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
