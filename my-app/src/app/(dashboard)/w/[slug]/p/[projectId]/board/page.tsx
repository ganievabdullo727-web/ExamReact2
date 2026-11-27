import { issues, states } from "@/app/_shared/lib/demo";
import { Heading, Panel } from "@/app/_shared/ui";
import { IssueRows } from "@/app/_shared/IssueRows";

function Board({ slug, projectId }: { slug: string; projectId: string }) {
  return <><Heading title="Board" description="See project issues by status." /><div className="board">{states.map(status => <Panel key={status} title={status}>
    {issues.some(issue => issue.project === projectId && issue.status === status) ? <IssueRows slug={slug} items={issues.filter(issue => issue.project === projectId && issue.status === status)} /> : <p>No issues yet.</p>}
  </Panel>)}</div></>;
}

export default async function Page({ params }: { params: Promise<{ slug: string; projectId: string }> }) {
  const { slug, projectId } = await params;
  return <Board slug={slug} projectId={projectId} />;
}
