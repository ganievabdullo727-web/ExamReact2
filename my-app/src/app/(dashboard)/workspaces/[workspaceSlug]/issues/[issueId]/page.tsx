import WorkspaceIssueRedirect from "@/features/issues/components/WorkspaceIssueRedirect";

export default async function WorkspaceIssuePage({ params, searchParams }: {
  params: Promise<{ workspaceSlug: string; issueId: string }>;
  searchParams: Promise<{ comment?: string | string[] }>;
}) {
  const [{ workspaceSlug, issueId }, { comment }] = await Promise.all([params, searchParams]);

  return <WorkspaceIssueRedirect slug={workspaceSlug} issueId={issueId} commentId={typeof comment === "string" ? comment : undefined} />;
}
