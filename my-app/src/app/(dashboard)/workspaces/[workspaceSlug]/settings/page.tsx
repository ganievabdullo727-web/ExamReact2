import WorkspaceScreen from "@/features/workspaces/components/WorkspaceScreen";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  return <WorkspaceScreen slug={workspaceSlug} view="settings" />;
}
