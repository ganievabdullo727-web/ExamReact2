import { AppShell } from "@/shared/layout/AppShell";

export default async function WorkspaceLayout({ children, params }: LayoutProps<"/w/[slug]">) {
  const { slug } = await params;
  return <AppShell slug={encodeURIComponent(slug)}>{children}</AppShell>;
}
