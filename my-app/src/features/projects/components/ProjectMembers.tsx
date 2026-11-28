"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { LoaderCircle, Plus, RotateCw, Trash2, UsersRound } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import type { WorkspaceMember } from "@/features/workspaces/api/workspace.api";
import { getProjectError, type ProjectMember, type ProjectMemberRole } from "../api/project.api";
import { useAddProjectMember } from "../hooks/useAddProjectMember";
import { useProjectMembers } from "../hooks/useProjectMembers";
import { useRemoveProjectMember } from "../hooks/useRemoveProjectMember";
import { projectMemberSchema, type ProjectMemberFormData } from "../schemas/project.schema";

const fieldStyle = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-400 disabled:bg-slate-50";
const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60";
const roleStyle = {
  admin: "bg-indigo-50 text-indigo-700",
  member: "bg-slate-100 text-slate-700",
  viewer: "bg-teal-50 text-teal-800",
} satisfies Record<ProjectMemberRole, string>;

function displayName({ user }: ProjectMember | WorkspaceMember) {
  return user.display_name.trim() || user.email;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0] ?? "").join("").toUpperCase();
}

export default function ProjectMembers({
  slug,
  projectId,
  workspaceMembers,
  canManage,
}: {
  slug: string;
  projectId: string;
  workspaceMembers: WorkspaceMember[];
  canManage: boolean;
}) {
  const query = useProjectMembers(slug, projectId);
  const addMember = useAddProjectMember(slug, projectId);
  const removeMember = useRemoveProjectMember(slug, projectId);
  const [notice, setNotice] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [removeError, setRemoveError] = useState("");
  const removeTrigger = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const { register, handleSubmit, reset, setError, clearErrors, formState } = useForm<ProjectMemberFormData>({
    resolver: zodResolver(projectMemberSchema),
    defaultValues: { user_id: "", role: "member" },
  });
  const { errors, isSubmitting } = formState;
  const members = query.data ?? [];
  const memberIds = new Set(members.map(({ user_id }) => user_id));
  const availableMembers = workspaceMembers.filter(({ user_id }) => !memberIds.has(user_id));

  const submit = handleSubmit(async ({ user_id, role }) => {
    if (!canManage) return;
    setNotice("");
    try {
      const member = await addMember.mutateAsync({ user_id, role });
      reset();
      setNotice(`${displayName(member)} was added.`);
    } catch (error) {
      setError("root.server", {
        message: getProjectError(error, "Could not add this member. Please try again."),
      });
    }
  });

  const remove = async () => {
    if (!memberToRemove || !canManage) return;
    setRemoveError("");
    setNotice("");
    try {
      await removeMember.mutateAsync(memberToRemove.user_id);
      setNotice(`${displayName(memberToRemove)} was removed.`);
      setMemberToRemove(null);
    } catch (error) {
      setRemoveError(getProjectError(error, "Could not remove this member. Please try again."));
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white" aria-labelledby="project-members-title">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <UsersRound size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 ref={title} id="project-members-title" tabIndex={-1} className="text-sm font-semibold text-slate-900 outline-none">Project members</h2>
            {query.data && (
              <p className="mt-0.5 text-xs text-slate-600">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            )}
          </div>
        </div>
      </header>

      {canManage && query.data && (
        <div className="border-b border-slate-100 px-5 py-4">
          {availableMembers.length === 0 ? (
            <p className="text-sm text-slate-600">Every available workspace member is already on this project.</p>
          ) : (
            <form noValidate onSubmit={submit} className="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto]">
              <div>
                <label htmlFor="project-member-user" className="mb-1.5 block text-xs font-medium text-slate-700">Workspace member</label>
                <select
                  id="project-member-user"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.user_id)}
                  aria-describedby={errors.user_id ? "project-member-user-error" : undefined}
                  className={fieldStyle}
                  {...register("user_id", { onChange: () => clearErrors("root.server") })}
                >
                  <option value="">Select a member</option>
                  {availableMembers.map((member) => (
                    <option key={member.user_id} value={member.user_id}>{displayName(member)}</option>
                  ))}
                </select>
                {errors.user_id && <p id="project-member-user-error" className="mt-1.5 text-xs text-red-700">{errors.user_id.message}</p>}
              </div>
              <div>
                <label htmlFor="project-member-role" className="mb-1.5 block text-xs font-medium text-slate-700">Project role</label>
                <select
                  id="project-member-role"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={errors.role ? "project-member-role-error" : undefined}
                  className={fieldStyle}
                  {...register("role", { onChange: () => clearErrors("root.server") })}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
                {errors.role && <p id="project-member-role-error" className="mt-1.5 text-xs text-red-700">{errors.role.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#5D4DE0] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#4F40CC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60 sm:mt-[22px]"
              >
                {isSubmitting ? <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {isSubmitting ? "Adding…" : "Add member"}
              </button>
              {errors.root?.server?.message && (
                <p role="alert" className="text-xs text-red-700 sm:col-span-3">{errors.root.server.message}</p>
              )}
            </form>
          )}
        </div>
      )}

      {notice && <p role="status" className="border-b border-slate-100 px-5 py-3 text-sm text-emerald-800">{notice}</p>}

      {query.isPending ? (
        <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading project members…</p>
      ) : (
        <>
          {query.isError && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <p role="alert" className="text-sm text-red-700">
                {getProjectError(query.error, "Could not load project members.")}
              </p>
              <button
                type="button"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
                className={secondaryButton}
              >
                <RotateCw size={15} className={query.isFetching ? "motion-safe:animate-spin" : undefined} aria-hidden="true" />
                {query.isFetching ? "Retrying…" : "Retry"}
              </button>
            </div>
          )}
          {query.data && (
            members.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-600">No project members yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100" aria-label="Project members">
                {members.map((member) => {
                  const name = displayName(member);
                  return (
                    <li key={member.user_id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                          {initials(name)}
                        </span>
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium text-slate-900">{name}</p>
                          {name !== member.user.email && <p className="break-all text-xs text-slate-500">{member.user.email}</p>}
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleStyle[member.role]}`}>{member.role}</span>
                      {canManage && (
                        <button
                          type="button"
                          aria-label={`Remove ${name}`}
                          title={`Remove ${name}`}
                          onClick={(event) => {
                            removeTrigger.current = event.currentTarget;
                            setRemoveError("");
                            setMemberToRemove(member);
                          }}
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </>
      )}

      <AlertDialog.Root
        open={canManage && memberToRemove !== null}
        onOpenChange={(open) => {
          if (!open && !removeMember.isPending) setMemberToRemove(null);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/40" />
          <AlertDialog.Content
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (removeTrigger.current?.isConnected) removeTrigger.current.focus();
              else title.current?.focus();
            }}
          >
            <AlertDialog.Title className="text-base font-semibold text-slate-900">Remove project member?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-slate-600">
              {memberToRemove && `${displayName(memberToRemove)} will be removed from the project member list.`}
            </AlertDialog.Description>
            {removeError && <p role="alert" className="mt-3 text-sm text-red-700">{removeError}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" disabled={removeMember.isPending} className={secondaryButton}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  disabled={removeMember.isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    void remove();
                  }}
                  className="min-h-9 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60"
                >
                  {removeMember.isPending ? "Removing…" : "Remove member"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
