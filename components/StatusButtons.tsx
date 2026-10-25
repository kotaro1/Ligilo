"use client";

import clsx from "clsx";
import { STATUS_LABEL, type Status } from "@/lib/types";

const STATUSES: Status[] = ["none", "easy", "hard"];

const ACTIVE: Record<Status, string> = {
  none: "bg-neutral-700 text-white dark:bg-neutral-300 dark:text-neutral-900",
  easy: "bg-emerald-600 text-white",
  hard: "bg-rose-600 text-white",
};

export function StatusButtons({
  value,
  onSelect,
  size = "md",
}: {
  value: Status;
  onSelect: (status: Status) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex gap-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={clsx(
            "flex-1 rounded-lg border font-medium",
            size === "md" ? "py-3 text-base" : "py-1 text-sm",
            value === s
              ? clsx(ACTIVE[s], "border-transparent")
              : "border-neutral-300 dark:border-neutral-700",
          )}
        >
          {STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={clsx(
        "rounded px-1.5 py-0.5 text-xs",
        status === "easy" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        status === "hard" && "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
        status === "none" && "bg-neutral-100 text-neutral-500 dark:bg-neutral-800",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
