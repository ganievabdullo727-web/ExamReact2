import { people } from "@/app/_shared/lib/demo";
import { Field, Heading, Panel } from "@/app/_shared/ui";

export default function Page() {
  return <><Heading title="Profile" /><Panel title="Personal details"><Field label="Display name" value={people[0]} /></Panel></>;
}
