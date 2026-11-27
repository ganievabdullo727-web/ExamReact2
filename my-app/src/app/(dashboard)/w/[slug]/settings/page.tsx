import { workspace } from "@/app/_shared/lib/demo";
import { Field, Heading, Panel } from "@/app/_shared/ui";

export default function Page() {
  return <><Heading title="Workspace settings" /><Panel title="General"><Field label="Name" value={workspace.name} /><Field label="Workspace slug" value={workspace.slug} /></Panel></>;
}
