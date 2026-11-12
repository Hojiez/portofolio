"use client";

import { useEffect } from "react";
import { isSoundOn, subscribeSound } from "./soundPref";

/*
 * Pemutar suara Mochi (docs/MASTER_PLAN.md bagian 7).
 *
 * Aturan:
 *   - Hanya berbunyi jika pilihan suara "On" DAN pengunjung sudah pernah
 *     berinteraksi dengan halaman (klik, tap, atau tombol). Browser juga
 *     memblokir suara sebelum itu; aturan ini menjaganya dari sisi situs.
 *   - File dimuat saat kalimatnya akan diucapkan, bukan semuanya di awal.
 *   - Hanya satu kalimat berbunyi pada satu waktu: memutar kalimat baru selalu
 *     menghentikan yang lama.
 *   - Jika file gagal dimuat atau diblokir, playVoice mengembalikan null dan
 *     pemanggil memakai kecepatan teks biasa; situs tetap berfungsi.
 */

let current: HTMLAudioElement | null = null;
let interacted = false;

if (typeof window !== "undefined") {
  const mark = () => {
    interacted = true;
  };
  window.addEventListener("pointerdown", mark, { capture: true, once: true });
  window.addEventListener("keydown", mark, { capture: true, once: true });
}

function hasInteracted() {
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return interacted || !!ua?.hasBeenActive;
}

/** Hentikan kalimat yang sedang diputar (jika ada). */
export function stopVoice() {
  if (!current) return;
  current.pause();
  current.removeAttribute("src");
  current.load(); // lepaskan file dari memori
  current = null;
}

/** Batas waktu menunggu file mulai berbunyi sebelum menyerah (ms). */
const START_TIMEOUT = 2500;

/**
 * Putar file suara. Mengembalikan durasinya (detik) begitu mulai berbunyi,
 * atau null jika suara mati, belum ada interaksi, diblokir, atau gagal dimuat.
 */
export function playVoice(src: string): Promise<number | null> {
  stopVoice();
  if (!isSoundOn() || !hasInteracted()) return Promise.resolve(null);

  const audio = new Audio(src);
  audio.preload = "auto";
  current = audio;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: number | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (value === null && current === audio) stopVoice();
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(null), START_TIMEOUT);
    audio.addEventListener("error", () => finish(null), { once: true });
    audio.addEventListener("ended", () => {
      if (current === audio) current = null;
    });
    audio.play().then(
      () => finish(Number.isFinite(audio.duration) ? audio.duration : null),
      () => finish(null)
    );
  });
}

/**
 * Jadwal kemunculan kata yang mengikuti durasi audio: tiap kata mendapat
 * bagian waktu sesuai panjangnya, tanda baca memberi jeda tambahan. Kata
 * sedikit mendahului suara (92% durasi) supaya teks tidak tertinggal.
 * Mengembalikan waktu mulai tiap kata dalam ms.
 */
export function wordTimings(words: string[], durationSec: number) {
  const weight = (w: string) => w.length + (/[.,!?]$/.test(w) ? 4 : 0) + 1;
  const total = words.reduce((sum, w) => sum + weight(w), 0);
  let acc = 0;
  return words.map((w) => {
    const start = (acc / total) * durationSec * 920;
    acc += weight(w);
    return start;
  });
}

/** Hentikan suara Mochi saat pengunjung mematikan suara. */
export function useStopVoiceWhenMuted() {
  useEffect(
    () =>
      subscribeSound(() => {
        if (!isSoundOn()) stopVoice();
      }),
    []
  );
}
