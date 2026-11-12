"use client";

import { useEffect, useRef } from "react";
import { MetalShader } from "@/components/ui/MetalShader";

/*
 * Bola logam di hero yang menjadi scroll bar.
 *
 *   1. Hero    — bola besar di hero, di posisi penanda [data-orb-anchor].
 *   2. Scroll  — saat halaman di-scroll, bola mengecil dan meluncur ke tepi
 *                kanan, menjadi kapsul logam yang naik-turun mengikuti posisi
 *                scroll (seperti scroll bar).
 *
 * Perpindahan tidak memakai animasi terpisah: posisi dan ukuran bola selalu
 * "dikejar" pelan-pelan menuju targetnya tiap frame, jadi terlihat seperti
 * logam cair yang mengalir. prefers-reduced-motion: langsung di posisi.
 *
 * Kursor logam adalah elemen terpisah (MetalCursor.tsx).
 */

const S = 300; // ukuran asli kanvas (px); wujud lain = skala dari ukuran ini
const BALL = 0.92; // diameter bola dibanding kotak kanvasnya
const HERO_BALL = 0.75; // diameter bola hero dibanding kotak penandanya

type Box = { x: number; y: number; w: number; h: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function MetalOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    const track = trackRef.current;
    if (!orb || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let cur: Box | null = null;
    let frame = 0;
    let shown = false;

    /* Target: campuran wujud hero dan scroll bar sesuai seberapa jauh scroll. */
    const target = (): { box: Box; k: number } => {
      const vw = root.clientWidth; // lebar tanpa scrollbar bawaan browser
      const vh = window.innerHeight;
      const mobile = vw < 768;
      const max = root.scrollHeight - vh;
      const progress = max > 0 ? clamp01(window.scrollY / max) : 0;

      // scroll bar: kapsul di tepi kanan, di antara navbar dan bawah layar
      const w = mobile ? 7 : 11;
      const h = mobile ? 40 : 54;
      const top = mobile ? 96 : 112;
      const bottom = vh - (mobile ? 110 : 40); // di HP, beri ruang untuk Mochi di pojok
      const bar: Box = { x: vw - (mobile ? 10 : 20), y: top + h / 2 + progress * (bottom - top - h), w, h };

      const k = smooth(clamp01(window.scrollY / (vh * 0.55)));
      const anchor = document.querySelector("[data-orb-anchor]")?.getBoundingClientRect();
      if (!anchor || k >= 1) return { box: bar, k };
      const d = anchor.width * HERO_BALL;
      const hero: Box = { x: anchor.left + anchor.width / 2, y: anchor.top + anchor.height / 2, w: d, h: d };
      return {
        box: {
          x: lerp(hero.x, bar.x, k),
          y: lerp(hero.y, bar.y, k),
          w: lerp(hero.w, bar.w, k),
          h: lerp(hero.h, bar.h, k),
        },
        k,
      };
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (root.getAttribute("data-intro") === "show") return;

      const { box, k } = target();
      if (!cur || reduced) cur = { ...box };
      cur = {
        x: lerp(cur.x, box.x, 0.24),
        y: lerp(cur.y, box.y, 0.24),
        w: lerp(cur.w, box.w, 0.16),
        h: lerp(cur.h, box.h, 0.16),
      };
      orb.style.transform =
        `translate3d(${cur.x - S / 2}px, ${cur.y - S / 2}px, 0) ` +
        `scale(${cur.w / (BALL * S)}, ${cur.h / (BALL * S)})`;
      // garis rel scroll bar, muncul seiring bola meninggalkan hero
      track.style.opacity = String(k * 0.5);

      if (!shown) {
        shown = true;
        orb.classList.add("orb-shown");
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {/* rel tipis tempat kapsul scroll bar meluncur */}
      <div
        ref={trackRef}
        aria-hidden="true"
        className="pointer-events-none fixed bottom-10 right-5 top-28 z-[89] w-px bg-gradient-to-b from-transparent via-white/40 to-transparent max-md:bottom-[110px] max-md:right-2.5 max-md:top-24"
        style={{ opacity: 0 }}
      />
      <div
        ref={orbRef}
        aria-hidden="true"
        className="metal-orb pointer-events-none fixed left-0 top-0 z-[90]"
        style={{ width: S, height: S, transform: "translate3d(-999px, -999px, 0)" }}
      >
        <MetalShader className="h-full w-full" scale={BALL} />
      </div>
    </>
  );
}
