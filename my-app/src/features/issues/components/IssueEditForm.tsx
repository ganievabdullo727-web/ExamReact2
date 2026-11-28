"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import type { ProjectState } from "@/features/projects/states/api/state.api";
import { getIssueError, issuePriorities, type Issue } from "../api/issue.api";
import { useIssue } from "../hooks/useIssue";
import { useIssues } from "../hooks/useIssues";
import {
  issueDescriptionMaxLength,
  issueTitleMaxLength,
  issueToEditForm,
  updateIssueSchema,
  type UpdateIssueFormData,
} from "../schemas/issue.schema";

const labelClass = "mb-1.5 block text-sm font-medium";
const fieldClass = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-500 disabled:bg-slate-50";
const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const primaryButton = "inline-flex min-h-10 items-center justify-center rounded-lg bg-[#594BDB] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#473BC5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const planningFields = [
  { name: "start_date", label: "Start date", type: "date" },
  { name: "due_date", label: "Due date", type: "date" },
  { name: "estimate_points", label: "Estimate points", type: "number", min: 0, step: "any" },
  { name: "sort_order", label: "Sort order", type: "number", step: "any" },
] as const;

type IssueScope = {
  slug: string;
  projectId: string;
  projectIdentifier: string;
  issue: Issue;
};

export default function IssueEditForm({
  slug,
  projectId,
  projectIdentifier,
  issue,
  states,
  onSubmit,
}: IssueScope & {
  states: ProjectState[];
  onSubmit: (values: UpdateIssueFormData, original: Issue) => Promise<void>;
}) {
  const [original] = useState(issue);
  const {
    register,
    control,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateIssueFormData>({
    resolver: zodResolver(updateIssueSchema),
    defaultValues: issueToEditForm(original),
  });
  const parentId = useWatch({ control, name: "parent_id" });
  const submit = handleSubmit(async (values) => {
    clearErrors("root.server");
    try {
      await onSubmit(values, original);
    } catch (error) {
      setError("root.server", { message: getIssueError(error, "Could not update the issue.") });
    }
  });

  return (
    <form className="mt-5 space-y-4" noValidate onSubmit={submit}>
      <fieldset disabled={isSubmitting} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="edit-issue-title">Title</label>
          <input
            id="edit-issue-title"
            className={fieldClass}
            maxLength={issueTitleMaxLength}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "edit-issue-title-error" : undefined}
            {...register("title")}
          />
          {errors.title && <p id="edit-issue-title-error" className="mt-1 text-sm text-red-700">{errors.title.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-issue-state">State</label>
          <select
            id="edit-issue-state"
            className={fieldClass}
            aria-invalid={Boolean(errors.state_id)}
            aria-describedby={errors.state_id ? "edit-issue-state-error" : undefined}
            {...register("state_id")}
          >
            {!states.some((state) => state.id === original.state_id) &&
              <option value={original.state_id}>Current state</option>}
            {states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
          </select>
          {errors.state_id && <p id="edit-issue-state-error" className="mt-1 text-sm text-red-700">{errors.state_id.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-issue-priority">Priority</label>
          <select
            id="edit-issue-priority"
            className={fieldClass}
            aria-invalid={Boolean(errors.priority)}
            aria-describedby={errors.priority ? "edit-issue-priority-error" : undefined}
            {...register("priority")}
          >
            {issuePriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "none" ? "No priority" : priority[0].toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          {errors.priority && <p id="edit-issue-priority-error" className="mt-1 text-sm text-red-700">{errors.priority.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="edit-issue-description">Description</label>
          <textarea
            id="edit-issue-description"
            rows={4}
            className={fieldClass}
            maxLength={issueDescriptionMaxLength}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "edit-issue-description-error" : undefined}
            {...register("description")}
          />
          {errors.description && <p id="edit-issue-description-error" className="mt-1 text-sm text-red-700">{errors.description.message}</p>}
        </div>
        {planningFields.map(({ name, label, ...input }) => {
          const id = "edit-issue-" + name.replace("_", "-");
          const error = errors[name];
          return (
            <div key={name}>
              <label className={labelClass} htmlFor={id}>{label}</label>
              <input
                id={id}
                className={fieldClass}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? id + "-error" : undefined}
                {...input}
                {...register(name)}
              />
              {error && <p id={id + "-error"} className="mt-1 text-sm text-red-700">{error.message}</p>}
            </div>
          );
        })}
        <div className="sm:col-span-2">
          <input type="hidden" {...register("parent_id")} />
          <IssueParentField
            slug={slug}
            projectId={projectId}
            projectIdentifier={projectIdentifier}
            issue={original}
            value={parentId}
            error={errors.parent_id?.message}
            onChange={(value) => setValue("parent_id", value, { shouldDirty: true, shouldValidate: true })}
          />
        </div>
      </fieldset>
      {errors.root?.server?.message && <p role="alert" className="text-sm text-red-700">{errors.root.server.message}</p>}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Dialog.Close asChild>
          <button type="button" className={secondaryButton} disabled={isSubmitting}>Cancel</button>
        </Dialog.Close>
        <button type="submit" data-issue-action="save" className={primaryButton} disabled={!isDirty || isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function IssueParentField({
  slug,
  projectId,
  projectIdentifier,
  issue,
  value,
  error,
  onChange,
}: IssueScope & {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchText.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const children = useIssues(slug, projectId, { parent_id: issue.id });
  const hasChildren = children.data?.pages.some((page) => page.data.length > 0) ?? false;
  const canChooseParent = Boolean(children.data) && !hasChildren;
  const candidates = useIssues(slug, canChooseParent ? projectId : "", { search });
  const selected = useIssue(slug, projectId, value);
  const options = new Map(
    (candidates.data?.pages ?? []).flatMap((page) => page.data)
      .filter((item) => !item.parent_id && item.id !== issue.id)
      .map((item) => [item.id, item] as const),
  );
  const currentOption = selected.data;
  if (currentOption && !currentOption.parent_id && currentOption.id !== issue.id) {
    options.set(currentOption.id, currentOption);
  }
  const availableOptions = canChooseParent ? Array.from(options.values()) : [];
  const showPlaceholderOption = Boolean(value && !availableOptions.some((item) => item.id === value));
  const queryError = !children.data && children.error ? children.error : canChooseParent ? candidates.error : null;

  return (
    <>
      <label className={labelClass} htmlFor="edit-issue-parent">Parent issue</label>
      {canChooseParent && (
        <>
          <label htmlFor="edit-issue-parent-search" className="sr-only">Search parent issues</label>
          <input
            id="edit-issue-parent-search"
            type="search"
            className={fieldClass + " mb-2"}
            autoComplete="off"
            placeholder="Search parent issues"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </>
      )}
      <select
        id="edit-issue-parent"
        className={fieldClass}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "edit-issue-parent-error" : "edit-issue-parent-help"}
        disabled={children.isPending && !value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">No parent</option>
        {showPlaceholderOption && <option value={value}>{currentOption?.title ?? "Current parent"}</option>}
        {availableOptions.map((item) => (
          <option key={item.id} value={item.id}>{projectIdentifier}-{item.sequence_id} · {item.title}</option>
        ))}
      </select>
      <p id="edit-issue-parent-help" className="mt-1.5 text-xs text-slate-600">
        {hasChildren
          ? "This issue has sub-issues, so it cannot have a parent."
          : children.isPending ? "Checking available parent issues…" : "Choose an issue that does not already have a parent."}
      </p>
      {error && <p id="edit-issue-parent-error" className="mt-1 text-sm text-red-700">{error}</p>}
      {queryError && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p role="alert" className="text-xs text-red-700">{getIssueError(queryError, "Could not load parent issues.")}</p>
          <button
            type="button"
            className={secondaryButton}
            disabled={children.isFetching || candidates.isFetching}
            onClick={() => void (!children.data ? children.refetch() : candidates.isFetchNextPageError ? candidates.fetchNextPage() : candidates.refetch())}
          >
            <RotateCw size={14} aria-hidden="true" /> Try again
          </button>
        </div>
      )}
      {canChooseParent && candidates.hasNextPage && !candidates.isFetchNextPageError && (
        <button
          type="button"
          className={secondaryButton + " mt-2"}
          disabled={candidates.isFetching}
          onClick={() => void candidates.fetchNextPage()}
        >
          {candidates.isFetchingNextPage ? "Loading…" : "Load more parent issues"}
        </button>
      )}
    </>
  );
}
