import { WorkspacePage } from "@/features/workspaces";
export default async function Page({ params }: PageProps<"/w/[slug]">) {
  const { slug } = await params;
  return <WorkspacePage slug={encodeURIComponent(slug)} />;
}
