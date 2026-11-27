import Link from "next/link";
import { projectUrl, projects } from "@/app/_shared/lib/demo";

export function ProjectList({ slug }: { slug: string }) {
  return <div className="rows">{projects.map(project => <Link className="row project-row" key={project.id} href={projectUrl(slug, project.id)}>
    <span className="tile" aria-hidden="true">▤</span><span><strong>{project.name}</strong><small>{project.key} · {project.description}</small></span>
    <span className="project-progress"><progress aria-label={project.name + " progress"} value={project.progress} max={100} />{project.progress}%</span>
  </Link>)}</div>;
}
