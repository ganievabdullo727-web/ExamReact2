import { api } from "@/shared/api/client";

export type PlanningKind = "cycle" | "module";
export type PlanningIssuePriority = "none" | "low" | "medium" | "high" | "urgent";

export type PlanningIssue = {
  id: string;
  sequence_id: number;
  title: string;
  state_id: string;
  priority: PlanningIssuePriority;
  created_at: string;
};

export type PlanningIssuePage = { data: PlanningIssue[]; next_cursor: string | null };
export type PlanningContainer = { kind: PlanningKind; id: string };

type PageFilters = {
  cursor?: string;
  search?: string;
  container?: PlanningContainer;
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
};

export const getPlanningIssues = async (
  slug: string,
  projectId: string,
  filters: PageFilters,
  signal?: AbortSignal,
): Promise<PlanningIssuePage> => {
  const path = `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}/issues/`;
  const { data } = await api.get<PlanningIssuePage>(path, {
    signal,
    params: {
      limit: filters.limit ?? 25,
      sort_by: "created_at",
      order: "desc",
      cursor: filters.cursor,
      search: filters.search || undefined,
      created_after: filters.createdAfter,
      created_before: filters.createdBefore,
      ...(filters.container ? { [filters.container.kind]: filters.container.id } : {}),
    },
  });
  return data;
};

export const getAvailablePlanningIssues = async (
  slug: string,
  projectId: string,
  container: PlanningContainer,
  search: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<PlanningIssuePage> => {
  const page = await getPlanningIssues(slug, projectId, { search, cursor }, signal);
  if (page.data.length === 0) return page;

  // The list response omits cycle/module membership. Check only the creation-time window
  // covered by this page, which still includes any issues tied at its boundaries.
  const availableIds = new Set(page.data.map(({ id }) => id));
  const createdBefore = page.data[0]?.created_at;
  const createdAfter = page.data.at(-1)?.created_at;
  const seen = new Set<string>();
  let linkedCursor: string | undefined;

  do {
    const linked = await getPlanningIssues(slug, projectId, {
      container,
      cursor: linkedCursor,
      search,
      createdAfter,
      createdBefore,
      limit: 100,
    }, signal);
    linked.data.forEach(({ id }) => availableIds.delete(id));
    linkedCursor = linked.next_cursor ?? undefined;
    if (linkedCursor && seen.has(linkedCursor)) {
      throw new Error("The linked issue cursor was repeated.");
    }
    if (linkedCursor) seen.add(linkedCursor);
  } while (linkedCursor && availableIds.size > 0);

  return { data: page.data.filter(({ id }) => availableIds.has(id)), next_cursor: page.next_cursor };
};
