import Link from "next/link";
import type { ReactNode } from "react";

const primary = "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-button transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const secondary = "inline-flex min-h-11 items-center justify-center rounded-xl border border-field-line bg-white px-4 text-sm font-semibold text-copy transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const field = "h-12 w-full rounded-xl border border-field-line bg-field px-4 text-sm text-ink outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:text-muted";

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <span aria-hidden="true" className={`inline-grid shrink-0 place-items-center bg-primary font-bold text-white shadow-brand ${small ? "size-10 rounded-xl text-lg" : "size-14 rounded-2xl text-2xl"}`}>
      T
    </span>
  );
}

export function Action({ children, href, quiet = false }: { children: ReactNode; href?: string; quiet?: boolean }) {
  const styles = quiet ? secondary : primary;
  return href ? <Link className={styles} href={href}>{children}</Link> : (
    <button type="button" className={`${styles} cursor-not-allowed opacity-60`} title="Not connected in this preview" disabled>{children}</button>
  );
}

export function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-[24px] border border-line bg-white p-5 shadow-panel sm:p-7">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Screen({ title, folder, description, action, children }: { title: string; folder: string; description: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-lg border border-line bg-white px-2.5 py-1 font-mono text-xs text-muted">{folder}</span>
          <h1 className="mt-3 text-[30px] leading-tight font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function Field({ label, value = "", type = "text", previewEdit = false }: { label: string; value?: string; type?: "text" | "email" | "date"; previewEdit?: boolean }) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="block text-sm font-semibold text-copy">{label}</span>
      <input className={field} type={type} defaultValue={value} disabled={!previewEdit} />
    </label>
  );
}

export function SelectField({ label, value, choices = [] }: { label: string; value: string; choices?: string[] }) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="block text-sm font-semibold text-copy">{label}</span>
      <select className={field} defaultValue={value} disabled={!choices.length}>{(choices.length ? choices : [value]).map((choice) => <option key={choice}>{choice}</option>)}</select>
    </label>
  );
}

export function Badge({ children, tone = "violet" }: { children: ReactNode; tone?: "violet" | "green" | "gray" }) {
  const color = { violet: "bg-violet-50 text-violet-700", green: "bg-emerald-50 text-emerald-800", gray: "bg-slate-100 text-slate-600" }[tone];
  return <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{children}</span>;
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-field-line bg-field p-6 text-center"><p className="text-sm font-semibold text-ink">{title}</p><p className="mt-1 text-sm leading-6 text-muted">{children}</p></div>;
}

export function Row({ title, detail, end, href }: { title: string; detail: string; end?: ReactNode; href?: string }) {
  const content = <><span className="min-w-0"><span className="block text-sm font-semibold text-ink">{title}</span><span className="mt-1 block text-xs leading-5 text-muted">{detail}</span></span>{end && <span className="shrink-0">{end}</span>}</>;
  const style = "flex w-full items-center justify-between gap-3 rounded-xl border border-line p-4";
  return href ? <Link href={href} className={`${style} hover:border-primary/35 hover:bg-violet-50/50`}>{content}</Link> : <div className={style}>{content}</div>;
}
