import { describe, expect, it } from "vitest";
import { buildDrill, statusOf, type StatusMap } from "./drill";
import type { Word } from "./types";

function word(id: string, chapter: number, position: number): Word {
  return {
    id,
    chapter,
    hanzi: id,
    pinyin: "",
    meaning: "",
    isMeasureWord: false,
    posNote: null,
    needsCheck: false,
    position,
  };
}

const words = [
  word("e", 11, 5),
  word("a", 10, 1),
  word("c", 10, 3),
  word("b", 10, 2),
  word("d", 11, 4),
];

describe("statusOf", () => {
  it("returns none when the word has no status for the direction", () => {
    expect(statusOf({}, "a", "hanzi_to_pinyin")).toBe("none");
  });

  it("keeps each direction's status separate", () => {
    const map: StatusMap = { "a:hanzi_to_pinyin": "easy" };
    expect(statusOf(map, "a", "hanzi_to_pinyin")).toBe("easy");
    expect(statusOf(map, "a", "pinyin_to_hanzi")).toBe("none");
  });
});

describe("buildDrill", () => {
  const base = {
    direction: "hanzi_to_pinyin" as const,
    chapters: [10, 11],
    statuses: ["none", "easy", "hard"] as const,
    order: "sequential" as const,
  };

  it("orders sequentially by chapter then registration position", () => {
    const ids = buildDrill(words, {}, { ...base, statuses: [...base.statuses] });
    expect(ids).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("filters by chapter", () => {
    const ids = buildDrill(words, {}, { ...base, statuses: [...base.statuses], chapters: [11] });
    expect(ids).toEqual(["d", "e"]);
  });

  it("filters by the status of the drilled direction only", () => {
    const map: StatusMap = {
      "a:hanzi_to_pinyin": "hard",
      "b:pinyin_to_hanzi": "hard",
    };
    const ids = buildDrill(words, map, { ...base, statuses: ["hard"] });
    expect(ids).toEqual(["a"]);
  });

  it("treats a missing status as none", () => {
    const map: StatusMap = { "a:hanzi_to_pinyin": "easy" };
    const ids = buildDrill(words, map, { ...base, statuses: ["none"] });
    expect(ids).toEqual(["b", "c", "d", "e"]);
  });

  it("returns an empty drill when nothing matches", () => {
    expect(buildDrill(words, {}, { ...base, statuses: [], chapters: [10] })).toEqual([]);
  });

  it("shuffles randomly but keeps the same cards", () => {
    const ids = buildDrill(words, {}, { ...base, statuses: [...base.statuses], order: "random" }, () => 0.5);
    expect([...ids].sort()).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("is deterministic for a given random source", () => {
    const run = () => {
      let n = 0;
      const rnd = () => ((n = (n * 9301 + 49297) % 233280) / 233280) || 0.1;
      return buildDrill(words, {}, { ...base, statuses: [...base.statuses], order: "random" }, rnd);
    };
    expect(run()).toEqual(run());
  });

  it("does not mutate the input", () => {
    const copy = [...words];
    buildDrill(words, {}, { ...base, statuses: [...base.statuses], order: "random" });
    expect(words).toEqual(copy);
  });
});
