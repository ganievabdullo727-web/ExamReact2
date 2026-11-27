import { redirect } from "next/navigation";
import { workspaceUrl } from "@/app/_shared/lib/demo";

export default function Page() {
  redirect(workspaceUrl());
}
