import ProjectScreen from "@/features/projects/components/ProjectScreen";

export default async function ProjectIssuePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string; issueId: string }>;
}) {
  const { workspaceSlug, projectId, issueId } = await params;

  return <ProjectScreen slug={workspaceSlug} projectId={projectId} view="issues" issueId={issueId} />;
}
