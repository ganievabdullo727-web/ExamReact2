"use client";

import { isAxiosError } from "axios";
import { ArrowLeft, ArrowUpRight, ListTodo, RotateCw } from "lucide-react";
import Link from "next/link";
import { Fragment, Suspense, type ReactNode } from "react";

import IssueActivity from "@/features/activity/components/IssueActivity";
import IssueAttachments from "@/features/attachments/components/IssueAttachments";
import IssueComments from "@/features/comments/components/IssueComments";
import type { ProjectState } from "@/features/projects/states/api/state.api";
import { useProjectStates } from "@/features/projects/states/hooks/useProjectStates";
import IssueRelations from "@/features/relations/components/IssueRelations";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/useWorkspaceMembers";
import { getIssueError, issuePriorities, type Issue, type IssueGroup, type IssueGroupBy, type IssuePriority } from "../api/issue.api";
import { useIssue } from "../hooks/useIssue";
import { useGroupedIssues, useIssues } from "../hooks/useIssues";
import IssueActions from "./IssueActions";
import IssueAssignments from "./IssueAssignments";
import IssueCreateDialog from "./IssueCreateDialog";
import IssueListControls, { issuePriorityLabel, useIssueListControls } from "./IssueListControls";
import IssueSubIssues from "./IssueSubIssues";

const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const issueColumns = "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,0.8fr)_1rem]";
const priorityClasses: Record<IssuePriority, string> = {
  none: "bg-slate-100 text-slate-600",
  low: "bg-sky-50 text-sky-700",
  medium: "bg-indigo-50 text-indigo-700",
  high: "bg-amber-50 text-amber-800",
  urgent: "bg-red-50 text-red-700",
};
const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const calendarDateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

type Scope = {
  slug: string;
  projectId: string;
  projectIdentifier: string;
};

function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return (
    <span className={"inline-flex rounded-full px-2 py-0.5 text-xs font-medium " + priorityClasses[priority]}>
      {issuePriorityLabel(priority)}
    </span>
  );
}

function StateBadge({ state }: { state: ProjectState | undefined }) {
  return state ? (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700" title={state.name}>
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full border border-slate-900/15" style={{ backgroundColor: state.color }} />
      <span className="truncate">{state.name}</span>
    </span>
  ) : <span className="text-xs text-slate-500">State unavailable</span>;
}

function IssueError({ message, retry, busy }: { message: string; retry: () => void; busy: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
      <p role="alert" className="text-sm text-red-700">{message}</p>
      <button type="button" className={secondaryButton} disabled={busy} onClick={retry}>
        <RotateCw size={15} className={busy ? "motion-safe:animate-spin" : undefined} aria-hidden="true" />
        {busy ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

export default function ProjectIssues({ slug, projectId, projectIdentifier, canManage, canModerate = false, issueId }: Scope & {
  canManage: boolean;
  canModerate?: boolean;
  issueId?: string;
}) {
  const listHref = "/workspaces/" + encodeURIComponent(slug) + "/projects/" + encodeURIComponent(projectId) + "/issues";

  return issueId ? (
    <IssueDetail
      slug={slug}
      projectId={projectId}
      projectIdentifier={projectIdentifier}
      issueId={issueId}
      listHref={listHref}
      canManage={canManage}
      canModerate={canModerate}
    />
  ) : (
    <Suspense fallback={<p role="status" className="p-5 text-sm text-slate-600">Loading issues…</p>}>
      <IssueList slug={slug} projectId={projectId} projectIdentifier={projectIdentifier} canManage={canManage} listHref={listHref} />
    </Suspense>
  );
}

function IssueList({ slug, projectId, projectIdentifier, canManage, listHref }: Scope & {
  canManage: boolean;
  listHref: string;
}) {
  const controls = useIssueListControls();
  const statesQuery = useProjectStates(slug, projectId);
  const states = statesQuery.data ?? [];
  const stateById = new Map(states.map((state) => [state.id, state]));
  const grouping = controls.groupBy;
  const memberQuery = useWorkspaceMembers(grouping === "assignee" ? slug : "");
  const assignees = new Map(memberQuery.data?.map(({ user_id, user }) => [user_id, user.display_name || user.email]));
  const query = useIssues(slug, projectId, controls.filters, !grouping);
  const grouped = useGroupedIssues(slug, projectId, controls.filters, grouping);
  const activeQuery = grouping ? grouped : query;
  const pageError = !grouping && query.isFetchNextPageError;
  const issues = Array.from(new Map(
    query.data?.pages.flatMap((page) => page.data.map((issue) => [issue.id, issue] as const)),
  ).values());
  const groups = grouping ? grouped.data ?? [] : [];
  const hasRows = grouping ? Boolean(groups.length) : Boolean(issues.length);

  return (
    <section className="rounded-xl border border-slate-200 bg-white" aria-labelledby="project-issues-heading">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <ListTodo size={18} aria-hidden="true" />
          </span>
          <h2 id="project-issues-heading" className="text-sm font-semibold text-slate-900">Issues</h2>
        </div>
        {canManage && <IssueCreateDialog slug={slug} projectId={projectId} projectIdentifier={projectIdentifier} listHref={listHref} states={states} />}
      </header>

      <IssueListControls slug={slug} projectId={projectId} states={states} controls={controls} />
      {statesQuery.isError && <IssueError message={getIssueError(statesQuery.error, "Could not load project states.")} busy={statesQuery.isFetching} retry={() => void statesQuery.refetch()} />}
      {canManage && statesQuery.isSuccess && states.length === 0 && (
        <p className="border-b border-slate-100 px-5 py-3 text-sm text-slate-600">This project needs a state before you can create an issue.</p>
      )}
      {activeQuery.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading issues…</p>}
      {activeQuery.isError && (
        <IssueError
          message={getIssueError(activeQuery.error, pageError ? "Could not load more issues." : "Could not load issues.")}
          busy={activeQuery.isFetching}
          retry={() => void (pageError ? query.fetchNextPage() : activeQuery.refetch())}
        />
      )}
      {activeQuery.isSuccess && !hasRows && (
        <p className="px-5 py-10 text-center text-sm font-medium text-slate-900">{controls.hasFilters ? "No issues match these filters" : "No issues yet"}</p>
      )}
      {hasRows && (
        <>
          <div aria-hidden="true" className={"hidden gap-4 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs font-medium text-slate-600 lg:grid " + issueColumns}>
            <span>Issue</span><span>State</span><span>Priority</span><span>Assignees</span><span>Due date</span>
          </div>
          <div aria-busy={activeQuery.isFetching || controls.searching}>
            {grouping ? groups.map((group) => {
              const label = groupLabel(grouping, group, stateById, assignees);
              return (
                <div key={group.key ?? "unassigned"}>
                  <h3 className="border-y border-slate-100 bg-indigo-50/70 px-5 py-2 text-xs font-semibold text-indigo-800">{label} <span className="ml-1 font-normal">{group.issues.length}</span></h3>
                  <IssueRows issues={group.issues} label={label} listHref={listHref} projectIdentifier={projectIdentifier} states={stateById} />
                </div>
              );
            }) : <IssueRows issues={issues} label="Project issues" listHref={listHref} projectIdentifier={projectIdentifier} states={stateById} />}
          </div>
          {grouping && new Set(groups.flatMap((group) => group.issues.map((issue) => issue.id))).size >= 500 && (
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-600">This view shows up to 500 issues. Use filters to narrow the results.</p>
          )}
        </>
      )}
      {!grouping && query.hasNextPage && !pageError && (
        <div className="flex justify-center border-t border-slate-100 px-5 py-3">
          <button type="button" className={secondaryButton} disabled={query.isFetching} onClick={() => void query.fetchNextPage()}>
            {query.isFetchingNextPage ? "Loading…" : "Load more issues"}
          </button>
        </div>
      )}
    </section>
  );
}

function groupLabel(groupBy: IssueGroupBy, { key, issues }: IssueGroup, states: Map<string, ProjectState>, assignees: Map<string, string>) {
  if (groupBy === "state") return states.get(key ?? "")?.name ?? "State unavailable";
  if (groupBy === "priority") {
    const priority = issuePriorities.find((value) => value === key);
    return priority ? issuePriorityLabel(priority) : "Priority unavailable";
  }
  if (!key) return "Unassigned";
  const assignee = issues[0]?.assignees?.find(({ user_id }) => user_id === key)?.user;
  return assignee?.display_name || assignee?.email || assignees.get(key) || "Assignee unavailable";
}

function IssueRows({ issues, label, listHref, projectIdentifier, states }: {
  issues: Issue[]; label: string; listHref: string; projectIdentifier: string; states: Map<string, ProjectState>;
}) {
  return (
    <ul aria-label={label} className="divide-y divide-slate-100">
      {issues.map((issue) => {
        const assignees = issue.assignees.map(({ user }) => user.display_name || user.email).join(", ")
          || (issue.assigneesUnavailable ? "Unavailable" : "Unassigned");
        return (
          <li key={issue.id}>
            <Link href={listHref + "/" + encodeURIComponent(issue.id)} className={"group flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-indigo-50/50 focus-visible:bg-indigo-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500 lg:grid lg:gap-4 " + issueColumns}>
              <span className="flex min-w-40 flex-1 items-center gap-2.5 lg:min-w-0">
                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">{projectIdentifier}-{issue.sequence_id}</span>
                <span className="min-w-0 wrap-break-word text-sm font-medium text-slate-900 group-hover:text-indigo-800">{issue.title}</span>
              </span>
              <span className="min-w-0"><StateBadge state={states.get(issue.state_id)} /></span>
              <span><PriorityBadge priority={issue.priority} /></span>
              <span className="truncate text-xs text-slate-600" title={assignees}>{assignees}</span>
              <span className="text-xs whitespace-nowrap text-slate-600"><IssueDate value={issue.due_date} calendar /></span>
              <ArrowUpRight size={16} className="ml-auto shrink-0 text-slate-400 group-hover:text-indigo-600" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function IssueDate({ value, calendar = false }: { value: string | null | undefined; calendar?: boolean }) {
  if (!value) return <span>—</span>;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return <span>—</span>;

  return <time dateTime={value}>{(calendar ? calendarDateFormatter : dateFormatter).format(date)}</time>;
}

function IssueFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium text-slate-600">{label}</dt>
      <dd className="text-slate-900">{children}</dd>
    </div>
  );
}

function IssueDetail({ slug, projectId, projectIdentifier, issueId, listHref, canManage, canModerate }: Scope & {
  issueId: string;
  listHref: string;
  canManage: boolean;
  canModerate: boolean;
}) {
  const query = useIssue(slug, projectId, issueId);
  const status = isAxiosError(query.error) ? query.error.response?.status : undefined;
  const unavailable = status !== undefined && [401, 403, 404].includes(status);
  const issue = unavailable ? undefined : query.data;
  const stateQuery = useProjectStates(slug, projectId);
  const states = stateQuery.data ?? [];
  const state = states.find((item) => item.id === issue?.state_id);

  return (
    <div className="space-y-3">
      <Link href={listHref} className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
        <ArrowLeft size={16} aria-hidden="true" /> Back to issues
      </Link>
      <section aria-label="Issue details" className="rounded-xl border border-slate-200 bg-white">
        {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading issue…</p>}
        {query.isError && (
          <IssueError message={getIssueError(query.error, "Could not load this issue.")} busy={query.isFetching} retry={() => void query.refetch()} />
        )}
        {issue && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-indigo-700">{projectIdentifier}-{issue.sequence_id}</p>
                <h2 className="mt-1 wrap-break-word text-xl font-semibold tracking-tight text-slate-900">{issue.title}</h2>
              </div>
              {canManage && <IssueActions slug={slug} projectId={projectId} projectIdentifier={projectIdentifier} issue={issue} states={states} />}
            </header>
            <div className="grid gap-6 px-5 py-5 md:grid-cols-[minmax(0,1fr)_15rem]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Description</h3>
                {issue.description?.trim() ? (
                  <p className="mt-2 wrap-break-word whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{issue.description}</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No description.</p>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-4 border-t border-slate-200 pt-4 text-sm md:border-t-0 md:border-l md:pt-0 md:pl-5">
                <IssueFact label="State"><StateBadge state={state} /></IssueFact>
                <IssueFact label="Priority"><PriorityBadge priority={issue.priority} /></IssueFact>
                <IssueFact label="Start date"><IssueDate value={issue.start_date} calendar /></IssueFact>
                <IssueFact label="Due date"><IssueDate value={issue.due_date} calendar /></IssueFact>
                <IssueFact label="Estimate">{issue.estimate_points ?? "—"}</IssueFact>
                <IssueFact label="Sort order">{issue.sort_order}</IssueFact>
                <IssueFact label="Created"><IssueDate value={issue.created_at} /></IssueFact>
                {issue.completed_at && <IssueFact label="Completed"><IssueDate value={issue.completed_at} /></IssueFact>}
                {issue.parent_id && (
                  <IssueFact label="Parent issue">
                    <Link
                      href={`${listHref}/${encodeURIComponent(issue.parent_id)}`}
                      className="rounded-sm font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                      Open parent
                    </Link>
                  </IssueFact>
                )}
              </dl>
            </div>
            <IssueAssignments slug={slug} issue={issue} canManage={canManage} />
          </>
        )}
      </section>
      {issue && (
        <Fragment key={issue.id}>
          <IssueRelations slug={slug} projectId={projectId} projectIdentifier={projectIdentifier} issueId={issue.id} canManage={canManage} />
          <IssueSubIssues slug={slug} projectId={projectId} projectIdentifier={projectIdentifier} issue={issue} states={states} canManage={canManage} />
          <IssueAttachments
            slug={slug}
            projectId={projectId}
            issueId={issue.id}
            canUpload={canManage}
            canModerate={canModerate}
          />
          <IssueComments
            slug={slug}
            projectId={projectId}
            issueId={issue.id}
            canComment={canManage}
            canModerate={canModerate}
          />
          <IssueActivity slug={slug} projectId={projectId} issueId={issue.id} states={states} />
        </Fragment>
      )}
    </div>
  );
}
