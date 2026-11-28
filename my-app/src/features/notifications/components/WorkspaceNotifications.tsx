"use client";

import { ArrowUpRight, AtSign, Bell, Check, CheckCheck, MessageSquare, RotateCw, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { getNotificationError, notificationIssueHref, type Notification, type NotificationFilter, type NotificationType } from "../api/notification.api";
import { useMarkAllNotificationsRead } from "../hooks/useMarkAllNotificationsRead";
import { useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { useNotifications } from "../hooks/useNotifications";
import { useUnreadNotificationsCount } from "../hooks/useUnreadNotificationsCount";

const filters = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
] as const;

const activity = {
  issue_assigned: { text: "assigned you to an issue", icon: UserRoundCheck, color: "bg-indigo-50 text-indigo-700" },
  comment_added: { text: "commented on an issue", icon: MessageSquare, color: "bg-sky-50 text-sky-700" },
  mentioned: { text: "mentioned you", icon: AtSign, color: "bg-violet-50 text-violet-700" },
} satisfies Record<NotificationType, { text: string; icon: typeof Bell; color: string }>;

const emptyStates = {
  all: { title: "No notifications yet", text: "Assignments, comments, and mentions will appear here." },
  unread: { title: "You’re all caught up", text: "New unread notifications will appear here." },
  read: { title: "No read notifications", text: "Notifications you mark as read will appear here." },
} satisfies Record<NotificationFilter, { title: string; text: string }>;

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
const countFormat = new Intl.NumberFormat("en-US");
const buttonStyle = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

export default function WorkspaceNotifications({ slug }: { slug: string }) {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [notice, setNotice] = useState("");
  const notifications = useNotifications(slug, filter);
  const unreadQuery = useUnreadNotificationsCount(slug);
  const markRead = useMarkNotificationRead(slug);
  const markAllRead = useMarkAllNotificationsRead(slug);

  const entries = notifications.data?.pages.flatMap((page) => page.data) ?? [];
  const unreadCount = unreadQuery.data ?? notifications.data?.pages[0]?.unread_count;
  const busy = markRead.isPending || markAllRead.isPending;
  const mutationError = markRead.error ?? markAllRead.error;
  const initialError = notifications.isError && !notifications.data;
  const empty = emptyStates[filter];

  function markOne(id: string) {
    if (busy) return;
    setNotice("");
    markAllRead.reset();
    markRead.mutate(id, {
      onSuccess: () => setNotice("Notification marked as read."),
    });
  }

  function markAll() {
    if (busy || !unreadCount) return;
    setNotice("");
    markRead.reset();
    markAllRead.mutate(undefined, {
      onSuccess: ({ updated }) => setNotice(updated === 1
        ? "1 notification marked as read."
        : `${countFormat.format(updated)} notifications marked as read.`),
    });
  }

  return (
    <section aria-labelledby="notifications-title" className="mx-auto w-full max-w-5xl text-slate-900">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="notifications-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">Keep up with activity involving you in this workspace.</p>
        </div>
        <button type="button" onClick={markAll} disabled={busy || !unreadCount} className={buttonStyle}>
          <CheckCheck size={16} aria-hidden="true" className="text-indigo-700" />
          {markAllRead.isPending ? "Marking as read…" : "Mark all as read"}
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5">
          <div role="group" aria-label="Filter notifications" className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {filters.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                data-notification-filter={value}
                aria-pressed={filter === value}
                onClick={() => { setFilter(value); setNotice(""); }}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  filter === value ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span aria-live="polite" className="text-sm tabular-nums text-slate-600">
            {unreadCount !== undefined && `${countFormat.format(unreadCount)} unread`}
          </span>
        </div>

        {notice && (
          <p role="status" className="border-b border-emerald-100 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">{notice}</p>
        )}
        {mutationError && (
          <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {getNotificationError(mutationError, "Could not mark notifications as read. Please try again.")}
          </p>
        )}

        {notifications.isPending ? (
          <div role="status" className="divide-y divide-slate-100">
            <span className="sr-only">Loading notifications…</span>
            {[0, 1, 2].map((row) => (
              <div key={row} aria-hidden="true" className="flex items-center gap-3 px-5 py-4 motion-safe:animate-pulse">
                <div className="size-9 rounded-lg bg-indigo-50" />
                <div className="space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-100" />
                  <div className="h-2 w-24 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : initialError ? (
          <div className="p-5">
            <p role="alert" className="mb-3 text-sm text-red-700">
              {getNotificationError(notifications.error, "Could not load notifications. Please try again.")}
            </p>
            <button type="button" onClick={() => void notifications.refetch()} disabled={notifications.isFetching} className={buttonStyle}>
              <RotateCw size={15} aria-hidden="true" />
              {notifications.isFetching ? "Retrying…" : "Retry"}
            </button>
          </div>
        ) : (
          <>
            {notifications.isRefetchError && (
              <p role="alert" className="border-b border-slate-100 px-5 py-3 text-sm text-slate-600">
                {getNotificationError(notifications.error, "Could not refresh notifications.")}
              </p>
            )}
            {entries.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="mb-3 grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                  <Bell size={20} aria-hidden="true" />
                </span>
                <h2 className="text-base font-semibold">{empty.title}</h2>
                <p className="mt-1.5 text-sm text-slate-600">{empty.text}</p>
              </div>
            ) : (
              <ul aria-label="Workspace notifications" className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <NotificationRow
                    key={entry.id}
                    slug={slug}
                    notification={entry}
                    disabled={busy}
                    marking={markRead.isPending && markRead.variables === entry.id}
                    onMarkRead={() => markOne(entry.id)}
                  />
                ))}
              </ul>
            )}
            {notifications.hasNextPage && (
              <div className="flex flex-col items-center gap-2 border-t border-slate-200 px-5 py-4">
                {notifications.isFetchNextPageError && (
                  <p role="alert" className="text-sm text-red-700">
                    {getNotificationError(notifications.error, "Could not load more notifications.")}
                  </p>
                )}
                <button
                  type="button"
                  disabled={notifications.isFetching}
                  onClick={() => void notifications.fetchNextPage()}
                  className={buttonStyle}
                >
                  {notifications.isFetchingNextPage ? "Loading more…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function NotificationRow({ slug, notification, disabled, marking, onMarkRead }: {
  slug: string;
  notification: Notification;
  disabled: boolean;
  marking: boolean;
  onMarkRead: () => void;
}) {
  const actorName = notification.actor?.display_name?.trim() || "A workspace member";
  const { text, icon: Icon, color } = activity[notification.type];
  const createdAt = new Date(notification.created_at);
  const commentId = notification.type !== "issue_assigned" ? notification.entity_id : null;
  const issueHref = notificationIssueHref(slug, notification);

  return (
    <li
      data-notification-id={notification.id}
      className={`flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5 ${notification.is_read ? "bg-white" : "bg-indigo-50/40"}`}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${color}`}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <div className="min-w-36 flex-1">
        <p className="break-words text-sm text-slate-700"><strong className="font-semibold text-slate-900">{actorName}</strong> {text}.</p>
        {Number.isFinite(createdAt.getTime()) && (
          <time dateTime={notification.created_at} className="mt-1 block text-xs text-slate-500">{dateFormat.format(createdAt)}</time>
        )}
      </div>
      {issueHref && (
        <Link
          href={issueHref}
          prefetch={false}
          onNavigate={() => { if (!notification.is_read && !disabled) onMarkRead(); }}
          className={`${buttonStyle} shrink-0 text-xs`}
        >
          {commentId ? "Open comment" : "Open issue"} <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      )}
      {notification.is_read ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          <Check size={13} aria-hidden="true" /> Read
        </span>
      ) : (
        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
            <span className="size-1.5 rounded-full bg-indigo-600" aria-hidden="true" /> Unread
          </span>
          <button
            type="button"
            aria-label={`Mark as read: ${actorName} ${text}`}
            disabled={disabled}
            onClick={onMarkRead}
            className={`${buttonStyle} text-xs`}
          >
            {marking ? "Marking…" : "Mark as read"}
          </button>
        </div>
      )}
    </li>
  );
}
