import { people } from "@/app/_shared/lib/demo";
import { ButtonLink, Field, Heading, Panel } from "@/app/_shared/ui";

export default function Page() {
  return <><Heading title="Members" /><Panel title="Workspace members"><ul className="plain-list">{people.map(person => <li key={person}>{person}</li>)}</ul></Panel>
    <Panel title="Invitations"><Field label="Invite by email" type="email" /><ButtonLink href="/invite/demo">Preview invitation</ButtonLink></Panel></>;
}
