import { redirectWorkspacePage, type LegacySearchParams } from "@/shared/navigation/redirect-workspace-page";

export default async function Page({ params, searchParams }: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: LegacySearchParams;
}) {
  const { workspaceSlug } = await params;
  return redirectWorkspacePage(workspaceSlug, ["settings", "members"], searchParams);
}
