"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ligilo:sound";
const listeners = new Set<() => void>();

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // storage unavailable: the preference just won't persist
  }
  if (!enabled) window.speechSynthesis?.cancel();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Per-device preference (not synced): speakers differ between phone and PC. */
export function useSoundEnabled(): boolean {
  return useSyncExternalStore(subscribe, readEnabled, () => true);
}

function chineseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "zh-CN") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("zh"))
  );
}

/** Speaks Chinese text with the browser's built-in voice. Returns false if unsupported. */
export function speakChinese(text: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.85;
  const voice = chineseVoice();
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
  return true;
}
