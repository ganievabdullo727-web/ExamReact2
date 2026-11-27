import { ProjectsPage } from "@/features/projects";
import { AppShell } from "@/shared/layout/AppShell";
export default function Page() {
  return <AppShell><ProjectsPage slug="taskflow" /></AppShell>;
}
