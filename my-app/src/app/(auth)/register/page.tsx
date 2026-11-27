import Link from "next/link";
import { workspaceUrl } from "@/app/_shared/lib/demo";
import { ButtonLink, Field, Heading } from "@/app/_shared/ui";

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  return <section className="panel"><Heading title={registering ? "Create an account" : "Sign in to TaskFlow"} />
    {registering && <Field label="Name" />}<Field label="Email" type="email" /><Field label="Password" type="password" />
    <div className="tags"><ButtonLink href={workspaceUrl()}>Open demo workspace</ButtonLink><Link href={registering ? "/login" : "/register"}>{registering ? "Sign in" : "Create an account"}</Link></div>
  </section>;
}

export default function Page() {
  return <AuthForm mode="register" />;
}
