import { notFound } from "next/navigation";
import { projects, labels, projectUrl, states } from "@/app/_shared/lib/demo";
import Link from "next/link";
import { Badge, Field, Heading, Panel } from "@/app/_shared/ui";

function ProjectSettings({ slug, project, section }: { slug: string; project: typeof projects[number]; section?: "states" | "labels" }) {
  const base = projectUrl(slug, project.id) + "/settings";
  return <><Heading title={section === "states" ? "Statuses" : section === "labels" ? "Labels" : "Project settings"} description={project.name} />
    <nav className="tabs" aria-label="Project settings"><Link href={base}>General</Link><Link href={base + "/states"}>Statuses</Link><Link href={base + "/labels"}>Labels</Link></nav>
    <Panel title={section === "states" ? "Issue statuses" : section === "labels" ? "Issue labels" : "Project details"}>
      {section ? <div className="tags">{(section === "states" ? states : labels).map(item => <Badge key={item}>{item}</Badge>)}</div> : <><Field label="Project name" value={project.name} /><Field label="Description" value={project.description} /></>}
    </Panel></>;
}

export default async function Page({ params }: { params: Promise<{ slug: string; projectId: string }> }) {
  const { slug, projectId } = await params;
  const project = projects.find(item => item.id === projectId);
  if (!project) notFound();
  return <ProjectSettings slug={slug} project={project} section="labels" />;
}
