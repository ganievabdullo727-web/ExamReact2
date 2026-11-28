import ProjectScreen from "@/features/projects/components/ProjectScreen";

export default async function ProjectCyclePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string; cycleId: string }>;
}) {
  const { workspaceSlug, projectId, cycleId } = await params;

  return <ProjectScreen slug={workspaceSlug} projectId={projectId} view="cycles" planningId={cycleId} />;
}
