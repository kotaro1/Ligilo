"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLigilo } from "@/lib/data";
import { statusOf } from "@/lib/drill";
import { drillKeyAction } from "@/lib/drillKeys";
import { setSoundEnabled, speakChinese, useSoundEnabled } from "@/lib/speech";
import { StatusButtons } from "@/components/StatusButtons";
import { RidgeLine } from "@/components/Scenery";
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
  const sound = useSoundEnabled();
  const drill = progress[direction];
  const wordById = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const [flipped, setFlipped] = useState(false);

  if (!drill || drill.wordIds.length === 0) {
    return (
      <p className="text-sm">
        出題がありません。
        <Link href="/" className="underline">
          ホームで出題を作る
        </Link>
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
      <div className="rise space-y-6 rounded-3xl border border-line bg-surface p-8 text-center">
        <RidgeLine className="mx-auto w-40 text-muted" />
        <h1 className="font-serif-jp text-2xl font-bold">おつかれさま</h1>
        <p className="text-sm text-muted">
          {DIRECTION_LABEL[direction]} · {total}枚
        </p>
        <div className="flex justify-center gap-8">
          {STATUSES.map((s) => (
            <div key={s}>
              <div className="font-serif-jp text-3xl font-bold">{counts[s]}</div>
              <div className="text-sm text-muted">{STATUS_LABEL[s]}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => go(total - 1)}
            className="flex-1 rounded-xl border border-line py-3 hover:bg-sunk"
          >
            最後のカードに戻る
          </button>
          <Link
            href="/"
            className="flex-1 rounded-xl bg-primary py-3 font-medium text-primary-ink"
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

  function flip() {
    setFlipped(true);
    if (sound && word) speakChinese(word.hanzi);
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
      sound={sound}
      onFlip={flip}
      onReplay={() => speakChinese(word.hanzi)}
      onPrev={index > 0 ? () => go(index - 1) : undefined}
      onNext={() => go(index + 1)}
      onSelect={(s) => {
        setStatus(word.id, direction, s);
        go(index + 1);
      }}
    />
  );
}

function SpeakerIcon({ muted }: { muted?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      {muted ? (
        <path d="m16 9 5 6m0-6-5 6" />
      ) : (
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
      )}
    </svg>
  );
}

function Card({
  word,
  direction,
  index,
  total,
  status,
  flipped,
  sound,
  onFlip,
  onReplay,
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
  sound: boolean;
  onFlip: () => void;
  onReplay: () => void;
  onPrev?: () => void;
  onNext: () => void;
  onSelect: (status: Status) => void;
}) {
  const router = useRouter();
  const toPinyin = direction === "hanzi_to_pinyin";

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const action = drillKeyAction(e.key, flipped);
      if (!action) return;
      e.preventDefault();
      // A focused button would also fire its own click on Space/Enter.
      (document.activeElement as HTMLElement | null)?.blur();
      if (e.repeat && action.type !== "prev" && action.type !== "next") return;
      switch (action.type) {
        case "flip":
          onFlip();
          break;
        case "next":
          onNext();
          break;
        case "prev":
          onPrev?.();
          break;
        case "replay":
          onReplay();
          break;
        case "status":
          onSelect(action.status);
          break;
        case "exit":
          router.push("/");
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flipped, onFlip, onNext, onPrev, onReplay, onSelect, router]);

  const hanzi = (
    <p className="font-serif-sc text-7xl font-medium leading-tight">
      {word.hanzi}
      {word.posNote && (
        <span className="ml-2 align-middle font-sans text-sm font-normal text-muted">
          {word.posNote}
        </span>
      )}
    </p>
  );

  return (
    <div className="rise space-y-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          ← やめる
        </Link>
        <span>
          {index + 1} / {total}
        </span>
        <button
          onClick={() => setSoundEnabled(!sound)}
          className="flex items-center gap-1 hover:text-ink"
          aria-label={sound ? "音声をオフにする" : "音声をオンにする"}
        >
          <SpeakerIcon muted={!sound} />
          {sound ? "音声 ON" : "音声 OFF"}
        </button>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-sunk">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      <div
        className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-surface p-6 text-center shadow-sm"
        onClick={flipped ? undefined : onFlip}
      >
        <RidgeLine className="w-32 text-line" />
        {!flipped ? (
          <>
            <p className="text-xs tracking-widest text-muted">第{word.chapter}章</p>
            {toPinyin ? (
              hanzi
            ) : (
              <p className="text-4xl font-medium">{word.pinyin || "（ピンイン未設定）"}</p>
            )}
            <p className="text-sm text-muted">タップしてめくる</p>
          </>
        ) : (
          <>
            {toPinyin ? (
              <>
                <p className="text-4xl font-medium">{word.pinyin || "（ピンイン未設定）"}</p>
                <p className="font-serif-sc text-3xl text-muted">{word.hanzi}</p>
              </>
            ) : (
              <>
                {hanzi}
                <p className="text-2xl text-muted">{word.pinyin}</p>
              </>
            )}
            <p className="font-serif-jp text-xl">{word.meaning || "（意味未設定）"}</p>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={onReplay}
                className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-muted hover:bg-sunk"
              >
                <SpeakerIcon /> もう一度聞く
              </button>
              {word.isMeasureWord && (
                <span className="rounded-full bg-sunk px-2.5 py-1">量詞</span>
              )}
              {word.needsCheck && (
                <span className="rounded-full bg-hard/15 px-2.5 py-1 text-hard">
                  要確認
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {flipped ? (
        <StatusButtons value={status} onSelect={onSelect} showKeys />
      ) : (
        <button
          onClick={onFlip}
          className="w-full rounded-xl bg-primary py-3 font-medium text-primary-ink"
        >
          めくる
          <kbd className="ml-2 hidden rounded border border-current/30 px-1.5 text-[10px] font-normal opacity-70 [@media(pointer:fine)]:inline">
            Space
          </kbd>
        </button>
      )}

      <div className="flex justify-between text-sm">
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="text-muted hover:text-ink disabled:opacity-30"
        >
          ← 前へ
        </button>
        <button onClick={onNext} className="text-muted hover:text-ink">
          次へ（ステータスは変えない） →
        </button>
      </div>

      <p className="hidden text-center text-xs text-muted [@media(pointer:fine)]:block">
        Space / Enter {flipped ? "次へ" : "めくる"} · ← → 前後 · 1 2 3 ステータス · R
        もう一度聞く · Esc やめる
      </p>
    </div>
  );
}
