"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLigilo } from "@/lib/data";
import { statusOf } from "@/lib/drill";
import { StatusButtons } from "@/components/StatusButtons";
import {
  DIRECTION_LABEL,
  STATUS_LABEL,
  type Direction,
  type Status,
  type Word,
} from "@/lib/types";

const STATUSES: Status[] = ["none", "easy", "hard"];

export function DrillPlayer({ direction }: { direction: Direction }) {
  const { words, statuses, progress, setStatus, setIndex } = useLigilo();
  const drill = progress[direction];
  const wordById = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const [flipped, setFlipped] = useState(false);

  if (!drill || drill.wordIds.length === 0) {
    return (
      <p className="text-sm">
        出題がありません。<Link href="/" className="underline">ホームで出題を作る</Link>
      </p>
    );
  }

  const total = drill.wordIds.length;
  const index = Math.min(drill.index, total);

  function go(next: number) {
    setFlipped(false);
    setIndex(direction, next);
  }

  if (index >= total) {
    const counts: Record<Status, number> = { none: 0, easy: 0, hard: 0 };
    for (const id of drill.wordIds) counts[statusOf(statuses, id, direction)]++;
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-xl font-semibold">おつかれさま！</h1>
        <p className="text-sm text-neutral-500">
          {DIRECTION_LABEL[direction]} · {total}枚
        </p>
        <div className="flex justify-center gap-6">
          {STATUSES.map((s) => (
            <div key={s}>
              <div className="text-2xl font-semibold">{counts[s]}</div>
              <div className="text-sm text-neutral-500">{STATUS_LABEL[s]}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => go(total - 1)}
            className="flex-1 rounded-xl border border-neutral-300 py-3 dark:border-neutral-700"
          >
            最後のカードに戻る
          </button>
          <Link
            href="/"
            className="flex-1 rounded-xl bg-neutral-900 py-3 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            ホームへ
          </Link>
        </div>
      </div>
    );
  }

  const word = wordById.get(drill.wordIds[index]);
  if (!word) {
    return (
      <div className="space-y-3 text-sm">
        <p>この単語が見つかりません（削除された可能性があります）。</p>
        <button onClick={() => go(index + 1)} className="underline">
          次へ
        </button>
      </div>
    );
  }

  return (
    <Card
      key={word.id}
      word={word}
      direction={direction}
      index={index}
      total={total}
      status={statusOf(statuses, word.id, direction)}
      flipped={flipped}
      onFlip={() => setFlipped(true)}
      onPrev={index > 0 ? () => go(index - 1) : undefined}
      onNext={() => go(index + 1)}
      onSelect={(s) => {
        setStatus(word.id, direction, s);
        go(index + 1);
      }}
    />
  );
}

function Card({
  word,
  direction,
  index,
  total,
  status,
  flipped,
  onFlip,
  onPrev,
  onNext,
  onSelect,
}: {
  word: Word;
  direction: Direction;
  index: number;
  total: number;
  status: Status;
  flipped: boolean;
  onFlip: () => void;
  onPrev?: () => void;
  onNext: () => void;
  onSelect: (status: Status) => void;
}) {
  const toPinyin = direction === "hanzi_to_pinyin";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <Link href="/" className="underline">
          やめる
        </Link>
        <span>
          {index + 1} / {total}
        </span>
      </div>

      <div
        className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-neutral-900"
        onClick={flipped ? undefined : onFlip}
      >
        {!flipped ? (
          <>
            <p className="text-xs text-neutral-400">章{word.chapter}</p>
            {toPinyin ? (
              <p className="text-6xl font-medium">
                {word.hanzi}
                {word.posNote && (
                  <span className="ml-2 align-middle text-sm font-normal text-neutral-500">
                    {word.posNote}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-4xl font-medium">{word.pinyin || "（ピンイン未設定）"}</p>
            )}
            <p className="text-sm text-neutral-400">タップしてめくる</p>
          </>
        ) : (
          <>
            {toPinyin ? (
              <>
                <p className="text-4xl font-medium">{word.pinyin || "（ピンイン未設定）"}</p>
                <p className="text-2xl text-neutral-500">{word.hanzi}</p>
              </>
            ) : (
              <>
                <p className="text-6xl font-medium">
                  {word.hanzi}
                  {word.posNote && (
                    <span className="ml-2 align-middle text-sm font-normal text-neutral-500">
                      {word.posNote}
                    </span>
                  )}
                </p>
                <p className="text-2xl text-neutral-500">{word.pinyin}</p>
              </>
            )}
            <p className="text-lg">{word.meaning || "（意味未設定）"}</p>
            <div className="flex gap-2 text-xs">
              {word.isMeasureWord && (
                <span className="rounded bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
                  量詞
                </span>
              )}
              {word.needsCheck && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  要確認
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {flipped ? (
        <StatusButtons value={status} onSelect={onSelect} />
      ) : (
        <button
          onClick={onFlip}
          className="w-full rounded-xl bg-neutral-900 py-3 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          めくる
        </button>
      )}

      <div className="flex justify-between text-sm">
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="text-neutral-500 disabled:opacity-30"
        >
          ← 前へ
        </button>
        <button onClick={onNext} className="text-neutral-500">
          次へ（ステータスは変えない） →
        </button>
      </div>
    </div>
  );
}
