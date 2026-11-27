import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { projects, projectUrl } from "@/app/_shared/lib/demo";

const sections = [["Overview", ""], ["Issues", "/issues"], ["Board", "/board"], ["Cycles", "/cycles"], ["Modules", "/modules"], ["Settings", "/settings"]];

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string; projectId: string }> }) {
  const { slug, projectId } = await params;
  const project = projects.find(item => item.id === projectId);
  if (!project) notFound();
  const base = projectUrl(slug, projectId);
  return <><nav className="tabs" aria-label={project.name}>{sections.map(([text, suffix]) => <Link href={base + suffix} key={text}>{text}</Link>)}</nav>{children}</>;
}
