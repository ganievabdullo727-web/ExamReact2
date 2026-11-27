import { Heading, Panel } from "@/app/_shared/ui";
import { issues } from "@/app/_shared/lib/demo";
import { IssueRows } from "@/app/_shared/IssueRows";

function Notifications({ slug }: { slug: string }) {
  return <><Heading title="Notifications" /><Panel title="Recent issue updates"><IssueRows slug={slug} items={issues.slice(0, 2)} /></Panel></>;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Notifications slug={slug} />;
}
