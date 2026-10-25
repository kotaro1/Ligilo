import type { Direction, DrillConditions, Status, Word } from "./types";

/** Keyed by `${wordId}:${direction}`; a missing key means status "none". */
export type StatusMap = Record<string, Status>;

export function statusKey(wordId: string, direction: Direction): string {
  return `${wordId}:${direction}`;
}

export function statusOf(
  map: StatusMap,
  wordId: string,
  direction: Direction,
): Status {
  return map[statusKey(wordId, direction)] ?? "none";
}

/** Fisher-Yates on a copy; `random` is injectable so tests can pin the order. */
function shuffled<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Returns the ordered word ids for a drill (出題). */
export function buildDrill(
  words: Word[],
  statuses: StatusMap,
  conditions: DrillConditions,
  random: () => number = Math.random,
): string[] {
  const matching = words
    .filter(
      (w) =>
        conditions.chapters.includes(w.chapter) &&
        conditions.statuses.includes(
          statusOf(statuses, w.id, conditions.direction),
        ),
    )
    .sort((a, b) => a.chapter - b.chapter || a.position - b.position);

  const ordered =
    conditions.order === "random" ? shuffled(matching, random) : matching;
  return ordered.map((w) => w.id);
}
