import { ProjectStatesPage } from "@/features/projects";
export default async function Page({ params }: PageProps<"/w/[slug]/p/[projectId]/settings/states">) {
  const { slug, projectId } = await params;
  const base = `/w/${encodeURIComponent(slug)}/p/${encodeURIComponent(projectId)}`;
  return <ProjectStatesPage base={base} />;
}
