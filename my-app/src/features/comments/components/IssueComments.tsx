"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, RotateCw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getIssueError } from "@/features/issues/api/issue.api";
import type { IssueComment } from "../api/comment.api";
import { useComments } from "../hooks/useComments";
import { useCreateComment } from "../hooks/useCreateComment";
import { useDeleteComment } from "../hooks/useDeleteComment";
import { useUpdateComment } from "../hooks/useUpdateComment";
import { commentMaxLength, createCommentSchema, type CreateCommentFormData } from "../schemas/comment.schema";
import CommentRow from "./CommentRow";

type CommentScope = { slug: string; projectId: string; issueId: string };
const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";

export default function IssueComments({ slug, projectId, issueId, canComment, canModerate = false }: CommentScope & {
  canComment: boolean;
  canModerate?: boolean;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useComments(slug, projectId, issueId);
  const update = useUpdateComment(slug, projectId, issueId);
  const remove = useDeleteComment(slug, projectId, issueId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const handledComment = useRef("");
  const comments = query.data ?? [];
  const canChangeComment = (comment: IssueComment) =>
    Boolean(canComment && userId && !comment.deleted_at && (canModerate || comment.author_id === userId));
  const activeEditId = comments.find((comment) => comment.id === editingId && canChangeComment(comment))?.id;
  const actionsDisabled = update.isPending || remove.isPending || Boolean(activeEditId);

  useEffect(() => {
    function showLinkedComment() {
      const hash = window.location.hash;
      if (!hash.startsWith("#comment-")) {
        handledComment.current = "";
        return;
      }
      if (handledComment.current === hash) return;
      const comment = query.data?.find(({ id }) => hash === `#comment-${encodeURIComponent(id)}`);
      const row = comment && document.getElementById(`comment-${comment.id}`);
      if (row) {
        handledComment.current = hash;
        row.focus({ preventScroll: true });
        row.scrollIntoView({ block: "center" });
      }
    }
    showLinkedComment();
    window.addEventListener("hashchange", showLinkedComment);
    return () => window.removeEventListener("hashchange", showLinkedComment);
  }, [query.data]);

  return (
    <section aria-labelledby="issue-comments-title" className="rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
          <MessageSquare size={18} aria-hidden="true" />
        </span>
        <h2 id="issue-comments-title" className="text-sm font-semibold text-slate-900">Comments</h2>
      </header>
      {notice && <p role="status" className="sr-only">{notice}</p>}
      {query.isPending && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading comments…</p>}
      {query.isError && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <p role="alert" className="text-sm text-red-700">{getIssueError(query.error, "Could not load comments.")}</p>
          <button type="button" className={secondaryButton} onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RotateCw size={15} aria-hidden="true" className={query.isFetching ? "motion-safe:animate-spin" : undefined} />
            {query.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {query.data && !query.isError && comments.length === 0 && (
        <p className="px-5 py-6 text-sm text-slate-600">No comments yet.</p>
      )}
      {comments.length > 0 && (
        <ul aria-label="Issue comments" aria-busy={query.isFetching} className="divide-y divide-slate-100">
          {comments.map((comment) => {
            return (
              <CommentRow
                key={comment.id}
                comment={comment}
                actions={canChangeComment(comment) ? {
                  editing: activeEditId === comment.id,
                  disabled: actionsDisabled,
                  deleting: remove.isPending && remove.variables === comment.id,
                  onEdit: () => {
                    setNotice("");
                    setEditingId(comment.id);
                  },
                  onCancelEdit: () => setEditingId(null),
                  onSave: async ({ body }) => {
                    if (body !== comment.body.trim()) {
                      await update.mutateAsync({ commentId: comment.id, body });
                      setNotice("Comment updated.");
                    }
                    setEditingId(null);
                  },
                  onDelete: async () => {
                    setNotice("");
                    await remove.mutateAsync(comment.id);
                    setNotice("Comment deleted.");
                  },
                } : undefined}
              />
            );
          })}
        </ul>
      )}
      {canComment && <CommentComposer key={issueId} slug={slug} projectId={projectId} issueId={issueId} />}
    </section>
  );
}

function CommentComposer({ slug, projectId, issueId }: CommentScope) {
  const create = useCreateComment(slug, projectId, issueId);
  const [notice, setNotice] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { body: "" },
  });

  const submit = handleSubmit(async (values) => {
    setNotice("");
    clearErrors("root.server");
    try {
      await create.mutateAsync(values);
      reset();
      setNotice("Comment posted.");
    } catch (error) {
      setError("root.server", { message: getIssueError(error, "Could not add the comment.") });
    }
  });

  return (
    <form noValidate onSubmit={submit} className="space-y-3 border-t border-slate-200 px-5 py-4">
      <div>
        <label htmlFor="issue-comment-body" className="mb-1.5 block text-sm font-medium text-slate-900">Your comment</label>
        <textarea
          id="issue-comment-body"
          rows={3}
          maxLength={commentMaxLength}
          placeholder="Write a comment"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? "issue-comment-error" : undefined}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50"
          {...register("body", { onChange: () => { if (notice) setNotice(""); } })}
        />
        {errors.body && <p id="issue-comment-error" className="mt-1 text-sm text-red-700">{errors.body.message}</p>}
      </div>
      {errors.root?.server?.message && <p role="alert" className="text-sm text-red-700">{errors.root.server.message}</p>}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
        <button type="submit" className={primaryButton} disabled={isSubmitting}>
          <Send size={16} aria-hidden="true" />
          {isSubmitting ? "Posting…" : "Add comment"}
        </button>
      </div>
    </form>
  );
}
