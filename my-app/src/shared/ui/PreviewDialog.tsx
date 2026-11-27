"use client";

import { useId, useRef, type ReactNode } from "react";

export function PreviewDialog({
  trigger,
  title,
  description,
  children,
  quiet = false,
}: {
  trigger: string;
  title: string;
  description: string;
  children: ReactNode;
  quiet?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const hint = useId();
  const triggerClass = quiet
    ? "border border-field-line bg-white text-copy hover:border-primary hover:text-primary"
    : "bg-primary text-white shadow-button hover:bg-primary-hover";

  return (
    <>
      <button type="button" aria-haspopup="dialog" className={`inline-flex min-h-12 items-center rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${triggerClass}`} onClick={() => dialog.current?.showModal()}>
        {trigger}
      </button>
      <dialog ref={dialog} aria-labelledby={heading} aria-describedby={hint} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[440px] overflow-y-auto rounded-[24px] border border-line bg-white p-6 text-ink shadow-panel backdrop:bg-ink/40 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={heading} className="text-2xl font-bold tracking-tight">{title}</h2>
            <p id={hint} className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </div>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close dialog" className="grid size-9 shrink-0 place-items-center rounded-xl border border-line text-xl text-copy hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-primary">
            ×
          </button>
        </div>
        <div className="mt-6 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <button type="button" className="min-h-10 rounded-xl border border-field-line px-4 text-sm font-semibold text-copy hover:bg-field focus-visible:outline-2 focus-visible:outline-primary" onClick={() => dialog.current?.close()}>Cancel</button>
        </div>
      </dialog>
    </>
  );
}
