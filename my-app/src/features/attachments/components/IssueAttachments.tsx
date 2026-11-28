"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Download, File as FileIcon, Paperclip, RotateCw, Trash2, Upload } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  downloadIssueAttachment,
  getAttachmentError,
  validateAttachmentFile,
  type IssueAttachment,
} from "../api/attachment.api";
import { useDeleteAttachment } from "../hooks/useDeleteAttachment";
import { useIssueAttachments } from "../hooks/useIssueAttachments";
import { useUploadAttachment } from "../hooks/useUploadAttachment";

const primaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const deleteButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-red-700 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50";
const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const sizeFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

function formatSize(bytes: number) {
  if (bytes < 1024) return `${sizeFormatter.format(bytes)} B`;
  if (bytes < 1024 ** 2) return `${sizeFormatter.format(bytes / 1024)} KiB`;
  return `${sizeFormatter.format(bytes / 1024 ** 2)} MiB`;
}

type AttachmentScope = { slug: string; projectId: string; issueId: string };

export default function IssueAttachments({ slug, projectId, issueId, canUpload, canModerate }: AttachmentScope & {
  canUpload: boolean;
  canModerate: boolean;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useIssueAttachments(slug, projectId, issueId);
  const remove = useDeleteAttachment(slug, projectId, issueId);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IssueAttachment | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  const deleteTrigger = useRef<HTMLButtonElement>(null);
  const attachments = query.data ?? [];
  const canDelete = (attachment: IssueAttachment) =>
    Boolean(canUpload && userId && (canModerate || attachment.uploaded_by_id === userId));

  async function download(attachment: IssueAttachment) {
    setDownloadingId(attachment.id);
    setDownloadError("");
    setNotice("");
    try {
      await downloadIssueAttachment(slug, projectId, issueId, attachment.id);
    } catch (error) {
      setDownloadError(getAttachmentError(error, `Could not download ${attachment.file_name}.`));
    } finally {
      setDownloadingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !canDelete(deleteTarget) || remove.isPending) return;
    setDeleteError("");
    try {
      await remove.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Attachment deleted.");
    } catch (error) {
      setDeleteError(getAttachmentError(error, "Could not delete the attachment."));
    }
  }

  return (
    <section aria-labelledby="issue-attachments-title" className="rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
          <Paperclip size={18} aria-hidden="true" />
        </span>
        <h2 ref={title} id="issue-attachments-title" tabIndex={-1} className="rounded-sm text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Attachments</h2>
      </header>
      {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading attachments…</p>}
      {query.isError && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <p role="alert" className="text-sm text-red-700">{getAttachmentError(query.error, "Could not load attachments.")}</p>
          <button type="button" className={secondaryButton} onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RotateCw size={15} aria-hidden="true" className={query.isFetching ? "motion-safe:animate-spin" : undefined} />
            {query.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {query.data && !query.isError && attachments.length === 0 && (
        <p className="px-5 py-6 text-sm text-slate-600">No attachments yet.</p>
      )}
      {attachments.length > 0 && (
        <ul aria-label="Issue attachments" aria-busy={query.isFetching} className="divide-y divide-slate-100">
          {attachments.map((attachment) => {
            const date = new Date(attachment.created_at);
            const uploader = attachment.uploaded_by?.display_name;

            return (
              <li key={attachment.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3.5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                    <FileIcon size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="wrap-anywhere text-sm font-medium text-slate-900">{attachment.file_name}</p>
                    <p className="mt-0.5 wrap-anywhere text-xs text-slate-500">
                      {formatSize(attachment.file_size)}
                      {uploader && <> · {uploader}</>}
                      {!Number.isNaN(date.getTime()) && <> · <time dateTime={attachment.created_at}>{dateFormatter.format(date)}</time></>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Download ${attachment.file_name}`}
                    className={secondaryButton}
                    onClick={() => void download(attachment)}
                    disabled={downloadingId !== null}
                  >
                    <Download size={15} aria-hidden="true" /> {downloadingId === attachment.id ? "Downloading…" : "Download"}
                  </button>
                  {canDelete(attachment) && (
                    <button
                      type="button"
                      aria-label={`Delete ${attachment.file_name}`}
                      className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      onClick={(event) => {
                        deleteTrigger.current = event.currentTarget;
                        setDeleteTarget(attachment);
                        setDeleteError("");
                        setNotice("");
                      }}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {downloadError && <p role="alert" className="px-5 py-3 text-sm text-red-700">{downloadError}</p>}
      {notice && <p role="status" className="px-5 py-3 text-sm text-emerald-800">{notice}</p>}
      {canUpload && <AttachmentUpload slug={slug} projectId={projectId} issueId={issueId} />}
      <AlertDialog.Root open={Boolean(deleteTarget)} onOpenChange={(open) => {
        if (!open && !remove.isPending) setDeleteTarget(null);
      }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
          <AlertDialog.Content
            className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              const previous = deleteTrigger.current;
              if (previous?.isConnected) previous.focus();
              else title.current?.focus();
            }}
          >
            <AlertDialog.Title className="text-base font-semibold">Delete attachment?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 wrap-anywhere text-sm text-slate-600">
              <span className="font-medium text-slate-900">{deleteTarget?.file_name}</span> will be removed from this issue.
            </AlertDialog.Description>
            {deleteError && <p role="alert" className="mt-3 text-sm text-red-700">{deleteError}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" className={secondaryButton} disabled={remove.isPending}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  className={deleteButton}
                  disabled={remove.isPending || !deleteTarget || !canDelete(deleteTarget)}
                  onClick={(event) => {
                    event.preventDefault();
                    void confirmDelete();
                  }}
                >
                  {remove.isPending ? "Deleting…" : "Delete"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}

function AttachmentUpload({ slug, projectId, issueId }: AttachmentScope) {
  const upload = useUploadAttachment(slug, projectId, issueId);
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const validationError = file ? validateAttachmentFile(file) : undefined;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || validationError || upload.isPending) return;
    setError("");
    setNotice("");
    setProgress(0);
    try {
      await upload.mutateAsync({ file, onProgress: setProgress });
      if (input.current) input.current.value = "";
      setFile(null);
      setNotice("File uploaded.");
    } catch (error) {
      setError(getAttachmentError(error, "Could not upload the attachment."));
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3 border-t border-slate-200 px-5 py-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="issue-attachment-file" className="block text-sm font-medium text-slate-900">Choose file</label>
          <input
            ref={input}
            id="issue-attachment-file"
            type="file"
            onChange={(event) => {
              setFile(event.currentTarget.files?.[0] ?? null);
              setError("");
              setNotice("");
            }}
            disabled={upload.isPending}
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? "attachment-file-error" : undefined}
            className="w-full min-w-0 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 file:mr-3 file:cursor-pointer file:border-0 file:border-r file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:font-medium file:text-slate-700 hover:file:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 aria-invalid:border-red-500 disabled:opacity-50"
          />
        </div>
        <button type="submit" className={primaryButton} disabled={!file || Boolean(validationError) || upload.isPending}>
          <Upload size={16} aria-hidden="true" /> {upload.isPending ? "Uploading…" : "Upload file"}
        </button>
      </div>
      {upload.isPending && (
        <div className="flex items-center gap-3">
          <progress aria-label="Upload progress" value={progress} max={100} className="h-2 w-full flex-1 accent-indigo-600" />
          <span className="text-xs tabular-nums text-slate-600">{progress}%</span>
        </div>
      )}
      {validationError && <p id="attachment-file-error" role="alert" className="text-sm text-red-700">{validationError}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
    </form>
  );
}
