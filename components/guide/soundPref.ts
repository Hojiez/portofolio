"use client";

import { useSyncExternalStore } from "react";

/*
 * Pilihan suara pengunjung (On/Off), disimpan di localStorage.
 * Default: mati. Dipakai tombol suara di intro dan di navbar, efek suara
 * terminal (sfx.ts), dan suara Mochi (useVoice.ts).
 */

const KEY = "mochi-sound";
const EVENT = "mochi-sound-change";

// Cadangan di memori jika localStorage diblokir (mis. mode privat tertentu).
let memory: boolean | null = null;

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return memory ?? false;
  }
}

/** Baca pilihan suara di luar komponen React (misalnya pemutar efek suara). */
export function isSoundOn() {
  return typeof window !== "undefined" && read();
}

export function setSoundOn(on: boolean) {
  memory = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // localStorage diblokir: pilihan hanya berlaku sampai halaman ditutup
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeSound(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useSoundOn() {
  return useSyncExternalStore(subscribeSound, read, () => false);
}
