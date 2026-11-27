import { notFound } from "next/navigation";
import { issues } from "@/app/_shared/lib/demo";
import { Badge, Field, Heading, Panel } from "@/app/_shared/ui";

function IssueDetail({ issue }: { issue: typeof issues[number] }) {
  return <><Heading title={issue.name} description={issue.id} /><div className="two-column"><Panel title="Issue details"><div className="tags"><Badge>{issue.status}</Badge><Badge>{issue.priority}</Badge><Badge>{issue.label}</Badge></div><p>Assigned to {issue.assignee}</p></Panel><Panel title="Attachments"><p>No attachments yet.</p></Panel></div><Panel title="Comments"><p>No comments yet.</p><Field label="Comment draft" /></Panel></>;
}

export default async function Page({ params }: { params: Promise<{ projectId: string; issueId: string }> }) {
  const { projectId, issueId } = await params;
  const issue = issues.find(item => item.id === issueId && item.project === projectId);
  if (!issue) notFound();
  return <IssueDetail issue={issue} />;
}
