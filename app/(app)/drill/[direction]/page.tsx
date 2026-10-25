import { notFound } from "next/navigation";
import { DrillPlayer } from "@/components/DrillPlayer";
import type { Direction } from "@/lib/types";

export default async function DrillPage({
  params,
}: {
  params: Promise<{ direction: string }>;
}) {
  const { direction } = await params;
  if (direction !== "hanzi_to_pinyin" && direction !== "pinyin_to_hanzi") {
    notFound();
  }
  return <DrillPlayer direction={direction as Direction} />;
}
