import Link from "next/link";

export default async function ProjectLayout({ children, params }: LayoutProps<"/w/[slug]/p/[projectId]">) {
  const { slug, projectId } = await params;
  const base = `/w/${encodeURIComponent(slug)}/p/${encodeURIComponent(projectId)}`;
  return (
    <div>
      <nav aria-label="Project sections" className="mb-4 flex flex-wrap gap-2 text-sm font-semibold text-primary">
        <Link href={base} className="rounded-lg bg-violet-50 px-3 py-2 hover:underline">Project overview</Link>
        <Link href={`${base}/cycles`} className="rounded-lg bg-violet-50 px-3 py-2 hover:underline">Cycles</Link>
        <Link href={`${base}/modules`} className="rounded-lg bg-violet-50 px-3 py-2 hover:underline">Modules</Link>
        <Link href={`${base}/settings`} className="rounded-lg bg-violet-50 px-3 py-2 hover:underline">Settings</Link>
      </nav>
      {children}
    </div>
  );
}
