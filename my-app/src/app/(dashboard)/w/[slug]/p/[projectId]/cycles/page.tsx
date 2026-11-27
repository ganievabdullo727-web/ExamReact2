import { CyclesPage } from "@/features/planning";
export default async function Page({ params }: PageProps<"/w/[slug]/p/[projectId]/cycles">) {
  const { slug, projectId } = await params;
  const base = `/w/${encodeURIComponent(slug)}/p/${encodeURIComponent(projectId)}`;
  return <CyclesPage base={base} />;
}
