"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useLigilo } from "@/lib/data";
import { statusOf } from "@/lib/drill";
import { StatusBadge, StatusButtons } from "@/components/StatusButtons";
import {
  DIRECTION_LABEL,
  STATUS_LABEL,
  type Direction,
  type Status,
  type Word,
} from "@/lib/types";

const DIRECTIONS: Direction[] = ["hanzi_to_pinyin", "pinyin_to_hanzi"];
const STATUSES: Status[] = ["none", "easy", "hard"];
const selectClass =
  "rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700";

export default function WordsPage() {
  const { words, statuses } = useLigilo();
  const chapters = useMemo(
    () => [...new Set(words.map((w) => w.chapter))].sort((a, b) => a - b),
    [words],
  );

  const [chapter, setChapter] = useState<"all" | number>("all");
  const [direction, setDirection] = useState<Direction>("hanzi_to_pinyin");
  const [status, setStatusFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const shown = words.filter(
    (w) =>
      (chapter === "all" || w.chapter === chapter) &&
      (status === "all" || statusOf(statuses, w.id, direction) === status) &&
      (q === "" ||
        w.hanzi.includes(q) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          className={selectClass}
          value={chapter}
          onChange={(e) =>
            setChapter(e.target.value === "all" ? "all" : Number(e.target.value))
          }
        >
          <option value="all">全ての章</option>
          {chapters.map((c) => (
            <option key={c} value={c}>
              章{c}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
        >
          {DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {DIRECTION_LABEL[d]}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
        >
          <option value="all">全てのステータス</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="汉语・ピンイン・意味で検索"
        className={clsx(selectClass, "w-full py-2")}
      />
      <p className="text-sm text-neutral-500">{shown.length}語</p>

      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {shown.map((w) => (
          <WordRow
            key={w.id}
            word={w}
            open={openId === w.id}
            onToggle={() => setOpenId(openId === w.id ? null : w.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function WordRow({
  word,
  open,
  onToggle,
}: {
  word: Word;
  open: boolean;
  onToggle: () => void;
}) {
  const { statuses, setStatus, updateWord } = useLigilo();

  return (
    <li className="py-2">
      <button onClick={onToggle} className="flex w-full items-start gap-3 text-left">
        <span className="w-8 shrink-0 pt-1 text-xs text-neutral-400">
          章{word.chapter}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-lg">{word.hanzi}</span>
          {word.posNote && (
            <span className="ml-1 text-xs text-neutral-500">{word.posNote}</span>
          )}
          {word.isMeasureWord && (
            <span className="ml-1 text-xs text-neutral-500">量詞</span>
          )}
          {word.needsCheck && (
            <span className="ml-1 text-xs text-amber-600">要確認</span>
          )}
          <span className="block text-sm text-neutral-500">
            {word.pinyin || "—"} · {word.meaning || "—"}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          {DIRECTIONS.map((d) => (
            <StatusBadge key={d} status={statusOf(statuses, word.id, d)} />
          ))}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
          <Field
            label="ピンイン"
            value={word.pinyin}
            onSave={(pinyin) => updateWord(word.id, { pinyin, needsCheck: false })}
          />
          <Field
            label="意味"
            value={word.meaning}
            onSave={(meaning) => updateWord(word.id, { meaning, needsCheck: false })}
          />
          {word.needsCheck && (
            <button
              className="text-sm text-amber-700 underline dark:text-amber-300"
              onClick={() => updateWord(word.id, { needsCheck: false })}
            >
              確認済みにする
            </button>
          )}
          {DIRECTIONS.map((d) => (
            <div key={d} className="space-y-1">
              <p className="text-xs text-neutral-500">{DIRECTION_LABEL[d]}</p>
              <StatusButtons
                size="sm"
                value={statusOf(statuses, word.id, d)}
                onSelect={(s) => setStatus(word.id, d, s)}
              />
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

function Field({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <label className="block space-y-1">
      <span className="text-xs text-neutral-500">{label}</span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onSave(draft)}
        className="w-full rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
      />
    </label>
  );
}
