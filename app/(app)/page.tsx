"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useLigilo } from "@/lib/data";
import { buildDrill } from "@/lib/drill";
import { RidgeLine } from "@/components/Scenery";
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
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-transparent bg-primary text-primary-ink"
          : "border-line bg-bg hover:bg-sunk",
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

  // Enter starts the drill when nothing else has focus (a focused chip would click itself).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Enter" || e.repeat) return;
      if (document.activeElement !== document.body) return;
      if (count > 0 && !starting) void start();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const resumable = DIRECTIONS.filter((d) => {
    const p = progress[d];
    return p && p.index < p.wordIds.length;
  });

  return (
    <div className="rise space-y-8">
      <div className="space-y-2 text-center">
        <RidgeLine className="mx-auto w-44 text-muted" />
        <h1 className="font-serif-jp text-2xl font-bold">今日もゆっくり、一歩ずつ</h1>
      </div>

      {resumable.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted">前回の続きから</h2>
          {resumable.map((d) => {
            const p = progress[d]!;
            return (
              <Link
                key={d}
                href={`/drill/${d}`}
                className="block rounded-2xl border border-line bg-surface px-4 py-3 transition-colors hover:bg-sunk"
              >
                <span className="flex items-center justify-between">
                  <span>{DIRECTION_LABEL[d]}</span>
                  <span className="text-sm text-muted">
                    {p.index} / {p.wordIds.length}
                  </span>
                </span>
                <span className="mt-2 block h-1 overflow-hidden rounded-full bg-sunk">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(p.index / p.wordIds.length) * 100}%` }}
                  />
                </span>
              </Link>
            );
          })}
        </section>
      )}

      <section className="space-y-5 rounded-3xl border border-line bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-muted">新しく出題する</h2>

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
              className="ml-2 text-xs text-muted underline"
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
          className="w-full rounded-xl bg-primary py-3 font-medium text-primary-ink disabled:opacity-40"
        >
          {count === 0 ? "該当するカードがありません" : `${count}枚で始める`}
          {count > 0 && (
            <kbd className="ml-2 hidden rounded border border-current/30 px-1.5 text-[10px] font-normal opacity-70 [@media(pointer:fine)]:inline">
              Enter
            </kbd>
          )}
        </button>
      </section>
    </div>
  );
}
