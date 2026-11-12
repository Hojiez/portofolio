"use client";

import { useSyncExternalStore } from "react";
import { SEATS, type LinePart, type SeatId } from "@/content/script";

/*
 * Status pemandu yang dibagi antara Guide (yang menggerakkan Mochi) dan tiap
 * GuideSeat (yang menampilkan kalimat di section-nya).
 *
 * Per kursi: kalimat mana yang sedang tampil (utama atau tambahan), berapa
 * kata sudah tampil, dan apakah kalimatnya sudah selesai. Status ini hanya
 * hidup selama halaman terbuka: tiap kalimat diucapkan sekali per kunjungan.
 */

export type SeatLine = { part: LinePart; shown: number; done: boolean };

const EMPTY: SeatLine = { part: 0, shown: 0, done: false };

let lines = Object.fromEntries(SEATS.map((id) => [id, EMPTY])) as Record<SeatId, SeatLine>;
const listeners = new Set<() => void>();

export function getLine(id: SeatId) {
  return lines[id];
}

export function setLine(id: SeatId, line: SeatLine) {
  lines = { ...lines, [id]: line };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/* Kursi yang sedang ditempati Mochi. Balon teks hanya tampil di kursi ini;
   saat Mochi pindah, balon di kursi lama hilang. */
let activeSeat: SeatId | null = null;

export function setActiveSeat(id: SeatId | null) {
  activeSeat = id;
  listeners.forEach((l) => l());
}

export function useIsActiveSeat(id: SeatId) {
  return useSyncExternalStore(
    subscribe,
    () => activeSeat === id,
    () => false
  );
}

/** Kalimat satu kursi; komponen hanya digambar ulang saat kursinya berubah. */
export function useSeatLine(id: SeatId) {
  return useSyncExternalStore(
    subscribe,
    () => lines[id],
    () => EMPTY
  );
}
