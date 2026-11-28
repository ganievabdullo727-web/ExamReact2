import ProjectScreen from "@/features/projects/components/ProjectScreen";

export default async function ProjectLabelsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = await params;

  return <ProjectScreen slug={workspaceSlug} projectId={projectId} view="settings" settingsSection="labels" />;
}
