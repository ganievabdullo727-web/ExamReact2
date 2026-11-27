import Link from "next/link";
import { issues, projectUrl } from "@/app/_shared/lib/demo";
import { Badge } from "@/app/_shared/ui";

export function IssueRows({ slug, items }: { slug: string; items: typeof issues }) {
  return <div className="rows">{items.map(issue => <Link className="row" key={issue.id} href={projectUrl(slug, issue.project) + "/issues/" + issue.id}>
    <span><small>{issue.id}</small><strong>{issue.name}</strong></span><Badge>{issue.status}</Badge>
  </Link>)}</div>;
}
