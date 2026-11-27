import { Action, Brand } from "@/shared/ui/Ui";

export default function NotFound() {
  return (
    <main id="content" className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-[440px] space-y-5 rounded-[24px] border border-line bg-white px-8 py-10 text-center shadow-panel sm:px-10">
        <Brand />
        <p className="font-mono text-sm text-primary">404</p>
        <h1 className="text-[30px] font-bold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted">This page doesn’t exist in the preview.</p>
        <Action href="/workspaces">Back to workspaces</Action>
      </section>
    </main>
  );
}
