import type { ReactNode } from "react";
import WorkspaceLayout from "@/features/workspaces/components/WorkspaceLayout";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
