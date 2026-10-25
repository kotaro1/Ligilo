"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { buildDrill, statusKey, type StatusMap } from "@/lib/drill";
import type {
  Direction,
  DrillConditions,
  DrillProgress,
  Status,
  Word,
} from "@/lib/types";

interface WordRow {
  id: string;
  chapter: number;
  hanzi: string;
  pinyin: string;
  meaning: string;
  is_measure_word: boolean;
  pos_note: string | null;
  needs_check: boolean;
  position: number;
}

interface ProgressRow {
  direction: Direction;
  chapters: number[];
  statuses: Status[];
  order_mode: DrillConditions["order"];
  word_ids: string[];
  index: number;
}

function toWord(r: WordRow): Word {
  return {
    id: r.id,
    chapter: r.chapter,
    hanzi: r.hanzi,
    pinyin: r.pinyin,
    meaning: r.meaning,
    isMeasureWord: r.is_measure_word,
    posNote: r.pos_note,
    needsCheck: r.needs_check,
    position: r.position,
  };
}

function toProgress(r: ProgressRow): DrillProgress {
  return {
    direction: r.direction,
    chapters: r.chapters,
    statuses: r.statuses,
    order: r.order_mode,
    wordIds: r.word_ids,
    index: r.index,
  };
}

export type WordEdit = Partial<Pick<Word, "pinyin" | "meaning" | "needsCheck">>;

interface LigiloData {
  loading: boolean;
  error: string | null;
  words: Word[];
  statuses: StatusMap;
  progress: Partial<Record<Direction, DrillProgress>>;
  setStatus: (wordId: string, direction: Direction, status: Status) => void;
  /** Builds and saves a drill; returns the number of cards (0 = nothing saved). */
  startDrill: (conditions: DrillConditions) => Promise<number>;
  setIndex: (direction: Direction, index: number) => void;
  updateWord: (id: string, edit: WordEdit) => void;
}

const Ctx = createContext<LigiloData | null>(null);

export function useLigilo(): LigiloData {
  const value = useContext(Ctx);
  if (!value) throw new Error("useLigilo must be used inside LigiloProvider");
  return value;
}

export function LigiloProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [progress, setProgress] = useState<LigiloData["progress"]>({});

  const fetchAll = useCallback(async () => {
    const [w, s, p] = await Promise.all([
      supabase
        .from("words")
        .select("*")
        .order("chapter")
        .order("position")
        .range(0, 4999),
      supabase
        .from("word_statuses")
        .select("word_id,direction,status")
        .range(0, 9999),
      supabase.from("drill_progress").select("*"),
    ]);
    return { w, s, p };
  }, [supabase]);

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchAll>>) => {
    const { w, s, p } = result;
    const failure = w.error ?? s.error ?? p.error;
    if (failure) {
      setError(failure.message);
      setLoading(false);
      return;
    }
    setError(null);
    setWords((w.data as WordRow[]).map(toWord));
    const map: StatusMap = {};
    for (const r of s.data as {
      word_id: string;
      direction: Direction;
      status: Status;
    }[]) {
      map[statusKey(r.word_id, r.direction)] = r.status;
    }
    setStatuses(map);
    const prog: LigiloData["progress"] = {};
    for (const r of p.data as ProgressRow[]) prog[r.direction] = toProgress(r);
    setProgress(prog);
    setLoading(false);
  }, []);

  const load = useCallback(() => fetchAll().then(apply), [fetchAll, apply]);

  useEffect(() => {
    fetchAll().then(apply);
    // Pick up changes made on another device when this tab is shown again.
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchAll, apply, load]);

  const fail = useCallback(
    (message: string) => {
      setError(message);
      void load();
    },
    [load],
  );

  const setStatus = useCallback<LigiloData["setStatus"]>(
    (wordId, direction, status) => {
      setStatuses((prev) => ({ ...prev, [statusKey(wordId, direction)]: status }));
      void supabase
        .from("word_statuses")
        .upsert(
          { word_id: wordId, direction, status, updated_at: new Date().toISOString() },
          { onConflict: "word_id,direction" },
        )
        .then(({ error: e }) => e && fail(e.message));
    },
    [supabase, fail],
  );

  const startDrill = useCallback<LigiloData["startDrill"]>(
    async (conditions) => {
      const wordIds = buildDrill(words, statuses, conditions);
      if (wordIds.length === 0) return 0;
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        fail("ログイン状態を確認できませんでした");
        return 0;
      }
      const { error: e } = await supabase.from("drill_progress").upsert(
        {
          user_id: userId,
          direction: conditions.direction,
          chapters: conditions.chapters,
          statuses: conditions.statuses,
          order_mode: conditions.order,
          word_ids: wordIds,
          index: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,direction" },
      );
      if (e) {
        fail(e.message);
        return 0;
      }
      setProgress((prev) => ({
        ...prev,
        [conditions.direction]: { ...conditions, wordIds, index: 0 },
      }));
      return wordIds.length;
    },
    [supabase, words, statuses, fail],
  );

  const setIndex = useCallback<LigiloData["setIndex"]>(
    (direction, index) => {
      setProgress((prev) => {
        const current = prev[direction];
        return current ? { ...prev, [direction]: { ...current, index } } : prev;
      });
      void supabase
        .from("drill_progress")
        .update({ index, updated_at: new Date().toISOString() })
        .eq("direction", direction)
        .then(({ error: e }) => e && fail(e.message));
    },
    [supabase, fail],
  );

  const updateWord = useCallback<LigiloData["updateWord"]>(
    (id, edit) => {
      setWords((prev) => prev.map((w) => (w.id === id ? { ...w, ...edit } : w)));
      const row: Record<string, unknown> = {};
      if (edit.pinyin !== undefined) row.pinyin = edit.pinyin;
      if (edit.meaning !== undefined) row.meaning = edit.meaning;
      if (edit.needsCheck !== undefined) row.needs_check = edit.needsCheck;
      void supabase
        .from("words")
        .update(row)
        .eq("id", id)
        .then(({ error: e }) => e && fail(e.message));
    },
    [supabase, fail],
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      words,
      statuses,
      progress,
      setStatus,
      startDrill,
      setIndex,
      updateWord,
    }),
    [loading, error, words, statuses, progress, setStatus, startDrill, setIndex, updateWord],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
