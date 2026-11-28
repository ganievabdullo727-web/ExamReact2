"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { useForm } from "react-hook-form";

import { getIssueError } from "@/features/issues/api/issue.api";
import type { IssueComment } from "../api/comment.api";
import { commentMaxLength, createCommentSchema, type CreateCommentFormData } from "../schemas/comment.schema";

const commentDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
const actionButton = "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium focus-visible:outline-2 disabled:opacity-50";
const secondaryButton = "inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const primaryButton = "inline-flex min-h-9 items-center justify-center rounded-lg bg-[#594BDB] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";

type RowActions = {
  editing: boolean;
  disabled: boolean;
  deleting: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (values: CreateCommentFormData) => Promise<void>;
  onDelete: () => Promise<void>;
};

export default function CommentRow({ comment, actions }: { comment: IssueComment; actions?: RowActions }) {
  const row = useRef<HTMLLIElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const name = comment.author?.display_name?.trim() || "Workspace member";
  const initials = name.split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase();
  const date = new Date(comment.created_at);
  const updated = new Date(comment.updated_at);
  const isEdited = !comment.deleted_at && updated.getTime() > date.getTime();
  const editing = Boolean(actions?.editing);
  const wasEditing = useRef(false);

  useEffect(() => {
    if (wasEditing.current && !editing) {
      if (editButton.current) editButton.current.focus();
      else row.current?.focus();
    }
    wasEditing.current = editing;
  }, [editing]);

  return (
    <li ref={row} id={`comment-${comment.id}`} tabIndex={-1} data-comment-id={comment.id} className="flex scroll-mt-20 items-start gap-3 px-5 py-4 target:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-500">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="wrap-break-word text-sm font-semibold text-slate-900">{name}</p>
            {Number.isFinite(date.getTime()) && (
              <time dateTime={comment.created_at} className="text-xs text-slate-600">{commentDate.format(date)}</time>
            )}
            {isEdited && <span className="text-xs text-slate-500" title={commentDate.format(updated)}>Edited</span>}
          </div>
          {actions && !editing && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                ref={editButton}
                type="button"
                data-comment-action="edit"
                aria-label={`Edit comment by ${name}`}
                className={actionButton + " text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-indigo-500"}
                onClick={actions.onEdit}
                disabled={actions.disabled}
              >
                <Pencil size={14} aria-hidden="true" /> Edit
              </button>
              <DeleteCommentButton name={name} row={row} disabled={actions.disabled} deleting={actions.deleting} onDelete={actions.onDelete} />
            </div>
          )}
        </div>
        {comment.deleted_at ? (
          <p className="mt-1.5 text-sm italic text-slate-500">Comment deleted.</p>
        ) : actions?.editing ? (
          <CommentEditor body={comment.body} onSave={actions.onSave} onCancel={actions.onCancelEdit} />
        ) : (
          <p className="mt-1.5 wrap-break-word whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{comment.body}</p>
        )}
      </div>
    </li>
  );
}

function CommentEditor({ body, onSave, onCancel }: {
  body: string;
  onSave: RowActions["onSave"];
  onCancel: () => void;
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const { register, handleSubmit, setError, setFocus, clearErrors, formState: { errors, isDirty, isSubmitting } } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { body },
  });

  useEffect(() => {
    setFocus("body");
  }, [setFocus]);

  const submit = handleSubmit(async (values) => {
    clearErrors("root.server");
    try {
      await onSave(values);
    } catch (error) {
      setError("root.server", { message: getIssueError(error, "Could not edit the comment.") });
    }
  });

  return (
    <form noValidate onSubmit={submit} className="mt-2 space-y-2">
      <label htmlFor={inputId} className="sr-only">Edit comment</label>
      <textarea
        id={inputId}
        data-comment-edit-body
        rows={3}
        maxLength={commentMaxLength}
        disabled={isSubmitting}
        aria-invalid={Boolean(errors.body)}
        aria-describedby={errors.body ? errorId : undefined}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50"
        {...register("body")}
      />
      {errors.body && <p id={errorId} className="text-sm text-red-700">{errors.body.message}</p>}
      {errors.root?.server?.message && <p role="alert" className="text-sm text-red-700">{errors.root.server.message}</p>}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button type="button" data-comment-action="cancel-edit" className={secondaryButton} onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" data-comment-action="save" className={primaryButton} disabled={!isDirty || isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function DeleteCommentButton({ name, row, disabled, deleting, onDelete }: {
  name: string;
  row: RefObject<HTMLLIElement | null>;
  disabled: boolean;
  deleting: boolean;
  onDelete: RowActions["onDelete"];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);

  async function deleteComment() {
    setError("");
    try {
      await onDelete();
      setOpen(false);
    } catch (error) {
      setError(getIssueError(error, "Could not delete the comment."));
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => {
      if (deleting) return;
      if (next) setError("");
      setOpen(next);
    }}>
      <AlertDialog.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          data-comment-action="delete"
          aria-label={`Delete comment by ${name}`}
          className={actionButton + " text-red-700 hover:bg-red-50 focus-visible:outline-red-600"}
          disabled={disabled}
        >
          <Trash2 size={14} aria-hidden="true" /> Delete
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl"
          onCloseAutoFocus={(event) => {
            if (!trigger.current?.isConnected) {
              event.preventDefault();
              row.current?.focus();
            }
          }}
        >
          <AlertDialog.Title className="text-base font-semibold">Delete comment?</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-slate-600">
            The comment text will be removed from the discussion.
          </AlertDialog.Description>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button type="button" data-comment-action="cancel-delete" className={secondaryButton} disabled={deleting}>Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                data-comment-action="confirm-delete"
                className="inline-flex min-h-9 items-center justify-center rounded-lg bg-red-700 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault();
                  void deleteComment();
                }}
              >
                {deleting ? "Deleting…" : "Delete comment"}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
