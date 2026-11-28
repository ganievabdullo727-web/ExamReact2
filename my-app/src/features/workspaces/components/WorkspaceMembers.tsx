"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Copy, Mail, Search, Trash2, UserPlus, Users } from "lucide-react";

import {
  getWorkspaceError,
  type EditableWorkspaceRole,
  type WorkspaceMember,
  type WorkspaceRole,
} from "../api/workspace.api";
import { useAddWorkspaceMember } from "../hooks/useAddWorkspaceMember";
import { useInviteWorkspaceMember } from "../hooks/useInviteWorkspaceMember";
import { useRemoveWorkspaceMember } from "../hooks/useRemoveWorkspaceMember";
import { useUpdateWorkspaceMember } from "../hooks/useUpdateWorkspaceMember";
import {
  addWorkspaceMemberSchema,
  inviteWorkspaceMemberSchema,
  type AddWorkspaceMemberFormData,
  type InviteWorkspaceMemberFormData,
} from "../schemas/workspace.schema";

type WorkspaceMembersProps = {
  slug: string;
  members: WorkspaceMember[];
  currentUserId: string;
  currentRole: WorkspaceRole;
};

const roleLabels: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  guest: "Guest",
};

const roleColors: Record<WorkspaceRole, string> = {
  owner: "border-indigo-100 bg-indigo-50 text-indigo-700",
  admin: "border-sky-100 bg-sky-50 text-sky-800",
  member: "border-slate-200 bg-slate-100 text-slate-700",
  guest: "border-slate-200 bg-white text-slate-600",
};

const fieldClass =
  "rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 aria-invalid:border-red-400 disabled:opacity-60";
const inputClass = `h-10 w-full ${fieldClass}`;
const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#483BC3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-55";
const secondaryButton =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-55";

function RoleOptions() {
  return (
    <>
      <option value="member">Member</option>
      <option value="admin">Admin</option>
      <option value="guest">Guest</option>
    </>
  );
}

function MemberActions({
  name,
  currentRole,
  busy,
  updateRole,
  remove,
}: {
  name: string;
  currentRole: EditableWorkspaceRole;
  busy: boolean;
  updateRole: (role: EditableWorkspaceRole) => Promise<unknown>;
  remove: () => Promise<unknown>;
}) {
  const [role, setRole] = useState(currentRole);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [removeError, setRemoveError] = useState("");

  async function saveRole() {
    setRoleError("");
    setSaving(true);
    try {
      await updateRole(role);
    } catch (error) {
      setRoleError(getWorkspaceError(error, "The member role could not be changed."));
    } finally {
      setSaving(false);
    }
  }

  async function removeMember() {
    setRemoveError("");
    setRemoving(true);
    try {
      await remove();
      setConfirmRemove(false);
    } catch (error) {
      setRemoveError(getWorkspaceError(error, "The member could not be removed."));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="col-span-2 space-y-2 @lg:col-span-1">
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={`Role for ${name}`}
          className={`h-9 min-w-24 ${fieldClass}`}
          disabled={busy || saving || removing}
          value={role}
          onChange={(event) => {
            setRole(event.target.value as EditableWorkspaceRole);
            setRoleError("");
          }}
        >
          <RoleOptions />
        </select>
        <button
          type="button"
          className={secondaryButton}
          disabled={busy || saving || removing || role === currentRole}
          aria-label={`Save role for ${name}`}
          onClick={() => void saveRole()}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <AlertDialog.Root
          open={confirmRemove}
          onOpenChange={(open) => {
            if (removing) return;
            setRemoveError("");
            setConfirmRemove(open);
          }}
        >
          <AlertDialog.Trigger asChild>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={busy || saving || removing}
              aria-label={`Remove ${name}`}
              title={`Remove ${name}`}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/50" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <AlertDialog.Title className="text-lg font-semibold text-slate-900">
                Remove member?
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm leading-relaxed text-slate-600">
                {name} will lose access to this workspace.
              </AlertDialog.Description>
              {removeError && <p role="alert" className="text-sm text-red-700">{removeError}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                <AlertDialog.Cancel asChild>
                  <button type="button" className={secondaryButton} disabled={removing}>
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <button
                  type="button"
                  className="min-h-9 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-55"
                  disabled={removing}
                  onClick={() => void removeMember()}
                >
                  {removing ? "Removing…" : "Remove member"}
                </button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
      {roleError && <p role="alert" className="text-sm text-red-700">{roleError}</p>}
    </div>
  );
}

function AddWorkspaceMemberForm({ slug, onAdded }: { slug: string; onAdded: () => void }) {
  const addMutation = useAddWorkspaceMember(slug);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddWorkspaceMemberFormData>({
    resolver: zodResolver(addWorkspaceMemberSchema),
    defaultValues: { user_id: "", role: "member" },
  });

  const onSubmit = (data: AddWorkspaceMemberFormData) => {
    addMutation.mutate(data, { onSuccess: () => {
      reset();
      onAdded();
    } });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <label htmlFor="add-workspace-user" className="block text-sm font-medium text-slate-800">
          User ID
        </label>
        <input
          id="add-workspace-user"
          {...register("user_id")}
          className={inputClass}
          placeholder="Existing account UUID"
          autoComplete="off"
          aria-invalid={Boolean(errors.user_id)}
          aria-describedby={errors.user_id ? "add-workspace-user-error" : undefined}
        />
        {errors.user_id && (
          <p id="add-workspace-user-error" className="text-sm text-red-700">{errors.user_id.message}</p>
        )}
      </div>
      <label className="block space-y-2 text-sm font-medium text-slate-800">
        <span>Role</span>
        <select {...register("role")} className={inputClass}><RoleOptions /></select>
      </label>
      <button className={`${primaryButton} w-full`} type="submit" disabled={addMutation.isPending}>
        <UserPlus size={16} aria-hidden="true" />
        {addMutation.isPending ? "Adding…" : "Add member"}
      </button>
      {addMutation.isError && (
        <p role="alert" className="text-sm text-red-700">
          {getWorkspaceError(addMutation.error, "The member could not be added.")}
        </p>
      )}
    </form>
  );
}

function WorkspaceInviteForm({ slug }: { slug: string }) {
  const inviteMutation = useInviteWorkspaceMember(slug);
  const linkInput = useRef<HTMLInputElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const invitationUrl = inviteMutation.data
    ? new URL(`/invites/${encodeURIComponent(inviteMutation.data.token)}`, window.location.origin).href
    : "";
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteWorkspaceMemberFormData>({
    resolver: zodResolver(inviteWorkspaceMemberSchema),
    defaultValues: { email: "", role: "member" },
  });

  const onSubmit = (data: InviteWorkspaceMemberFormData) => {
    setCopyMessage("");
    inviteMutation.mutate({ email: data.email, role: data.role }, { onSuccess: () => reset() });
  };

  async function copyInvitation() {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopyMessage("Invitation link copied.");
    } catch {
      linkInput.current?.focus();
      linkInput.current?.select();
      setCopyMessage("The link is selected. Copy it using your keyboard.");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <label htmlFor="invite-workspace-email" className="block text-sm font-medium text-slate-800">
          Email address
        </label>
        <input
          id="invite-workspace-email"
          {...register("email")}
          className={inputClass}
          type="email"
          placeholder="name@example.com"
          autoComplete="off"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "invite-workspace-email-error" : undefined}
        />
        {errors.email && (
          <p id="invite-workspace-email-error" className="text-sm text-red-700">{errors.email.message}</p>
        )}
      </div>
      <label className="block space-y-2 text-sm font-medium text-slate-800">
        <span>Role</span>
        <select {...register("role")} className={inputClass}><RoleOptions /></select>
      </label>
      <button className={`${primaryButton} w-full`} type="submit" disabled={inviteMutation.isPending}>
        <Mail size={16} aria-hidden="true" />
        {inviteMutation.isPending ? "Creating…" : "Create invitation"}
      </button>
      {inviteMutation.isError && (
        <p role="alert" className="text-sm text-red-700">
          {getWorkspaceError(inviteMutation.error, "The invitation could not be created.")}
        </p>
      )}
      {inviteMutation.isSuccess && (
        <div className="space-y-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
          <p role="status" className="break-all text-sm font-semibold text-indigo-800">
            Invitation created for {inviteMutation.data.email}.
          </p>
          <p className="text-xs text-slate-600">Share this link only with the intended recipient.</p>
          <label htmlFor="workspace-invite-link" className="block text-xs font-medium text-slate-800">
            Invitation link
          </label>
          <div className="flex items-center gap-2">
            <input
              id="workspace-invite-link"
              ref={linkInput}
              className={`${inputClass} min-w-0`}
              value={invitationUrl}
              readOnly
            />
            <button
              type="button"
              className={secondaryButton}
              aria-label="Copy invitation link"
              title="Copy invitation link"
              onClick={() => void copyInvitation()}
            >
              <Copy size={16} aria-hidden="true" />
            </button>
          </div>
          {copyMessage && <p role="status" className="text-xs text-indigo-800">{copyMessage}</p>}
        </div>
      )}
    </form>
  );
}

export default function WorkspaceMembers({ slug, members, currentUserId, currentRole }: WorkspaceMembersProps) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<"invite" | "add">("invite");
  const [success, setSuccess] = useState("");
  const updateMutation = useUpdateWorkspaceMember(slug);
  const removeMutation = useRemoveWorkspaceMember(slug);
  const canManage = currentRole === "owner" || currentRole === "admin";
  const query = search.trim().toLowerCase();
  const filteredMembers = members.filter((member) =>
    [member.user?.display_name, member.user?.email, member.user_id, member.role]
      .some((value) => value?.toLowerCase().includes(query)),
  );

  return (
    <div className="space-y-5 text-slate-900">
      {success && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </p>
      )}
      <div className={canManage ? "grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]" : ""}>
        <section aria-labelledby="member-directory" className="@container min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-5">
            <div>
              <h2 id="member-directory" className="font-semibold text-slate-900">Directory</h2>
              <p className="mt-0.5 text-xs text-slate-600">{members.length} {members.length === 1 ? "member" : "members"}</p>
            </div>
            <label className="relative block w-full @lg:w-60">
              <span className="sr-only">Search members</span>
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute top-3 left-3 text-slate-500" />
              <input
                type="search"
                className={`${inputClass} pl-9`}
                placeholder="Search members"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-11 text-center">
              <span className="rounded-lg bg-slate-100 p-2.5 text-slate-600"><Users size={18} aria-hidden="true" /></span>
              <p className="font-semibold">{query ? "No matching members" : "No members to show"}</p>
              {query && (
                <button className={secondaryButton} type="button" onClick={() => setSearch("")}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const name = member.user?.display_name || member.user?.email || member.user_id;
                const initials = name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
                return (
                  <li key={member.user_id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-slate-50/70 sm:px-5 @lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <div className="flex min-w-0 items-center gap-3">
                      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-800">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="wrap-anywhere text-sm font-semibold text-slate-900">
                          {name}
                          {member.user_id === currentUserId && <span className="ml-1 font-normal text-slate-600">(you)</span>}
                        </p>
                        {member.user?.email && name !== member.user.email && (
                          <p className="mt-0.5 wrap-anywhere text-xs text-slate-600">{member.user.email}</p>
                        )}
                      </div>
                    </div>
                    <span className={`justify-self-end rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleColors[member.role]}`}>
                      {roleLabels[member.role]}
                    </span>
                    {canManage && member.user_id !== currentUserId && member.role !== "owner" && (
                      <MemberActions
                        key={member.role}
                        name={name}
                        currentRole={member.role}
                        busy={updateMutation.isPending || removeMutation.isPending}
                        updateRole={async (role) => {
                          setSuccess("");
                          await updateMutation.mutateAsync({ userId: member.user_id, role });
                          setSuccess(`Role updated for ${name}.`);
                        }}
                        remove={async () => {
                          setSuccess("");
                          await removeMutation.mutateAsync(member.user_id);
                          setSuccess(`${name} was removed from the workspace.`);
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        {canManage && (
          <section aria-labelledby="add-people" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
            <h2 id="add-people" className="font-semibold text-slate-900">Add people</h2>
            <div role="group" aria-label="How to add people" className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                aria-pressed={action === "invite"}
                className={`rounded-md px-2 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-indigo-600 ${action === "invite" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"}`}
                onClick={() => setAction("invite")}
              >
                By email
              </button>
              <button
                type="button"
                aria-pressed={action === "add"}
                className={`rounded-md px-2 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-indigo-600 ${action === "add" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"}`}
                onClick={() => setAction("add")}
              >
                Existing user
              </button>
            </div>
            <div hidden={action !== "invite"}>
              <WorkspaceInviteForm slug={slug} />
            </div>
            <div hidden={action !== "add"}>
              <AddWorkspaceMemberForm slug={slug} onAdded={() => setSuccess("Member added to the workspace.")} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
