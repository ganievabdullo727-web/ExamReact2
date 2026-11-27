import { ModulesPage } from "@/features/planning";
export default async function Page({ params }: PageProps<"/w/[slug]/p/[projectId]/modules">) {
  const { slug, projectId } = await params;
  const base = `/w/${encodeURIComponent(slug)}/p/${encodeURIComponent(projectId)}`;
  return <ModulesPage base={base} />;
}
