import { workspace, workspaceUrl } from "@/app/_shared/lib/demo";
import { ButtonLink, Heading } from "@/app/_shared/ui";

export default function Page() {
  return <><Heading title="Workspace invitation" description={`You’ve been invited to ${workspace.name}.`} /><ButtonLink href={workspaceUrl()}>Preview workspace</ButtonLink></>;
}
