import ProjectList from "@/features/projects/components/ProjectList";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  return <ProjectList slug={workspaceSlug} />;
}
