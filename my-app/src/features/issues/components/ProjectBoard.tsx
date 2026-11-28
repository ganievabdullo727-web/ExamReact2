"use client";

import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, pointerWithin,
  useDndContext, useDroppable, useSensor, useSensors, type CollisionDetection, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpRight, GripVertical, Kanban, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { stateGroups, type ProjectState, type StateGroup } from "@/features/projects/states/api/state.api";
import { useProjectStates } from "@/features/projects/states/hooks/useProjectStates";
import { getIssueError, type Issue } from "../api/issue.api";
import { useIssues } from "../hooks/useIssues";
import { boardIssueFilters, useMoveBoardIssue } from "../hooks/useMoveBoardIssue";
import { compareBoardRank, planBoardMove, type BoardChange } from "./board-order";

const groupInfo: Record<StateGroup | "unavailable", { label: string; tone: string }> = {
  backlog: { label: "Backlog", tone: "bg-slate-400" },
  unstarted: { label: "Unstarted", tone: "bg-sky-500" },
  started: { label: "Started", tone: "bg-indigo-500" },
  completed: { label: "Completed", tone: "bg-emerald-500" },
  cancelled: { label: "Cancelled", tone: "bg-slate-600" },
  unavailable: { label: "State unavailable", tone: "bg-amber-500" },
};
const actionButton = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50";
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });
const cardClass = "rounded-lg border border-slate-200 bg-white p-3";
type BoardProps = { slug: string; projectId: string; projectIdentifier: string; canManage: boolean };
type Column = StateGroup | "unavailable";

const boardCollisions: CollisionDetection = (args) => {
  if (!args.pointerCoordinates) return closestCorners(args);
  const hits = pointerWithin(args);
  const card = hits.find(({ id }) => args.droppableContainers.find((item) => item.id === id)?.data.current?.kind === "card");
  return card ? [card] : hits;
};

function droppedBelow({ activatorEvent, delta, active, over }: DragEndEvent) {
  if (!over) return false;
  const rect = active.rect.current.translated;
  const center = "clientY" in activatorEvent && typeof activatorEvent.clientY === "number"
    ? activatorEvent.clientY + delta.y
    : rect && rect.top + rect.height / 2;
  return center !== null && center > over.rect.top + over.rect.height / 2;
}

export default function ProjectBoard({ slug, projectId, projectIdentifier, canManage }: BoardProps) {
  const boardId = useId();
  const issueQuery = useIssues(slug, projectId, boardIssueFilters);
  const statesQuery = useProjectStates(slug, projectId);
  const move = useMoveBoardIssue(slug, projectId);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState("");
  const stateControls = useRef(new Map<string, HTMLSelectElement>());
  const restoreFocus = useRef<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const listHref = `/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues`;
  const states = (statesQuery.data ?? []).slice().sort((a, b) => a.order - b.order || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const stateById = new Map(states.map((state) => [state.id, state]));
  const issues = Array.from(new Map(
    issueQuery.data?.pages.flatMap((page) => page.data.map((issue) => [issue.id, issue] as const)),
  ).values()).sort(compareBoardRank);
  const groups: Column[] = [...stateGroups];
  if (issues.some((issue) => !stateById.has(issue.state_id))) groups.push("unavailable");
  const issueGroup = (issue: Issue): Column => stateById.get(issue.state_id)?.group ?? "unavailable";
  const groupIssues = (group: Column) => issues.filter((issue) => issueGroup(issue) === group);
  const defaultState = (group: Column) => states.find((state) => state.group === group && state.is_default)
    ?? states.find((state) => state.group === group);
  const dragSource = issues.find((issue) => issue.id === draggedId);
  const loading = statesQuery.isPending || issueQuery.isPending;
  const allowMove = canManage && !move.isPending && !issueQuery.isFetchingNextPage && states.length > 0;
  const unloadedFloor = issueQuery.hasNextPage ? issues.at(-1)?.sort_order : undefined;

  useEffect(() => {
    if ((!move.isError && !move.isSuccess) || !restoreFocus.current) return;
    stateControls.current.get(restoreFocus.current)?.focus();
    restoreFocus.current = null;
  }, [move.isError, move.isSuccess, move.submittedAt]);

  function saveMove(issue: Issue, position: { group: Column; index: number; stateId: string } | { stateId: string }, focus = false) {
    if (!allowMove) return;
    setOrderError("");
    try {
      const changes: BoardChange[] = "group" in position
        ? planBoardMove(
          groupIssues(position.group).filter((item) => item.id !== issue.id),
          issue,
          position.index,
          position.stateId,
          unloadedFloor,
        )
        : [{ issue, patch: { state_id: position.stateId } }];
      if (!changes.length) return;
      restoreFocus.current = focus ? issue.id : null;
      move.mutate({ issueId: issue.id, changes });
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Could not save the issue position.");
    }
  }

  function moveToState(issue: Issue, stateId: string) {
    const state = stateById.get(stateId);
    if (!state || issue.state_id === stateId) return;
    saveMove(issue, issueGroup(issue) === state.group
      ? { stateId }
      : { group: state.group, index: groupIssues(state.group).length, stateId }, true);
  }

  function finishDrag(event: DragEndEvent) {
    setDraggedId(null);
    const { active, over } = event;
    if (!allowMove || !over || active.id === over.id) return;
    const issue = issues.find((item) => item.id === active.id);
    const group = over.data.current?.group as Column | undefined;
    const hovered = issues.find((item) => item.id === over.id);
    if (!issue || !group) return;

    const currentGroup = issueGroup(issue);
    const lane = groupIssues(group);
    const targetState = group === currentGroup ? stateById.get(issue.state_id)
      : hovered ? stateById.get(hovered.state_id) : defaultState(group);
    if (!targetState) return;

    const targetIndex = hovered ? lane.findIndex((item) => item.id === hovered.id) : -1;
    const originalIndex = lane.findIndex((item) => item.id === issue.id);
    const index = targetIndex < 0 ? lane.length - Number(originalIndex >= 0)
      : originalIndex >= 0 ? targetIndex
      : targetIndex + Number(droppedBelow(event));
    if (originalIndex === index) return;
    saveMove(issue, { group, index, stateId: targetState.id });
  }

  return (
    <section aria-labelledby="project-board-title" className="min-w-0 rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <Kanban size={18} aria-hidden="true" />
          </span>
          <h2 id="project-board-title" className="text-sm font-semibold text-slate-900">Board</h2>
        </div>
        {canManage && states.length > 0 && <p className="text-xs text-slate-600">Drag a card to change its order or state.</p>}
      </header>
      {statesQuery.isError && (
        <BoardError error={statesQuery.error} fallback="Could not load project states." busy={statesQuery.isFetching} retry={() => void statesQuery.refetch()} />
      )}
      {issueQuery.isError && (
        <BoardError
          error={issueQuery.error}
          fallback={issueQuery.isFetchNextPageError ? "Could not load more issues." : "Could not load issues."}
          busy={issueQuery.isFetching}
          retry={() => void (issueQuery.isFetchNextPageError ? issueQuery.fetchNextPage() : issueQuery.refetch())}
        />
      )}
      {orderError && <p role="alert" className="border-b border-slate-100 px-5 py-3 text-sm text-red-700">{orderError}</p>}
      {!orderError && move.isError && (
        <p role="alert" className="border-b border-slate-100 px-5 py-3 text-sm text-red-700">{getIssueError(move.error, "Could not save the issue move. Try again.")}</p>
      )}
      {move.isPending && <p role="status" className="px-5 pt-2 text-xs text-slate-600">Saving board…</p>}
      {move.isSuccess && <p role="status" className="sr-only">Issue position saved.</p>}
      {loading && <p role="status" className="px-5 py-6 text-sm text-slate-600">Loading board…</p>}
      {!loading && issueQuery.data && statesQuery.data && (
        <DndContext
          id={boardId}
          sensors={sensors}
          collisionDetection={boardCollisions}
          onDragStart={({ active }) => { setOrderError(""); setDraggedId(String(active.id)); }}
          onDragCancel={() => setDraggedId(null)}
          onDragEnd={finishDrag}
        >
          <div
            role="region"
            aria-label="Board columns"
            tabIndex={0}
            aria-busy={issueQuery.isFetching || move.isPending}
            className="flex items-stretch gap-3 overflow-x-auto px-4 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500"
          >
            {groups.map((group) => {
              const target = defaultState(group);
              const cards = groupIssues(group);
              return (
                <BoardLane key={group} group={group} cards={cards} canDrop={allowMove && Boolean(target)} hasStates={Boolean(target)}>
                  {cards.map((issue) => (
                    <BoardCard
                      key={issue.id}
                      group={group}
                      issue={issue}
                      issueHref={`${listHref}/${encodeURIComponent(issue.id)}`}
                      issueKey={`${projectIdentifier}-${issue.sequence_id}`}
                      state={stateById.get(issue.state_id)}
                      states={states}
                      canManage={canManage}
                      allowMove={allowMove}
                      onSelect={(stateId) => moveToState(issue, stateId)}
                      rememberControl={(element) => {
                        if (element) stateControls.current.set(issue.id, element);
                        else stateControls.current.delete(issue.id);
                      }}
                    />
                  ))}
                </BoardLane>
              );
            })}
          </div>
          <DragOverlay dropAnimation={null}>
            {dragSource && (
              <div className={cardClass + " cursor-grabbing border-indigo-300 shadow-lg"} aria-hidden="true">
                <span className="font-mono text-xs font-medium text-indigo-700">{projectIdentifier}-{dragSource.sequence_id}</span>
                <p className="mt-1.5 wrap-anywhere text-sm font-medium text-slate-900">{dragSource.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
      {issueQuery.hasNextPage && !issueQuery.isFetchNextPageError && (
        <div className="flex justify-center border-t border-slate-100 px-5 py-3">
          <button type="button" className={actionButton} disabled={issueQuery.isFetching || move.isPending || Boolean(draggedId)} onClick={() => void issueQuery.fetchNextPage()}>
            {issueQuery.isFetchingNextPage ? "Loading…" : "Load more issues"}
          </button>
        </div>
      )}
    </section>
  );
}

function BoardLane({ group, cards, canDrop, hasStates, children }: {
  group: Column; cards: Issue[]; canDrop: boolean; hasStates: boolean; children: ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: `column:${group}`, disabled: !canDrop, data: { group, kind: "column" } });
  const { over } = useDndContext();
  const highlighted = canDrop && over?.data.current?.group === group;
  return (
    <section ref={setNodeRef} aria-labelledby={`board-column-${group}`} data-state-group={group}
      className={`flex min-h-52 w-[min(72vw,14rem)] shrink-0 flex-col rounded-xl border transition-colors ${highlighted ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}>
      <header className="flex items-center justify-between gap-2 border-b border-slate-200/80 px-3 py-3.5">
        <h3 id={`board-column-${group}`} className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${groupInfo[group].tone}`} />
          {groupInfo[group].label}
        </h3>
        <span className="rounded-md bg-white px-1.5 py-0.5 text-xs font-medium text-slate-600 tabular-nums">{cards.length}</span>
      </header>
      {!cards.length && <p className="px-3 py-3.5 text-xs text-slate-600">{hasStates ? "No issues" : "No states in this group"}</p>}
      <SortableContext items={cards.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-1 flex-col gap-2 p-2" aria-label={groupInfo[group].label}>{children}</ul>
      </SortableContext>
    </section>
  );
}

function BoardError({ error, fallback, busy, retry }: { error: unknown; fallback: string; busy: boolean; retry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
      <p role="alert" className="text-sm text-red-700">{getIssueError(error, fallback)}</p>
      <button type="button" className={actionButton} disabled={busy} onClick={retry}>
        <RotateCw size={15} aria-hidden="true" /> {busy ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

function BoardCard({ group, issue, issueHref, issueKey, state, states, canManage, allowMove, onSelect, rememberControl }: {
  group: Column;
  issue: Issue;
  issueHref: string;
  issueKey: string;
  state: ProjectState | undefined;
  states: ProjectState[];
  canManage: boolean;
  allowMove: boolean;
  onSelect: (stateId: string) => void;
  rememberControl: (element: HTMLSelectElement | null) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
    data: { group, kind: "card" },
    disabled: { draggable: !allowMove, droppable: !allowMove || group === "unavailable" },
  });
  const dueDate = issue.due_date ? new Date(issue.due_date) : null;

  return (
    <li ref={setNodeRef} data-board-issue={issue.id} className={cardClass + (isDragging ? " opacity-40" : "")}
      style={{ transform: CSS.Transform.toString(transform), transition }}>
      <div className="relative">
        <Link href={issueHref} draggable={false} className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
          <span className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-medium text-indigo-700">{issueKey}</span>
            {!canManage && <ArrowUpRight size={15} aria-hidden="true" className="text-slate-400 group-hover:text-indigo-700" />}
          </span>
          <span className="mt-1.5 block wrap-anywhere text-sm font-medium text-slate-900 group-hover:text-indigo-700">{issue.title}</span>
        </Link>
        {canManage && (
          <button
            {...attributes}
            {...listeners}
            ref={setActivatorNodeRef}
            type="button"
            aria-label={`Drag ${issueKey}`}
            disabled={!allowMove}
            className="absolute right-0 -top-1 grid size-6 touch-none cursor-grab place-items-center rounded-sm text-slate-400 hover:bg-slate-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GripVertical size={15} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600">
        {issue.priority !== "none" && <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize">{issue.priority} priority</span>}
        {dueDate && !Number.isNaN(dueDate.valueOf()) && <time dateTime={issue.due_date ?? undefined}>{dateFormat.format(dueDate)}</time>}
      </div>
      {canManage ? (
        <select
          ref={rememberControl}
          aria-label={`Move ${issueKey} to state`}
          value={issue.state_id}
          onChange={(event) => onSelect(event.currentTarget.value)}
          disabled={!allowMove}
          className="mt-2 min-h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
        >
          {!state && <option value={issue.state_id} disabled>State unavailable</option>}
          {states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      ) : (
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700">
          {state && <span aria-hidden="true" className="size-2 shrink-0 rounded-full border border-slate-900/15" style={{ backgroundColor: state.color }} />}
          {state?.name ?? "State unavailable"}
        </span>
      )}
    </li>
  );
}
