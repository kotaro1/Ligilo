"use client";

import clsx from "clsx";
import { STATUS_LABEL, type Status } from "@/lib/types";

const STATUSES: Status[] = ["none", "easy", "hard"];

const ACTIVE: Record<Status, string> = {
  none: "bg-none text-white",
  easy: "bg-easy text-white",
  hard: "bg-hard text-white",
};

export function StatusButtons({
  value,
  onSelect,
  size = "md",
  showKeys = false,
}: {
  value: Status;
  onSelect: (status: Status) => void;
  size?: "sm" | "md";
  /** Shows the 1/2/3 keyboard hint on pointer devices (PC). */
  showKeys?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {STATUSES.map((s, i) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={clsx(
            "flex-1 rounded-xl border font-medium transition-colors",
            size === "md" ? "py-3 text-base" : "py-1 text-sm",
            value === s
              ? clsx(ACTIVE[s], "border-transparent")
              : "border-line bg-surface hover:bg-sunk",
          )}
        >
          {STATUS_LABEL[s]}
          {showKeys && (
            <kbd className="ml-1.5 hidden rounded border border-current/30 px-1 text-[10px] font-normal opacity-60 [@media(pointer:fine)]:inline">
              {i + 1}
            </kbd>
          )}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 text-xs",
        status === "easy" && "bg-easy/15 text-easy",
        status === "hard" && "bg-hard/15 text-hard",
        status === "none" && "bg-none/15 text-muted",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
