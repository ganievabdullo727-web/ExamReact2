import { issues, projectUrl } from "@/app/_shared/lib/demo";
import { Heading, Panel } from "@/app/_shared/ui";
import { IssueRows } from "@/app/_shared/IssueRows";

function IssueList({ slug, projectId, query }: { slug: string; projectId: string; query?: string }) {
  const term = query?.trim().toLowerCase();
  const results = issues.filter(issue => issue.project === projectId && (!term || (issue.id + " " + issue.name).toLowerCase().includes(term)));
  return <><Heading title="Issues" description="Track the work in this project." /><Panel title="Project issues">
    <form className="search" action={projectUrl(slug, projectId) + "/issues"}><input type="search" name="q" aria-label="Search issues" placeholder="Search by name or ID" defaultValue={query} /><button className="button">Search</button></form>
    {results.length ? <IssueRows slug={slug} items={results} /> : <p>No matching issues.</p>}
  </Panel></>;
}

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string; projectId: string }>; searchParams: Promise<{ q?: string | string[] }> }) {
  const { slug, projectId } = await params;
  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  return <IssueList slug={slug} projectId={projectId} query={query} />;
}
