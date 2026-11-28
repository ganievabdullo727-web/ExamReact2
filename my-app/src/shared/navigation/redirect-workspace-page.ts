import { redirect } from "next/navigation";

export type LegacySearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function redirectWorkspacePage(slug: string, segments: string[], searchParams: LegacySearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") query.append(key, value);
    else value?.forEach((item) => query.append(key, item));
  }
  const path = [slug, ...segments].map(encodeURIComponent).join("/");
  const suffix = query.size ? `?${query.toString()}` : "";
  redirect(`/workspaces/${path}${suffix}`);
}
