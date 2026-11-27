import { people, projects, workspace, workspaceUrl } from "@/app/_shared/lib/demo";
import { ButtonLink, Heading, Panel } from "@/app/_shared/ui";

export default function Page() {
  return <><Heading title="Workspaces" /><Panel title={workspace.name}><p>{projects.length} projects · {people.length} members</p><ButtonLink href={workspaceUrl()}>Open workspace</ButtonLink></Panel></>;
}
