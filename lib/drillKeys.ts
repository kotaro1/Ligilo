import type { Status } from "./types";

export type DrillKeyAction =
  | { type: "flip" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "replay" }
  | { type: "exit" }
  | { type: "status"; status: Status };

const STATUS_KEYS: Record<string, Status> = { "1": "none", "2": "easy", "3": "hard" };

/** Maps a keyboard key to a drill action; null means the key does nothing here. */
export function drillKeyAction(
  key: string,
  flipped: boolean,
): DrillKeyAction | null {
  if (key === "Escape") return { type: "exit" };
  if (key === "ArrowLeft") return { type: "prev" };
  if (key === "ArrowRight") return { type: "next" };
  if (key === " " || key === "Enter") {
    return flipped ? { type: "next" } : { type: "flip" };
  }
  if (!flipped) return null;
  if (key === "r" || key === "R") return { type: "replay" };
  const status = STATUS_KEYS[key];
  return status ? { type: "status", status } : null;
}
