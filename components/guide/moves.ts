/*
 * Cara-cara Mochi berpindah dari satu kursi ke kursi lain. Guide.tsx memilih
 * satu secara acak setiap kali Mochi pindah (tidak pernah sama dua kali
 * berturut-turut).
 *
 * Setiap gerakan = daftar keyframe Web Animations untuk elemen pembungkus
 * Mochi (posisi di halaman), ditambah perlengkapan yang dipakai selama
 * gerakan, ekspresinya, dan kapan efek partikel/bunyi mendarat muncul.
 */

import type { MascotExpression } from "./expressions";

export type Pos = { x: number; y: number };
export type Gear = "board" | "umbrella" | "jet" | null;
export type FxKind = "dust" | "sparks";

export type Move = {
  name: string;
  duration: number;
  gear: Gear;
  expression: MascotExpression;
  frames: Keyframe[];
  /** bagian (0–1) dari durasi saat Mochi menyentuh kursi baru: bunyi mendarat */
  land: number;
  /** efek partikel: kapan (0–1), jenisnya, dan di kursi asal atau tujuan */
  fx: { at: number; kind: FxKind; where: "from" | "to" }[];
};

const T = (x: number, y: number, sx = 1, sy = 1, r = 0) =>
  `translate(${x}px, ${y}px) rotate(${r}deg) scale(${sx}, ${sy})`;

const lerp = (a: Pos, b: Pos, t: number): Pos => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/* 1. Lompat melengkung: jongkok, melayang sambil memanjang, mendarat penyet. */
function hop(from: Pos, to: Pos): Move {
  const peak = Math.min(from.y, to.y) - Math.min(220, 90 + Math.abs(to.y - from.y) * 0.06);
  return {
    name: "hop",
    duration: 950,
    gear: null,
    expression: "idle",
    land: 0.86,
    fx: [{ at: 0.86, kind: "dust", where: "to" }],
    frames: [
      { offset: 0, transform: T(from.x, from.y) },
      { offset: 0.14, transform: T(from.x, from.y + 6, 1.14, 0.84), easing: "cubic-bezier(0.3, 0, 0.6, 1)" },
      { offset: 0.5, transform: T((from.x + to.x) / 2, peak, 0.9, 1.14), easing: "cubic-bezier(0.4, 0, 0.7, 0.4)" },
      { offset: 0.86, transform: T(to.x, to.y, 1.2, 0.8), easing: "ease-out" },
      { offset: 1, transform: T(to.x, to.y) },
    ],
  };
}

/* 2. Hantam tanah: melesat ke atas keluar layar, lalu jatuh deras dan
   menghantam kursi baru sampai penyet, dengan kepulan debu. */
function slam(from: Pos, to: Pos): Move {
  return {
    name: "slam",
    duration: 1150,
    gear: null,
    expression: "smug",
    land: 0.8,
    fx: [{ at: 0.8, kind: "dust", where: "to" }],
    frames: [
      { offset: 0, transform: T(from.x, from.y) },
      { offset: 0.12, transform: T(from.x, from.y + 6, 1.14, 0.84), easing: "ease-out" },
      { offset: 0.3, transform: T(from.x, from.y - 260, 0.88, 1.16), easing: "ease-in" },
      { offset: 0.31, transform: T(to.x, to.y - 480, 0.85, 1.2), easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
      { offset: 0.8, transform: T(to.x, to.y, 1.42, 0.6), easing: "ease-out" },
      { offset: 0.88, transform: T(to.x, to.y - 16, 0.9, 1.12), easing: "ease-in" },
      { offset: 0.95, transform: T(to.x, to.y, 1.06, 0.95) },
      { offset: 1, transform: T(to.x, to.y) },
    ],
  };
}

/* 3. Skateboard: meluncur di atas papan ke kursi baru, lalu kickflip. */
function skate(from: Pos, to: Pos): Move {
  const lean = to.x >= from.x ? 1 : -1;
  return {
    name: "skate",
    duration: 1350,
    gear: "board",
    expression: "happy",
    land: 0.93,
    fx: [
      { at: 0.1, kind: "dust", where: "from" },
      { at: 0.93, kind: "dust", where: "to" },
    ],
    frames: [
      { offset: 0, transform: T(from.x, from.y) },
      { offset: 0.12, transform: T(from.x, from.y + 4, 1.05, 0.95, -6 * lean), easing: "ease-in-out" },
      { offset: 0.68, transform: T(to.x - 24 * lean, to.y, 1, 1, 7 * lean), easing: "ease-out" },
      { offset: 0.8, transform: T(to.x, to.y - 50, 1, 1, 180 * lean), easing: "ease-in" },
      { offset: 0.93, transform: T(to.x, to.y, 1.12, 0.88, 360 * lean), easing: "ease-out" },
      { offset: 1, transform: T(to.x, to.y, 1, 1, 360 * lean) },
    ],
  };
}

/* 4. Jetpack: lepas landas dengan api kecil, terbang melengkung tinggi,
   lalu mendarat pelan. */
function jet(from: Pos, to: Pos): Move {
  const peak = Math.min(from.y, to.y) - 260;
  const mid = lerp(from, to, 0.5);
  return {
    name: "jet",
    duration: 1300,
    gear: "jet",
    expression: "happy",
    land: 0.95,
    fx: [
      { at: 0.08, kind: "dust", where: "from" },
      { at: 0.95, kind: "sparks", where: "to" },
    ],
    frames: [
      { offset: 0, transform: T(from.x, from.y) },
      { offset: 0.15, transform: T(from.x, from.y - 40, 0.94, 1.08, -8), easing: "ease-in" },
      { offset: 0.55, transform: T(mid.x + 40, peak, 1, 1, 10), easing: "ease-in-out" },
      { offset: 0.82, transform: T(to.x, to.y - 50, 1, 1, -6), easing: "ease-out" },
      { offset: 0.95, transform: T(to.x, to.y, 1.06, 0.94) },
      { offset: 1, transform: T(to.x, to.y) },
    ],
  };
}

/* 5. Gasing: berputar dua kali sambil melayang ke kursi baru. */
function spin(from: Pos, to: Pos): Move {
  const mid = lerp(from, to, 0.5);
  const peak = Math.min(from.y, to.y) - 90;
  return {
    name: "spin",
    duration: 1050,
    gear: null,
    expression: "happy",
    land: 0.92,
    fx: [{ at: 0.92, kind: "sparks", where: "to" }],
    frames: [
      { offset: 0, transform: T(from.x, from.y), easing: "ease-in" },
      { offset: 0.5, transform: T(mid.x, peak, 0.9, 0.9, 360), easing: "ease-out" },
      { offset: 0.92, transform: T(to.x, to.y, 1.1, 0.9, 720) },
      { offset: 1, transform: T(to.x, to.y, 1, 1, 720) },
    ],
  };
}

/* 6. Pantul-pantul: tiga pantulan kecil yang makin rendah. */
function bounce(from: Pos, to: Pos): Move {
  const p = (t: number) => lerp(from, to, t);
  const up = (t: number, h: number) => ({ x: p(t).x, y: p(t).y - h });
  return {
    name: "bounce",
    duration: 1300,
    gear: null,
    expression: "happy",
    land: 0.94,
    fx: [{ at: 0.94, kind: "dust", where: "to" }],
    frames: [
      { offset: 0, transform: T(from.x, from.y), easing: "ease-out" },
      { offset: 0.16, transform: T(up(0.17, 110).x, up(0.17, 110).y, 0.92, 1.1), easing: "ease-in" },
      { offset: 0.33, transform: T(p(0.34).x, p(0.34).y, 1.16, 0.84), easing: "ease-out" },
      { offset: 0.5, transform: T(up(0.55, 75).x, up(0.55, 75).y, 0.94, 1.08), easing: "ease-in" },
      { offset: 0.66, transform: T(p(0.72).x, p(0.72).y, 1.12, 0.88), easing: "ease-out" },
      { offset: 0.8, transform: T(up(0.87, 40).x, up(0.87, 40).y, 0.96, 1.05), easing: "ease-in" },
      { offset: 0.94, transform: T(to.x, to.y, 1.1, 0.9) },
      { offset: 1, transform: T(to.x, to.y) },
    ],
  };
}

/* 7. Teleport: menciut jadi titik sambil berputar, lalu muncul di kursi baru
   dengan percikan. */
function teleport(from: Pos, to: Pos): Move {
  return {
    name: "teleport",
    duration: 950,
    gear: null,
    expression: "smug",
    land: 0.6,
    fx: [
      { at: 0.28, kind: "sparks", where: "from" },
      { at: 0.55, kind: "sparks", where: "to" },
    ],
    frames: [
      { offset: 0, transform: T(from.x, from.y), easing: "ease-in" },
      { offset: 0.3, transform: T(from.x, from.y, 0.05, 0.05, 220) },
      { offset: 0.31, transform: T(to.x, to.y, 0.05, 0.05, -220), easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      { offset: 0.75, transform: T(to.x, to.y, 1.18, 1.18, 8), easing: "ease-in-out" },
      { offset: 0.88, transform: T(to.x, to.y, 0.94, 0.94, -3) },
      { offset: 1, transform: T(to.x, to.y) },
    ],
  };
}

/* 8. Payung: naik sedikit lalu melayang turun pelan sambil berayun. */
function umbrella(from: Pos, to: Pos): Move {
  const start = { x: from.x, y: from.y - 70 };
  const y = (t: number) => start.y + (to.y - start.y) * t;
  return {
    name: "umbrella",
    duration: 1750,
    gear: "umbrella",
    expression: "curious",
    land: 0.92,
    fx: [{ at: 0.92, kind: "dust", where: "to" }],
    frames: [
      { offset: 0, transform: T(from.x, from.y), easing: "ease-out" },
      { offset: 0.14, transform: T(start.x, start.y, 0.96, 1.04), easing: "ease-in-out" },
      { offset: 0.34, transform: T(to.x - 44, y(0.3), 1, 1, -9), easing: "ease-in-out" },
      { offset: 0.54, transform: T(to.x + 40, y(0.6), 1, 1, 9), easing: "ease-in-out" },
      { offset: 0.74, transform: T(to.x - 22, y(0.85), 1, 1, -5), easing: "ease-in-out" },
      { offset: 0.92, transform: T(to.x, to.y, 1.06, 0.94) },
      { offset: 1, transform: T(to.x, to.y) },
    ],
  };
}

const MOVES = [hop, slam, skate, jet, spin, bounce, teleport, umbrella];

let lastMove = -1;

/** Pilih gerakan acak, tidak sama dengan gerakan sebelumnya. */
export function randomMove(from: Pos, to: Pos): Move {
  let i = Math.floor(Math.random() * MOVES.length);
  if (i === lastMove) i = (i + 1 + Math.floor(Math.random() * (MOVES.length - 1))) % MOVES.length;
  lastMove = i;
  return MOVES[i](from, to);
}

/* ---- Gerakan di tempat (animasi diam, reaksi klik, dan perpindahan di HP).
   Dipakai pada elemen dalam Mochi, jadi tidak mengganggu posisinya. ---- */

export const ACTS: Record<string, { frames: Keyframe[]; duration: number; expression?: MascotExpression }> = {
  bounce: {
    duration: 700,
    frames: [
      { transform: "none" },
      { transform: "translateY(3px) scale(1.1, 0.9)", offset: 0.15 },
      { transform: "translateY(-22px) scale(0.94, 1.08)", offset: 0.45 },
      { transform: "translateY(0) scale(1.1, 0.9)", offset: 0.78 },
      { transform: "none" },
    ],
  },
  spin: {
    duration: 850,
    expression: "happy",
    frames: [{ transform: "rotate(0deg)" }, { transform: "rotate(380deg)", offset: 0.85 }, { transform: "rotate(360deg)" }],
  },
  wiggle: {
    duration: 700,
    frames: [
      { transform: "rotate(0)" },
      { transform: "rotate(-12deg)", offset: 0.2 },
      { transform: "rotate(10deg)", offset: 0.45 },
      { transform: "rotate(-6deg)", offset: 0.7 },
      { transform: "rotate(0)" },
    ],
  },
  squish: {
    duration: 650,
    expression: "smug",
    frames: [
      { transform: "none" },
      { transform: "scale(1.22, 0.78)", offset: 0.3 },
      { transform: "scale(0.9, 1.12)", offset: 0.6 },
      { transform: "scale(1.04, 0.97)", offset: 0.82 },
      { transform: "none" },
    ],
  },
  peek: {
    duration: 1300,
    expression: "curious",
    frames: [
      { transform: "none" },
      { transform: "translateY(26px) scale(1.05, 0.55)", offset: 0.3 },
      { transform: "translateY(26px) scale(1.05, 0.55)", offset: 0.55 },
      { transform: "translateY(-14px) scale(0.92, 1.1)", offset: 0.78 },
      { transform: "none" },
    ],
  },
  backflip: {
    duration: 900,
    expression: "happy",
    frames: [
      { transform: "none" },
      { transform: "translateY(4px) scale(1.1, 0.9)", offset: 0.12 },
      { transform: "translateY(-46px) rotate(-180deg)", offset: 0.5 },
      { transform: "translateY(0) rotate(-360deg) scale(1.1, 0.9)", offset: 0.88 },
      { transform: "rotate(-360deg)" },
    ],
  },
  dizzy: {
    duration: 1600,
    expression: "curious",
    frames: [
      { transform: "rotate(0deg)", easing: "ease-in" },
      { transform: "rotate(1080deg) scale(0.9)", offset: 0.7, easing: "ease-out" },
      { transform: "rotate(1060deg) translateX(-6px)", offset: 0.8 },
      { transform: "rotate(1088deg) translateX(6px)", offset: 0.9 },
      { transform: "rotate(1080deg)" },
    ],
  },
};

export const IDLE_ACTS = ["bounce", "spin", "wiggle", "squish", "peek"];
export const CLICK_ACTS = ["spin", "squish", "bounce", "backflip", "wiggle"];

export function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}
