import WorkspaceIssues from "@/features/issues/components/WorkspaceIssues";

export default async function MyIssuesPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;

  return <WorkspaceIssues slug={workspaceSlug} assignedToMe />;
}
