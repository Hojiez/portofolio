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
    text: "Hi, I'm Mochi. That's Rauh, though most people know him as Hessed. He built this whole site, and he built me so he wouldn't have to introduce himself.",
    expression: "smug",
    voice: "/voice/hero.mp3",
    more: {
      text: "Still up here? That's fine, I like the view too. The good stuff starts once you scroll, though. His projects are a little further down.",
      expression: "smirk",
      voice: "/voice/hero-more.mp3",
    },
  },
  about: {
    text: "This part is about him. He started out writing cheats for games, got curious about how they actually worked, and somehow that turned into a computer science degree.",
    expression: "happy",
    voice: "/voice/about.mp3",
    more: {
      text: "Right now he's studying operating systems and compilers, which sounds exhausting to me. After that he wants to get into cybersecurity, so the game cheat years weren't wasted.",
      expression: "smirk",
      voice: "/voice/about-more.mp3",
    },
  },
  projects: {
    text: `Here's everything he's built so far, ${projectCount.toLowerCase()} projects in total. You'll notice the furniture store shows up three times. He kept rebuilding it until he was happy with it.`,
    expression: "smug",
    voice: "/voice/projects.mp3",
    more: {
      text: "The point of sale one is my favorite. He went to the shop in person to see how they run things. Hover over any card and I'll look at it with you.",
      expression: "smirk",
      voice: "/voice/projects-more.mp3",
    },
  },
  skills: {
    text: "These are the tools he works with. I'd offer to help, but I'm a ball of liquid metal and I don't have hands.",
    expression: "curious",
    voice: "/voice/skills.mp3",
    more: {
      text: "If the rows are moving too fast, point at one and it'll stop. I needed that the first time too.",
      expression: "smirk",
      voice: "/voice/skills-more.mp3",
    },
  },
  contact: {
    text: "And that's the tour. If anything here caught your eye, his email is right below. He does read his messages, I've seen him do it.",
    expression: "happy",
    voice: "/voice/contact.mp3",
    more: {
      text: "Before you go, you can click on me. I know a few tricks, and I don't get to show them off very often.",
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
