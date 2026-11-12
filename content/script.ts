/**
 * ============================================================================
 *  NASKAH MOCHI — kalimat yang diucapkan maskot di tiap section.
 *  Ubah teksnya bebas di sini; kode animasi tidak perlu disentuh.
 *  (docs/MASTER_PLAN.md bagian 6)
 * ============================================================================
 */

import type { MascotExpression } from "@/components/guide/expressions";
import { PROJECTS } from "./site";

export const SEATS = ["intro", "hero", "about", "projects", "skills", "contact"] as const;
export type SeatId = (typeof SEATS)[number];

export type ScriptLine = {
  /** Kalimat yang diucapkan. */
  text: string;
  /** Ekspresi Mochi setelah selesai bicara (selama bicara selalu "talk"). */
  expression: MascotExpression;
  /** File suara di public/voice/ (dibuat di Fase 5; belum ada). */
  voice: string;
};

/** Kalimat kursi, ditambah kalimat tambahan ("more") yang diucapkan jika
 *  pengunjung diam di section itu tanpa scroll (lihat MORE_MS di Guide.tsx). */
export type SeatScript = ScriptLine & { more?: ScriptLine };

/** 0 = kalimat utama, 1 = kalimat tambahan. */
export type LinePart = 0 | 1;

// Angka project ditulis sebagai kata ("Seven"), mengikuti jumlah di content/site.ts.
const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const projectCount = NUMBER_WORDS[PROJECTS.length] ?? String(PROJECTS.length);

// >>> GANTI DENGAN DATA KAMU (opsional): kalimat Mochi
export const SCRIPT: Record<SeatId, SeatScript> = {
  intro: {
    text: "Oh, a visitor! I'm Mochi. Press Enter and I'll show you around.",
    expression: "happy",
    voice: "/voice/intro.mp3",
  },
  hero: {
    text: "That's Rauh, also known as Hessed. He built me, so I'm legally required to be nice 😇",
    expression: "smug",
    voice: "/voice/hero.mp3",
    more: {
      text: "Psst. The fun part starts below. Scroll down and I'll race you there 👇",
      expression: "smirk",
      voice: "/voice/hero-more.mp3",
    },
  },
  about: {
    text: "His life story, short version. I can't read it myself, I'm a blob of liquid metal 🫠",
    expression: "happy",
    voice: "/voice/about.mp3",
    more: {
      text: "His first programs were game cheats. Please don't tell the anti-cheat 🤫",
      expression: "smirk",
      voice: "/voice/about-more.mp3",
    },
  },
  projects: {
    text: `${projectCount} projects. Three of them are the same furniture store in different outfits 🛋️`,
    expression: "smug",
    voice: "/voice/projects.mp3",
    more: {
      text: "Hover over a card and I'll stare at it with you 👀",
      expression: "smirk",
      voice: "/voice/projects-more.mp3",
    },
  },
  skills: {
    text: "Everything he codes with. I can't use any of it. No thumbs 🙃",
    expression: "curious",
    voice: "/voice/skills.mp3",
    more: {
      text: "Point at a row and it stops moving, in case you're a slow reader too 🐢",
      expression: "smirk",
      voice: "/voice/skills-more.mp3",
    },
  },
  contact: {
    text: "Tour's over! Email him if you liked it, and blame me if you didn't 💌",
    expression: "happy",
    voice: "/voice/contact.mp3",
    more: {
      text: "You can click me, by the way. I do tricks 🤸",
      expression: "smirk",
      voice: "/voice/contact-more.mp3",
    },
  },
};

/** Kalimat utama (part 0) atau kalimat tambahan (part 1) satu kursi. */
export function lineOf(id: SeatId, part: LinePart = 0): ScriptLine {
  return (part === 1 && SCRIPT[id].more) || SCRIPT[id];
}

/** Kalimat dipecah per kata, untuk efek muncul kata demi kata. */
export function wordsOf(id: SeatId, part: LinePart = 0) {
  return lineOf(id, part).text.split(" ");
}
