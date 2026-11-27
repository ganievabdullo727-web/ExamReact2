import type { ReactNode } from "react";
import { AppShell } from "@/app/_shared/layout/AppShell";

export default function Layout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
