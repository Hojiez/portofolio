"use client";

import { useSyncExternalStore } from "react";

/*
 * Pilihan suara pengunjung (On/Off), disimpan di localStorage.
 * Default: mati. Dipakai tombol suara di intro sekarang, dan pemutar suara
 * Mochi di Fase 5.
 */

const KEY = "mochi-sound";
const EVENT = "mochi-sound-change";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // localStorage diblokir: pilihan hanya berlaku sampai halaman ditutup
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useSoundOn() {
  return useSyncExternalStore(subscribe, read, () => false);
}
