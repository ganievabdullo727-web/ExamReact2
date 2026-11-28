import WorkspaceNotifications from "@/features/notifications/components/WorkspaceNotifications";

export default async function WorkspaceNotificationsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  return <WorkspaceNotifications key={workspaceSlug} slug={workspaceSlug} />;
}
