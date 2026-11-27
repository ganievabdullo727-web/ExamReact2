import Link from "next/link";
import { workspaceUrl } from "../lib/demo";

export function Topbar() {
  return <header className="topbar"><Link href={workspaceUrl()}>Workspace</Link><div><Link href={workspaceUrl() + "/projects"}>Browse projects</Link><Link href="/profile" className="avatar" aria-label="Profile">JL</Link></div></header>;
}
