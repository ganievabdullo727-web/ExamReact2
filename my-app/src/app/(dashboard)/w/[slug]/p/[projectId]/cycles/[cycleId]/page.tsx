import { PlanningDetail } from "@/features/planning";
export default async function Page({ params }: PageProps<"/w/[slug]/p/[projectId]/cycles/[cycleId]">) {
  const { slug, projectId } = await params;
  const base = `/w/${encodeURIComponent(slug)}/p/${encodeURIComponent(projectId)}`;
  return <PlanningDetail base={base} kind="cycle" />;
}
