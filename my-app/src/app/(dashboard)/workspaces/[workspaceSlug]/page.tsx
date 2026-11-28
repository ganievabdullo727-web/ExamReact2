import WorkspaceScreen from "@/features/workspaces/components/WorkspaceScreen";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  return <WorkspaceScreen slug={workspaceSlug} view="overview" />;
}
