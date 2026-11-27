import Link from "next/link";
import { notFound } from "next/navigation";
import { projectUrl } from "@/app/_shared/lib/demo";
import { Heading, Panel } from "@/app/_shared/ui";

const planning = {
  cycles: { title: "Cycles", item: { id: "current", name: "Current sprint", description: "Plan the current iteration." } },
  modules: { title: "Modules", item: { id: "foundation", name: "Foundation", description: "Track the work that sets up this project." } },
};

function Planning({ slug, projectId, kind, id }: { slug: string; projectId: string; kind: keyof typeof planning; id?: string }) {
  const { title, item } = planning[kind];
  if (id && id !== item.id) notFound();
  const base = projectUrl(slug, projectId) + "/" + kind;
  return id
    ? <><Heading title={item.name} description={item.description} /><Link href={base}>Back to {title.toLowerCase()}</Link></>
    : <><Heading title={title} /><Panel title={`Project ${title.toLowerCase()}`}><Link className="row" href={base + "/" + item.id}><span><strong>{item.name}</strong><small>{item.description}</small></span></Link></Panel></>;
}

export default async function Page({ params }: { params: Promise<{ slug: string; projectId: string }> }) {
  const { slug, projectId } = await params;
  return <Planning slug={slug} projectId={projectId} kind="cycles" />;
}
