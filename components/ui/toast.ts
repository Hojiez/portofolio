"use client";

import { useSyncExternalStore } from "react";

/*
 * Notifikasi kecil di bawah layar ("Email copied" dan sejenisnya).
 * Satu pesan sekaligus; pesan baru menggantikan yang lama.
 */

export type Toast = { id: number; text: string } | null;

let current: Toast = null;
let timer = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function showToast(text: string, ms = 2600) {
  current = { id: (current?.id ?? 0) + 1, text };
  emit();
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    current = null;
    emit();
  }, ms);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useToast() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  );
}
