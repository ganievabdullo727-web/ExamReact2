import ProjectScreen from "@/features/projects/components/ProjectScreen";

export default async function ProjectModulePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string; moduleId: string }>;
}) {
  const { workspaceSlug, projectId, moduleId } = await params;

  return <ProjectScreen slug={workspaceSlug} projectId={projectId} view="modules" planningId={moduleId} />;
}
