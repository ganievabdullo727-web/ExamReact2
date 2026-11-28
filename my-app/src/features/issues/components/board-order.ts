import type { Issue, UpdateIssueData } from "../api/issue.api";

export type BoardChange = {
  issue: Issue;
  patch: Pick<UpdateIssueData, "state_id" | "sort_order">;
};

const rankStep = 65_536;

function orderedBetween(ranks: number[], lower?: number, upper?: number) {
  return ranks.every((rank, index) =>
    Number.isFinite(rank)
    && rank > (index === 0 ? lower ?? -Infinity : ranks[index - 1])
    && rank < (upper ?? Infinity),
  );
}

function nextRank(rank: number, direction: 1 | -1, bits: DataView) {
  if (rank === 0) return direction * Number.MIN_VALUE;
  bits.setFloat64(0, rank);
  const value = bits.getBigUint64(0);
  const step = BigInt(1);
  bits.setBigUint64(0, value + (Math.sign(rank) === direction ? step : -step));
  return bits.getFloat64(0);
}

function ranksBetween(count: number, lower?: number, upper?: number): number[] | undefined {
  if (lower !== undefined && upper !== undefined && lower >= upper) return;

  const ranks = Array.from({ length: count }, (_, index) => {
    if (lower !== undefined && upper !== undefined) {
      const fraction = (index + 1) / (count + 1);
      return lower * (1 - fraction) + upper * fraction;
    }
    if (lower !== undefined) {
      const step = Math.max(rankStep, Math.abs(lower) * Number.EPSILON * 4);
      return lower + step * (index + 1);
    }
    if (upper !== undefined) {
      const step = Math.max(rankStep, Math.abs(upper) * Number.EPSILON * 4);
      return upper - step * (count - index);
    }
    return rankStep * index;
  });

  if (orderedBetween(ranks, lower, upper)) return ranks;

  // If rounding collapses a gap, try the adjacent representable values.
  const bits = new DataView(new ArrayBuffer(8));
  const direction = lower === undefined ? -1 : 1;
  let value = lower ?? upper ?? 0;
  const precise: number[] = [];

  for (let index = 0; index < count; index++) {
    value = nextRank(value, direction, bits);
    if (!Number.isFinite(value) || (upper !== undefined && value >= upper)) return;
    precise.push(value);
  }

  return direction === 1 ? precise : precise.reverse();
}

export function compareBoardRank(a: Issue, b: Issue) {
  if (a.sort_order !== b.sort_order) return a.sort_order < b.sort_order ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function planBoardMove(targetItems: Issue[], active: Issue, atIndex: number, stateId: string, unloadedFloor?: number): BoardChange[] {
  if (!Number.isInteger(atIndex) || atIndex < 0 || atIndex > targetItems.length || !stateId) {
    throw new Error("This issue cannot be moved to the selected position.");
  }
  if (targetItems.some(({ sort_order }) => !Number.isFinite(sort_order))) {
    throw new Error("The board contains an invalid issue position. Refresh the board and try again.");
  }

  const activeChange = (sort_order: number): BoardChange => ({
    issue: active,
    patch: { sort_order, ...(active.state_id !== stateId && { state_id: stateId }) },
  });
  const previous = targetItems[atIndex - 1];
  const next = targetItems[atIndex];
  // A later page can begin at the same rank, so keep a drop below its lower bound.
  const upper = next?.sort_order ?? unloadedFloor;
  if (Number.isFinite(active.sort_order)
    && (!previous || compareBoardRank(previous, active) < 0)
    && (next ? compareBoardRank(active, next) < 0 : upper === undefined || active.sort_order < upper)) {
    return active.state_id === stateId ? [] : [activeChange(active.sort_order)];
  }

  const desired = targetItems.slice();
  desired.splice(atIndex, 0, active);

  function changes(start: number, ranks: number[]): BoardChange[] {
    const neighbors: BoardChange[] = [];
    for (let offset = 0; offset < ranks.length; offset++) {
      const issue = desired[start + offset];
      const rank = ranks[offset];
      if (issue.id !== active.id && rank !== issue.sort_order) neighbors.push({ issue, patch: { sort_order: rank } });
    }
    return [...neighbors, activeChange(ranks[atIndex - start])];
  }

  // Equal ranks are common on new cards. Keep the first untouched card fixed
  // and expand toward the loaded prefix until there is room for the move.
  for (let start = atIndex; start >= 0; start--) {
    const ranks = ranksBetween(atIndex - start + 1, desired[start - 1]?.sort_order, upper);
    if (ranks) return changes(start, ranks);
  }

  // The prefix cannot move below the lowest finite rank. Rebalance the
  // loaded suffix without crossing a card on a later page.
  for (let end = atIndex + 1; end < desired.length; end++) {
    const ranks = ranksBetween(end - atIndex + 1, previous?.sort_order, desired[end + 1]?.sort_order ?? unloadedFloor);
    if (ranks) return changes(atIndex, ranks);
  }

  throw new Error("There is no space to store this position. Load more issues or choose another position.");
}
