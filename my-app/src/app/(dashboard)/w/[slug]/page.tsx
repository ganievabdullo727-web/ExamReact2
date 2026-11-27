import { issues, people, projects, workspace, workspaceUrl } from "@/app/_shared/lib/demo";
import { ButtonLink, Heading, Panel } from "@/app/_shared/ui";
import { IssueRows } from "@/app/_shared/IssueRows";
import { ProjectList } from "@/app/_shared/ProjectList";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stats = [
    { label: "Active projects", total: projects.length },
    { label: "Open issues", total: issues.filter(issue => issue.status !== "Done").length },
    { label: "In progress", total: issues.filter(issue => issue.status === "In progress").length },
    { label: "Team members", total: people.length },
  ];
  const myIssues = issues.filter(issue => issue.assignee === people[0]);

  return (
    <>
      <Heading
        title="Good morning"
        description="Here’s what’s happening across your workspace today."
        action={<ButtonLink href={workspaceUrl(slug) + "/projects"}>View projects</ButtonLink>}
      />

      <div className="banner">
        <strong>{workspace.name}</strong>
        <span>Projects, issues and your team in one place.</span>
      </div>

      <div className="stats">
        {stats.map(({ label, total }) => (
          <Panel title={label} key={label}>
            <strong className="stat-value">{total}</strong>
          </Panel>
        ))}
      </div>

      <div className="two-column">
        <Panel title="Projects">
          <ProjectList slug={slug} />
        </Panel>
        <Panel title="My issues">
          <IssueRows slug={slug} items={myIssues} />
        </Panel>
      </div>
    </>
  );
}
