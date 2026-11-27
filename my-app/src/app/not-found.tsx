import { ButtonLink, Heading } from "@/app/_shared/ui";

export default function NotFound() {
  return <div className="standalone"><Heading title="Page not found" /><ButtonLink href="/">Back to workspace</ButtonLink></div>;
}
