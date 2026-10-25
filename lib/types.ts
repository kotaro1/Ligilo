export type Direction = "hanzi_to_pinyin" | "pinyin_to_hanzi";

export type Status = "none" | "easy" | "hard";

export type OrderMode = "random" | "sequential";

export interface Word {
  id: string;
  chapter: number;
  hanzi: string;
  pinyin: string;
  meaning: string;
  isMeasureWord: boolean;
  posNote: string | null;
  needsCheck: boolean;
  position: number;
}

export interface DrillConditions {
  direction: Direction;
  chapters: number[];
  statuses: Status[];
  order: OrderMode;
}

export interface DrillProgress extends DrillConditions {
  wordIds: string[];
  index: number;
}

export const DIRECTION_LABEL: Record<Direction, string> = {
  hanzi_to_pinyin: "中国語 → ピンイン",
  pinyin_to_hanzi: "ピンイン → 中国語",
};

export const STATUS_LABEL: Record<Status, string> = {
  none: "なし",
  easy: "易",
  hard: "難",
};
