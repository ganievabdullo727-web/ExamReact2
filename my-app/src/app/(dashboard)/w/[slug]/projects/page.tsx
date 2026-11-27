import { Heading, Panel } from "@/app/_shared/ui";
import { ProjectList } from "@/app/_shared/ProjectList";

function Projects({ slug }: { slug: string }) {
  return <><Heading title="Projects" description="Browse projects in this workspace." /><Panel title="All projects"><ProjectList slug={slug} /></Panel></>;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Projects slug={slug} />;
}
