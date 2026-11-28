"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpRight, Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { notificationIssueHref, type NotificationType } from "../api/notification.api";
import { useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { useNotifications } from "../hooks/useNotifications";

const descriptions: Record<NotificationType, string> = {
  issue_assigned: "assigned you to an issue",
  comment_added: "commented on an issue",
  mentioned: "mentioned you",
};
const itemClass = "flex items-start gap-2 rounded-md px-3 py-2 text-sm text-slate-700 outline-none data-highlighted:bg-indigo-50 data-highlighted:text-indigo-800";

export default function RecentNotifications({ slug, unread }: { slug: string; unread: number }) {
  const [open, setOpen] = useState(false);
  const fullPath = `/workspaces/${encodeURIComponent(slug)}/notifications`;
  const query = useNotifications(open ? slug : "");
  const markRead = useMarkNotificationRead(slug);
  const entries = query.data?.pages[0]?.data.slice(0, 5) ?? [];

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button type="button" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} className="relative grid size-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500">
          <Bell size={18} aria-hidden="true" />
          {unread > 0 && <span aria-hidden="true" className="absolute top-1 right-1 grid min-w-3.5 place-items-center rounded-full bg-indigo-700 px-0.5 text-[9px] leading-3.5 font-semibold text-white">{unread > 9 ? "9+" : unread}</span>}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-40 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <DropdownMenu.Label className="px-3 py-2 text-sm font-semibold text-slate-900">Recent notifications</DropdownMenu.Label>
          {query.isPending && <p role="status" className="px-3 py-2 text-sm text-slate-600">Loading notifications…</p>}
          {query.isError && (
            <DropdownMenu.Item className={itemClass} onSelect={(event) => { event.preventDefault(); void query.refetch(); }}>
              Could not load notifications. Try again
            </DropdownMenu.Item>
          )}
          {query.isSuccess && !entries.length && <p className="px-3 py-2 text-sm text-slate-600">No notifications yet.</p>}
          {entries.map((entry) => (
            <DropdownMenu.Item key={entry.id} asChild className={itemClass} onSelect={() => { if (!entry.is_read) markRead.mutate(entry.id); }}>
              <Link href={notificationIssueHref(slug, entry) ?? fullPath} prefetch={false}>
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${entry.is_read ? "bg-slate-200" : "bg-indigo-600"}`} aria-hidden="true" />
                <span className="wrap-anywhere"><strong className="font-semibold text-slate-900">{entry.actor?.display_name || "A workspace member"}</strong> {descriptions[entry.type]}.</span>
              </Link>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
          <DropdownMenu.Item asChild className={`${itemClass} items-center justify-between font-medium text-indigo-700`}>
            <Link href={fullPath}>View all notifications <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
