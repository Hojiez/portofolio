/*
 * Cara bagian lain situs (command palette, tombol salin email) meminta
 * Mochi bereaksi, tanpa harus mengenal komponen Guide secara langsung.
 * Guide.tsx mendengarkan event ini.
 */

export const MOCHI_REACT_EVENT = "mochi:react";

/** cheer = berputar senang, trick = salto, smirk = menyeringai */
export type MochiReaction = "cheer" | "trick" | "smirk";

export function reactMochi(reaction: MochiReaction) {
  window.dispatchEvent(new CustomEvent<MochiReaction>(MOCHI_REACT_EVENT, { detail: reaction }));
}
