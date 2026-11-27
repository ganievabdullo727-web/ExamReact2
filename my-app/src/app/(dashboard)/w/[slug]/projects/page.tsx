import { ProjectsPage } from "@/features/projects";
export default async function Page({ params }: PageProps<"/w/[slug]/projects">) {
  const { slug } = await params;
  return <ProjectsPage slug={encodeURIComponent(slug)} />;
}
