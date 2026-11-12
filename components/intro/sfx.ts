/*
 * Efek suara terminal, dibuat langsung dengan Web Audio API (tanpa file audio).
 *
 * Aturan browser: suara baru boleh berbunyi setelah pengunjung berinteraksi
 * (klik, tap, atau tekan tombol). Jadi:
 *   - Suara hanya berbunyi jika pilihan suara "On" (soundPref.ts).
 *   - Jika pilihan sudah "On" dari kunjungan sebelumnya, suara mulai berbunyi
 *     setelah interaksi pertama di halaman.
 *   - Menekan tombol "On" sendiri sudah dihitung interaksi, jadi suara
 *     langsung terdengar.
 */

import { isSoundOn, SITE_VOLUME } from "@/components/guide/soundPref";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = SITE_VOLUME;
    master.connect(ctx.destination);
    // potongan derau putih pendek, dipakai untuk bunyi tuts
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

/** Panggil saat ada interaksi pengunjung supaya browser mengizinkan suara. */
export function unlockAudio() {
  const c = audio();
  if (c && c.state === "suspended") void c.resume();
}

type Audio = { c: AudioContext; out: GainNode; noise: AudioBuffer };

function ready(): Audio | null {
  if (!isSoundOn()) return null;
  const c = audio();
  if (!c || c.state !== "running" || !master || !noise) return null;
  return { c, out: master, noise };
}

/* Untuk bunyi yang dipicu langsung oleh klik/tombol pengunjung: jika audio
   belum aktif, aktifkan dulu lalu bunyikan. (Bunyi otomatis seperti tuts
   tidak memakai ini, supaya tidak menumpuk lalu berbunyi serentak saat
   pengunjung akhirnya berinteraksi.) */
function onGesture(play: (a: Audio) => void) {
  if (!isSoundOn()) return;
  const c = audio();
  if (!c) return;
  const go = () => {
    const a = ready();
    if (a) play(a);
  };
  if (c.state === "running") go();
  else void c.resume().then(go, () => {});
}

/* Satu nada pendek dengan selubung naik-turun cepat. */
function tone(
  c: AudioContext,
  out: AudioNode,
  { freq, to, start, dur, vol, type = "sine" }: { freq: number; to?: number; start: number; dur: number; vol: number; type?: OscillatorType }
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(out);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Bunyi pembuka: dengung rendah yang naik saat kotak logam bergoyang, desis
 *  kilau saat kilaunya menyapu, dan dua denting kecil saat menjadi terminal. */
export function sfxBlob() {
  const a = ready();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  // dengung "whoom" sepanjang blob mengembang
  tone(c, out, { freq: 70, to: 210, start: t, dur: 1.5, vol: 0.22, type: "sine" });
  tone(c, out, { freq: 140, to: 420, start: t + 0.05, dur: 1.4, vol: 0.06, type: "triangle" });
  // desis kilau: derau yang disaring dan disapu ke nada tinggi
  const src = c.createBufferSource();
  src.buffer = a.noise;
  src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 6;
  bp.frequency.setValueAtTime(1200, t + 0.6);
  bp.frequency.exponentialRampToValueAtTime(7000, t + 2.0);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t + 0.6);
  g.gain.linearRampToValueAtTime(0.08, t + 1.0);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
  src.connect(bp).connect(g).connect(out);
  src.start(t + 0.6);
  src.stop(t + 2.2);
  // denting kecil saat logam mencair menjadi terminal
  tone(c, out, { freq: 1320, start: t + 1.8, dur: 0.35, vol: 0.05 });
  tone(c, out, { freq: 1980, start: t + 1.93, dur: 0.4, vol: 0.035 });
}

/** Bunyi tuts keyboard: klik derau pendek, nadanya sedikit acak tiap tuts. */
export function sfxKey() {
  const a = ready();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = a.noise;
  src.playbackRate.value = 0.8 + Math.random() * 0.5;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800 + Math.random() * 1600;
  bp.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.35, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  src.connect(bp).connect(g).connect(out);
  src.start(t);
  src.stop(t + 0.05);
  // "dok" rendah supaya terasa seperti tuts yang ditekan
  tone(c, out, { freq: 160 + Math.random() * 40, start: t, dur: 0.03, vol: 0.12, type: "triangle" });
}

/** Bunyi centang: "tik" bernada tinggi yang naik sedikit. */
export function sfxCheck(index = 0) {
  const a = ready();
  if (!a) return;
  const { c, out } = a;
  const base = 880 * Math.pow(2, (index * 2) / 12); // naik satu nada tiap baris
  tone(c, out, { freq: base, to: base * 1.5, start: c.currentTime, dur: 0.09, vol: 0.12 });
}

/** Bunyi saat baris "press ENTER" muncul: dua nada lembut. */
export function sfxReady() {
  const a = ready();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  tone(c, out, { freq: 660, start: t, dur: 0.18, vol: 0.12 });
  tone(c, out, { freq: 990, start: t + 0.09, dur: 0.28, vol: 0.12 });
}

/** Bunyi saat intro ditutup: sapuan nada naik seperti "masuk". */
export function sfxEnter() {
  onGesture(({ c, out }) => {
    const t = c.currentTime;
    tone(c, out, { freq: 220, to: 880, start: t, dur: 0.35, vol: 0.14, type: "triangle" });
    tone(c, out, { freq: 1320, start: t + 0.12, dur: 0.3, vol: 0.06 });
  });
}

/** Bunyi saat Mochi diklik: "boing" kenyal seperti jeli. */
export function sfxBoing() {
  onGesture(({ c, out }) => {
    const t = c.currentTime;
    tone(c, out, { freq: 300, to: 620, start: t, dur: 0.12, vol: 0.14 });
    tone(c, out, { freq: 620, to: 420, start: t + 0.1, dur: 0.22, vol: 0.1 });
  });
}

/** Bunyi Mochi mendarat setelah melompat (otomatis, tanpa klik). */
export function sfxLand() {
  const a = ready();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  tone(c, out, { freq: 180, to: 90, start: t, dur: 0.12, vol: 0.16, type: "triangle" });
  tone(c, out, { freq: 520, to: 380, start: t + 0.04, dur: 0.16, vol: 0.06 });
}

/** Bunyi konfirmasi saat suara dinyalakan. */
export function sfxToggleOn() {
  onGesture(({ c, out }) => {
    tone(c, out, { freq: 740, to: 1110, start: c.currentTime, dur: 0.12, vol: 0.12 });
  });
}
