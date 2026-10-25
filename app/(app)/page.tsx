"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useLigilo } from "@/lib/data";
import { buildDrill } from "@/lib/drill";
import {
  DIRECTION_LABEL,
  STATUS_LABEL,
  type Direction,
  type OrderMode,
  type Status,
} from "@/lib/types";

const DIRECTIONS: Direction[] = ["hanzi_to_pinyin", "pinyin_to_hanzi"];
const STATUSES: Status[] = ["none", "easy", "hard"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full border px-3 py-1.5 text-sm",
        active
          ? "border-transparent bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          : "border-neutral-300 dark:border-neutral-700",
      )}
    >
      {children}
    </button>
  );
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export default function HomePage() {
  const router = useRouter();
  const { words, statuses, progress, startDrill } = useLigilo();
  const allChapters = useMemo(
    () => [...new Set(words.map((w) => w.chapter))].sort((a, b) => a - b),
    [words],
  );

  const [direction, setDirection] = useState<Direction>("hanzi_to_pinyin");
  const [chapters, setChapters] = useState<number[]>(allChapters);
  const [picked, setPicked] = useState<Status[]>(STATUSES);
  const [order, setOrder] = useState<OrderMode>("random");
  const [starting, setStarting] = useState(false);

  const count = useMemo(
    () =>
      buildDrill(words, statuses, { direction, chapters, statuses: picked, order })
        .length,
    [words, statuses, direction, chapters, picked, order],
  );

  async function start() {
    setStarting(true);
    const n = await startDrill({ direction, chapters, statuses: picked, order });
    setStarting(false);
    if (n > 0) router.push(`/drill/${direction}`);
  }

  const resumable = DIRECTIONS.filter((d) => {
    const p = progress[d];
    return p && p.index < p.wordIds.length;
  });

  return (
    <div className="space-y-8">
      {resumable.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-neutral-500">前回の続きから</h2>
          {resumable.map((d) => {
            const p = progress[d]!;
            return (
              <Link
                key={d}
                href={`/drill/${d}`}
                className="flex items-center justify-between rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-700"
              >
                <span>{DIRECTION_LABEL[d]}</span>
                <span className="text-sm text-neutral-500">
                  {p.index} / {p.wordIds.length}
                </span>
              </Link>
            );
          })}
        </section>
      )}

      <section className="space-y-5">
        <h2 className="text-sm font-semibold text-neutral-500">新しく出題する</h2>

        <div className="space-y-2">
          <p className="text-sm">方向</p>
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => (
              <Chip key={d} active={direction === d} onClick={() => setDirection(d)}>
                {DIRECTION_LABEL[d]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">
            章{" "}
            <button
              className="ml-2 text-xs text-neutral-500 underline"
              onClick={() =>
                setChapters(chapters.length === allChapters.length ? [] : allChapters)
              }
            >
              {chapters.length === allChapters.length ? "すべて解除" : "すべて選択"}
            </button>
          </p>
          <div className="flex flex-wrap gap-2">
            {allChapters.map((c) => (
              <Chip
                key={c}
                active={chapters.includes(c)}
                onClick={() => setChapters(toggle(chapters, c))}
              >
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">ステータス（{DIRECTION_LABEL[direction]}）</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Chip
                key={s}
                active={picked.includes(s)}
                onClick={() => setPicked(toggle(picked, s))}
              >
                {STATUS_LABEL[s]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">出題順</p>
          <div className="flex gap-2">
            <Chip active={order === "random"} onClick={() => setOrder("random")}>
              ランダム
            </Chip>
            <Chip active={order === "sequential"} onClick={() => setOrder("sequential")}>
              順番
            </Chip>
          </div>
        </div>

        <button
          onClick={start}
          disabled={count === 0 || starting}
          className="w-full rounded-xl bg-neutral-900 py-3 font-medium text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {count === 0 ? "該当するカードがありません" : `${count}枚で始める`}
        </button>
      </section>
    </div>
  );
}
