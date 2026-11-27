import { notFound } from "next/navigation";
import { projects, projectUrl } from "@/app/_shared/lib/demo";
import { ButtonLink, Heading, Panel } from "@/app/_shared/ui";

function ProjectOverview({ slug, project }: { slug: string; project: typeof projects[number] }) {
  return <><Heading title={project.name} description={project.description} action={<ButtonLink href={projectUrl(slug, project.id) + "/issues"}>View issues</ButtonLink>} /><Panel title="Project progress"><progress value={project.progress} max={100} aria-label="Project progress" /> <strong>{project.progress}%</strong></Panel></>;
}

export default async function Page({ params }: { params: Promise<{ slug: string; projectId: string }> }) {
  const { slug, projectId } = await params;
  const project = projects.find(item => item.id === projectId);
  if (!project) notFound();
  return <ProjectOverview slug={slug} project={project} />;
}
