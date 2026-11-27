import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { workspace } from "@/app/_shared/lib/demo";

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== workspace.slug) notFound();
  return children;
}
