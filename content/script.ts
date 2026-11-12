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

// Angka project ditulis sebagai kata ("Seven"), mengikuti jumlah di content/site.ts.
const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const projectCount = NUMBER_WORDS[PROJECTS.length] ?? String(PROJECTS.length);

// >>> GANTI DENGAN DATA KAMU (opsional): kalimat Mochi
export const SCRIPT: Record<SeatId, ScriptLine> = {
  intro: {
    text: "Oh, a visitor! I'm Mochi. Press Enter and I'll show you around.",
    expression: "happy",
    voice: "/voice/intro.mp3",
  },
  hero: {
    text: "That's Rauh. Everyone calls him Hessed. He made me, so I have to say nice things.",
    expression: "smug",
    voice: "/voice/hero.mp3",
  },
  about: {
    text: "This is where he talks about himself. I'd skim it, but I'm a blob of liquid metal.",
    expression: "happy",
    voice: "/voice/about.mp3",
  },
  projects: {
    text: `${projectCount} things he built. One of them is three furniture stores in a trench coat.`,
    expression: "smug",
    voice: "/voice/projects.mp3",
  },
  skills: {
    text: "The tools he uses. I can't use any of them. No thumbs.",
    expression: "curious",
    voice: "/voice/skills.mp3",
  },
  contact: {
    text: "That's the tour. If you liked it, email him. If you didn't, it was my fault.",
    expression: "happy",
    voice: "/voice/contact.mp3",
  },
};

/** Kalimat dipecah per kata, untuk efek muncul kata demi kata. */
export function wordsOf(id: SeatId) {
  return SCRIPT[id].text.split(" ");
}
