import ProjectScreen from "@/features/projects/components/ProjectScreen";

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = await params;

  return <ProjectScreen slug={workspaceSlug} projectId={projectId} view="members" />;
}
