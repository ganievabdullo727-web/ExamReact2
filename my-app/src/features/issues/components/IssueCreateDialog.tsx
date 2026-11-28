"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useProjectLabels } from "@/features/projects/labels/hooks/useProjectLabels";
import type { ProjectState } from "@/features/projects/states/api/state.api";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/useWorkspaceMembers";
import { getIssueError, issuePriorities, type CreateIssueData, type Issue } from "../api/issue.api";
import { useCreateIssue } from "../hooks/useCreateIssue";
import { useIssues } from "../hooks/useIssues";
import { createIssueSchema, issueDescriptionMaxLength, issueTitleMaxLength, toCreateIssueData, type CreateIssueFormData } from "../schemas/issue.schema";

const fieldClass = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50";
const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#594BDB] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const secondaryButton = "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";

export default function IssueCreateDialog({
  slug,
  projectId,
  projectIdentifier,
  listHref,
  states,
  parentId,
  onCreated,
}: {
  slug: string;
  projectId: string;
  projectIdentifier?: string;
  listHref: string;
  states: ProjectState[];
  parentId?: string;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const create = useCreateIssue(slug, projectId);
  const initialState = states.find((state) => state.group === "unstarted" && state.is_default)
    ?? states.find((state) => state.is_default)
    ?? states[0];

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!create.isPending) setOpen(next); }}>
      <Dialog.Trigger asChild>
        <button type="button" className={primaryButton} disabled={!initialState}>
          <Plus size={16} aria-hidden="true" /> {parentId ? "New sub-issue" : "New issue"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
          <Dialog.Title className="text-base font-semibold">{parentId ? "Create sub-issue" : "Create issue"}</Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm text-slate-600">
            {parentId ? "Add a new issue under the current issue." : "Add an issue to this project."}
          </Dialog.Description>
          <IssueForm
            slug={slug}
            projectId={projectId}
            projectIdentifier={projectIdentifier}
            initialStateId={initialState?.id ?? ""}
            states={states}
            parentId={parentId}
            onSubmit={async (values) => {
              const issue = await create.mutateAsync(values);
              setOpen(false);
              if (parentId) onCreated?.();
              else router.push(listHref + "/" + encodeURIComponent(issue.id));
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function IssueForm({
  slug,
  projectId,
  projectIdentifier,
  initialStateId,
  states,
  parentId,
  onSubmit,
}: {
  slug: string;
  projectId: string;
  projectIdentifier?: string;
  initialStateId: string;
  states: ProjectState[];
  parentId?: string;
  onSubmit: (values: CreateIssueData) => Promise<void>;
}) {
  const members = useWorkspaceMembers(slug);
  const labels = useProjectLabels(slug, projectId);
  const {
    control,
    register,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateIssueFormData>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: "",
      description: "",
      state_id: initialStateId,
      priority: "none",
      start_date: "",
      due_date: "",
      estimate_points: "",
      parent_id: "",
      assignee_ids: [],
      label_ids: [],
    },
  });
  const selectedAssignees = useWatch({ control, name: "assignee_ids" });
  const selectedLabels = useWatch({ control, name: "label_ids" });
  const submit = handleSubmit(async (values) => {
    clearErrors("root.server");
    try {
      await onSubmit(toCreateIssueData(values, parentId));
    } catch (error) {
      setError("root.server", { message: getIssueError(error, "Could not create the issue.") });
    }
  });

  return (
    <form className="mt-5 space-y-4" noValidate onSubmit={submit}>
      <fieldset disabled={isSubmitting} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="issue-title">Title</label>
          <input
            id="issue-title"
            maxLength={issueTitleMaxLength}
            placeholder="e.g. Fix keyboard navigation"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "issue-title-error" : undefined}
            className={fieldClass}
            {...register("title")}
          />
          {errors.title && <p id="issue-title-error" className="mt-1 text-sm text-red-700">{errors.title.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="issue-state">State</label>
          <select
            id="issue-state"
            className={fieldClass}
            aria-invalid={Boolean(errors.state_id)}
            aria-describedby={errors.state_id ? "issue-state-error" : undefined}
            {...register("state_id")}
          >
            <option value="" disabled>Select a state</option>
            {states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
          </select>
          {errors.state_id && <p id="issue-state-error" className="mt-1 text-sm text-red-700">{errors.state_id.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="issue-priority">Priority</label>
          <select
            id="issue-priority"
            className={fieldClass}
            aria-invalid={Boolean(errors.priority)}
            aria-describedby={errors.priority ? "issue-priority-error" : undefined}
            {...register("priority")}
          >
            {issuePriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "none" ? "No priority" : priority[0].toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          {errors.priority && <p id="issue-priority-error" className="mt-1 text-sm text-red-700">{errors.priority.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="issue-description">Description <span className="font-normal text-slate-500">(optional)</span></label>
          <textarea
            id="issue-description"
            rows={4}
            maxLength={issueDescriptionMaxLength}
            placeholder="Add details about the work"
            className={fieldClass}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "issue-description-error" : undefined}
            {...register("description")}
          />
          {errors.description && <p id="issue-description-error" className="mt-1 text-sm text-red-700">{errors.description.message}</p>}
        </div>
        {([
          { name: "start_date", label: "Start date", type: "date" },
          { name: "due_date", label: "Due date", type: "date" },
          { name: "estimate_points", label: "Estimate points", type: "number", min: 0, step: "any" },
        ] as const).map(({ name, label, ...input }) => (
          <div key={name}>
            <label className="mb-1.5 block text-sm font-medium" htmlFor={`issue-${name}`}>{label}</label>
            <input
              id={`issue-${name}`}
              className={fieldClass}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `issue-${name}-error` : undefined}
              {...input}
              {...register(name)}
            />
            {errors[name] && <p id={`issue-${name}-error`} className="mt-1 text-sm text-red-700">{errors[name]?.message}</p>}
          </div>
        ))}
        <ChoiceList
          label="Assignees"
          choices={members.data?.map(({ user_id, user }) => ({ id: user_id, name: user.display_name || user.email })) ?? []}
          selected={selectedAssignees}
          onChange={(values) => setValue("assignee_ids", values)}
          loading={members.isPending}
          error={members.isError ? getIssueError(members.error, "Could not load members.") : ""}
          retry={() => void members.refetch()}
          empty="No workspace members available."
        />
        <ChoiceList
          label="Labels"
          choices={labels.data?.map(({ id, name }) => ({ id, name })) ?? []}
          selected={selectedLabels}
          onChange={(values) => setValue("label_ids", values)}
          loading={labels.isPending}
          error={labels.isError ? getIssueError(labels.error, "Could not load labels.") : ""}
          retry={() => void labels.refetch()}
          empty="No project labels yet."
        />
        {!parentId && (
          <div className="sm:col-span-2">
            <ParentIssueField
              slug={slug}
              projectId={projectId}
              projectIdentifier={projectIdentifier}
              onChange={(value) => setValue("parent_id", value)}
              error={errors.parent_id?.message}
            />
          </div>
        )}
      </fieldset>
      {errors.root?.server?.message && <p role="alert" className="text-sm text-red-700">{errors.root.server.message}</p>}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Dialog.Close asChild>
          <button type="button" className={secondaryButton} disabled={isSubmitting}>Cancel</button>
        </Dialog.Close>
        <button type="submit" className={primaryButton} disabled={isSubmitting || states.length === 0}>
          {isSubmitting ? "Creating…" : parentId ? "Create sub-issue" : "Create issue"}
        </button>
      </div>
    </form>
  );
}

function ChoiceList({ label, choices, selected, onChange, loading, error, retry, empty }: {
  label: string;
  choices: { id: string; name: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  loading: boolean;
  error: string;
  retry: () => void;
  empty: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      {loading && <p role="status" className="text-sm text-slate-600">Loading…</p>}
      {error && <FieldError message={error} retry={retry} />}
      {!loading && !error && choices.length === 0 && <p className="text-sm text-slate-600">{empty}</p>}
      {choices.length > 0 && (
        <div className="max-h-28 space-y-1 overflow-y-auto rounded-lg border border-slate-200 px-3 py-2">
          {choices.map(({ id, name }) => (
            <label key={id} className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-indigo-600"
                checked={selected.includes(id)}
                onChange={(event) => onChange(event.currentTarget.checked ? [...selected, id] : selected.filter((value) => value !== id))}
              />
              <span className="wrap-anywhere">{name}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

function ParentIssueField({ slug, projectId, projectIdentifier, onChange, error }: {
  slug: string;
  projectId: string;
  projectIdentifier?: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const fieldId = useId();
  const searchId = useId();
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Issue | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchText.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const parents = useIssues(slug, projectId, { search });
  const options = new Map((parents.data?.pages ?? []).flatMap(({ data }) => data)
    .filter((issue) => !issue.parent_id)
    .map((issue) => [issue.id, issue] as const));
  if (selected) options.set(selected.id, selected);

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium">Parent issue</label>
      <label htmlFor={searchId} className="sr-only">Search parent issues</label>
      <input
        id={searchId}
        type="search"
        className={fieldClass}
        placeholder="Search parent issues"
        value={searchText}
        autoComplete="off"
        onChange={(event) => setSearchText(event.currentTarget.value)}
      />
      <select
        id={fieldId}
        className={fieldClass}
        value={selected?.id ?? ""}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          const next = options.get(event.currentTarget.value) ?? null;
          setSelected(next);
          onChange(next?.id ?? "");
        }}
      >
        <option value="">No parent</option>
        {[...options.values()].map((issue) => (
          <option key={issue.id} value={issue.id}>{projectIdentifier ? `${projectIdentifier}-` : "#"}{issue.sequence_id} · {issue.title}</option>
        ))}
      </select>
      {error && <p id={`${fieldId}-error`} className="text-sm text-red-700">{error}</p>}
      {parents.isPending && <p role="status" className="text-xs text-slate-600">Loading parent issues…</p>}
      {parents.isError && (
        <FieldError
          message={getIssueError(parents.error, "Could not load parent issues.")}
          retry={() => void (parents.isFetchNextPageError ? parents.fetchNextPage() : parents.refetch())}
        />
      )}
      {parents.hasNextPage && !parents.isError && (
        <button className={secondaryButton} type="button" disabled={parents.isFetching} onClick={() => void parents.fetchNextPage()}>
          {parents.isFetchingNextPage ? "Loading…" : "Load more parent issues"}
        </button>
      )}
      {parents.isSuccess && !parents.isFetching && !parents.hasNextPage && !options.size && <p className="text-xs text-slate-600">No matching parent issues.</p>}
    </div>
  );
}

function FieldError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p role="alert" className="text-sm text-red-700">{message}</p>
      <button className={secondaryButton} type="button" onClick={retry}><RotateCw size={14} aria-hidden="true" /> Try again</button>
    </div>
  );
}
