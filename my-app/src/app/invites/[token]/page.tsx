import type { Metadata } from "next";
import InviteScreen from "@/features/invites/components/InviteScreen";

export const metadata: Metadata = {
  title: "Workspace invitation | TaskFlow",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function InvitePage({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const [{ token }, { mode }] = await Promise.all([params, searchParams]);
  return <InviteScreen key={token} token={token} mode={mode === "login" || mode === "register" ? mode : undefined} />;
}
