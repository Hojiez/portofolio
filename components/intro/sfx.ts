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

import { isSoundOn, SITE_VOLUME, subscribeSound } from "@/components/guide/soundPref";

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
    master.gain.value = isSoundOn() ? SITE_VOLUME : 0;
    master.connect(ctx.destination);
    // Suara dimatikan: bunyi yang sudah terjadwal (dengung kotak logam,
    // chord pembuka) ikut langsung senyap, tidak dibiarkan selesai.
    subscribeSound(() => {
      if (master && ctx) master.gain.setTargetAtTime(isSoundOn() ? SITE_VOLUME : 0, ctx.currentTime, 0.03);
    });
    // potongan derau putih pendek, dipakai untuk bunyi tuts
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

/* Chord piano saat kotak logam menghilang (public/sfx/chime.mp3, dibuat oleh
   scripts/voice/chime.py). File-nya diunduh selama loading screen; dekode ke
   audio baru dilakukan saat pertama diputar (butuh AudioContext). */
const CHIME_URL = "/sfx/chime.mp3";
let chimeData: ArrayBuffer | null = null;
let chimeBuf: AudioBuffer | null = null;

export async function preloadChime() {
  if (chimeData || typeof window === "undefined") return;
  try {
    chimeData = await (await fetch(CHIME_URL)).arrayBuffer();
  } catch {
    // gagal dimuat: intro tetap jalan, hanya tanpa chord
  }
}

function playChime(a: Audio, at: number) {
  const go = (buf: AudioBuffer) => {
    const src = a.c.createBufferSource();
    src.buffer = buf;
    const g = a.c.createGain();
    g.gain.value = 0.9;
    src.connect(g).connect(a.out);
    // jika dekode selesai terlambat, start() dengan waktu lampau = bunyi sekarang
    src.start(Math.max(at, a.c.currentTime));
  };
  if (chimeBuf) return go(chimeBuf);
  if (!chimeData) return;
  void a.c.decodeAudioData(chimeData.slice(0)).then((buf) => {
    chimeBuf = buf;
    go(buf);
  }, () => {});
}

/* Nada-nada tangga F# mayor (sama dengan chord pembuka), supaya bunyi centang
   dan "siap" di terminal terdengar senada dengan chord-nya. */
const F_SHARP = [739.99, 830.61, 932.33, 1108.73, 1244.51, 1479.98]; // F#5 G#5 A#5 C#6 D#6 F#6

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
 *  kilau saat kilaunya menyapu, lalu chord piano tepat saat kotak menghilang
 *  dan menjadi terminal (detik 1,6; lihat animasi intro-egg di globals.css). */
export function sfxBlob() {
  // dipicu langsung oleh klik tombol gerbang: aktifkan audio dulu bila perlu
  onGesture((a) => blob(a));
}

function blob(a: Audio) {
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
  // chord piano saat kotak logam memudar menjadi terminal
  playChime(a, t + 1.6);
}

/** Bunyi tuts keyboard: klik lembut dan agak rendah (seperti keyboard laptop),
 *  supaya tidak menutupi dengung chord yang masih terdengar. Nada dan
 *  kerasnya sedikit acak tiap tuts. `heavy` = tombol Enter, lebih dalam. */
export function sfxKey(heavy = false) {
  const a = ready();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = a.noise;
  src.playbackRate.value = 0.7 + Math.random() * 0.3;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = (heavy ? 900 : 1300) + Math.random() * 700;
  bp.Q.value = 1.4;
  const g = c.createGain();
  const vol = (heavy ? 0.26 : 0.16) * (0.8 + Math.random() * 0.4);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.06 : 0.04));
  src.connect(bp).connect(g).connect(out);
  src.start(t);
  src.stop(t + 0.07);
  // "dok" rendah supaya terasa seperti tuts yang ditekan
  tone(c, out, {
    freq: (heavy ? 110 : 140) + Math.random() * 30,
    start: t,
    dur: heavy ? 0.06 : 0.035,
    vol: heavy ? 0.12 : 0.07,
    type: "triangle",
  });
}

/** Bunyi centang: denting lembut seperti lonceng kecil, naik satu nada
 *  tangga F# mayor tiap baris. */
export function sfxCheck(index = 0) {
  const a = ready();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  const f = F_SHARP[index % F_SHARP.length];
  tone(c, out, { freq: f, start: t, dur: 0.5, vol: 0.07 });
  tone(c, out, { freq: f * 2, start: t, dur: 0.25, vol: 0.02 }); // kilau oktaf atas
}

/** Bunyi saat baris "press ENTER" muncul: dua nada F# dan C# yang senada
 *  dengan chord pembuka. */
export function sfxReady() {
  const a = ready();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  tone(c, out, { freq: 739.99, start: t, dur: 0.5, vol: 0.09 });
  tone(c, out, { freq: 1108.73, start: t + 0.12, dur: 0.7, vol: 0.08 });
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
