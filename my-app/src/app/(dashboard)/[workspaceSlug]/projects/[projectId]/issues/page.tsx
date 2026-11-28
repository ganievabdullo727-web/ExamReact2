import { redirectWorkspacePage, type LegacySearchParams } from "@/shared/navigation/redirect-workspace-page";

export default async function Page({ params, searchParams }: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
  searchParams: LegacySearchParams;
}) {
  const { workspaceSlug, projectId } = await params;
  return redirectWorkspacePage(workspaceSlug, ["projects", projectId, "issues"], searchParams);
}
