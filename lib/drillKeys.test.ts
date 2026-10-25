import { describe, expect, it } from "vitest";
import { drillKeyAction } from "./drillKeys";

describe("drillKeyAction", () => {
  it("flips the card with Space or Enter while the front is shown", () => {
    expect(drillKeyAction(" ", false)).toEqual({ type: "flip" });
    expect(drillKeyAction("Enter", false)).toEqual({ type: "flip" });
  });

  it("does not accept a status before the card is flipped", () => {
    expect(drillKeyAction("1", false)).toBeNull();
    expect(drillKeyAction("3", false)).toBeNull();
  });

  it("maps 1/2/3 to none/easy/hard once flipped", () => {
    expect(drillKeyAction("1", true)).toEqual({ type: "status", status: "none" });
    expect(drillKeyAction("2", true)).toEqual({ type: "status", status: "easy" });
    expect(drillKeyAction("3", true)).toEqual({ type: "status", status: "hard" });
  });

  it("goes next without changing status with Space/Enter once flipped", () => {
    expect(drillKeyAction(" ", true)).toEqual({ type: "next" });
    expect(drillKeyAction("Enter", true)).toEqual({ type: "next" });
  });

  it("navigates with the arrow keys in either state", () => {
    for (const flipped of [false, true]) {
      expect(drillKeyAction("ArrowLeft", flipped)).toEqual({ type: "prev" });
      expect(drillKeyAction("ArrowRight", flipped)).toEqual({ type: "next" });
    }
  });

  it("replays the audio with R only after flipping", () => {
    expect(drillKeyAction("r", true)).toEqual({ type: "replay" });
    expect(drillKeyAction("R", true)).toEqual({ type: "replay" });
    expect(drillKeyAction("r", false)).toBeNull();
  });

  it("leaves the drill with Escape", () => {
    expect(drillKeyAction("Escape", false)).toEqual({ type: "exit" });
    expect(drillKeyAction("Escape", true)).toEqual({ type: "exit" });
  });

  it("ignores other keys", () => {
    expect(drillKeyAction("a", true)).toBeNull();
    expect(drillKeyAction("4", true)).toBeNull();
  });
});
