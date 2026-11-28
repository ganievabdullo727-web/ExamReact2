"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowLeft, RotateCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProjects } from "@/features/projects/api/project.api";
import { getIssue, getIssueError, type Issue } from "../api/issue.api";
import { issueQueryKeys } from "../hooks/issue-query-keys";

async function findWorkspaceIssue(slug: string, issueId: string, signal: AbortSignal): Promise<Issue | null> {
  const projects = await getProjects(slug, signal);
  let firstError: unknown;
  // The workspace notification has an issue ID but no project ID.
  // Use bounded detail requests and stop once the owning project is found.
  for (let index = 0; index < projects.length; index += 5) {
    signal.throwIfAborted();
    const results = await Promise.allSettled(
      projects.slice(index, index + 5).map((project) => getIssue(slug, project.id, issueId, signal)),
    );
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.id === issueId) return result.value;
      if (result.status === "rejected") {
        const status = isAxiosError(result.reason) ? result.reason.response?.status : undefined;
        if (status !== 403 && status !== 404) firstError ??= result.reason;
      }
    }
  }
  if (firstError) throw firstError;
  return null;
}

export default function WorkspaceIssueRedirect({ slug, issueId, commentId }: { slug: string; issueId: string; commentId?: string }) {
  const userId = useAuthStore((state) => state.user?.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const base = `/workspaces/${encodeURIComponent(slug)}`;
  const query = useQuery({
    queryKey: ["workspace-issue-location", userId, slug, issueId],
    queryFn: ({ signal }) => findWorkspaceIssue(slug, issueId, signal),
    enabled: Boolean(userId && slug && issueId),
    retry: false,
  });
  const issue = query.data;

  useEffect(() => {
    if (!userId || !issue) return;
    const issueHref = `${base}/projects/${encodeURIComponent(issue.project_id)}/issues/${encodeURIComponent(issue.id)}`;
    const commentHash = commentId ? `#comment-${encodeURIComponent(commentId)}` : "";
    queryClient.setQueryData(issueQueryKeys.detail(userId, slug, issue.project_id, issue.id), issue);
    router.replace(issueHref + commentHash);
  }, [base, commentId, issue, queryClient, router, slug, userId]);

  return (
    <section aria-labelledby="open-workspace-issue" className="mx-auto max-w-2xl space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-slate-900">
      <h1 id="open-workspace-issue" className="text-lg font-semibold">Open issue</h1>
      {query.isPending || issue ? <p role="status" className="text-sm text-slate-600">Opening issue…</p> : null}
      {query.isError && (
        <p role="alert" className="text-sm text-red-700">{getIssueError(query.error, "Could not open the issue. Try again.")}</p>
      )}
      {query.isSuccess && !issue && <p className="text-sm text-slate-600">This issue is no longer available in the workspace.</p>}
      {!query.isPending && !issue && (
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`${base}/notifications`} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500">
            <ArrowLeft size={15} aria-hidden="true" /> Notifications
          </Link>
          {query.isError && (
            <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50">
              <RotateCw size={15} aria-hidden="true" /> {query.isFetching ? "Retrying…" : "Try again"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
