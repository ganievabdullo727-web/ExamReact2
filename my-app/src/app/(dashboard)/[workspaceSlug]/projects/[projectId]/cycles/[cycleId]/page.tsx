import { redirectWorkspacePage, type LegacySearchParams } from "@/shared/navigation/redirect-workspace-page";

export default async function Page({ params, searchParams }: {
  params: Promise<{ workspaceSlug: string; projectId: string; cycleId: string }>;
  searchParams: LegacySearchParams;
}) {
  const { workspaceSlug, projectId, cycleId } = await params;
  return redirectWorkspacePage(workspaceSlug, ["projects", projectId, "cycles", cycleId], searchParams);
}
