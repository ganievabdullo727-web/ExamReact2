import Link from "next/link";
import type { ReactNode } from "react";

export function Heading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <header className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>;
}
export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="button" href={href}>{children}</Link>;
}
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}
export function Field({ label, type = "text", value }: { label: string; type?: string; value?: string }) {
  return <label className="field">{label}<input type={type} defaultValue={value} /></label>;
}
