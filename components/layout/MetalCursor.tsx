"use client";

import { useEffect, useRef, useState } from "react";
import { MetalShader } from "@/components/ui/MetalShader";

/*
 * Kursor logam: blob logam cair kecil yang menggantikan kursor biasa di
 * seluruh halaman (kursor asli disembunyikan, kecuali di kolom ketik).
 *
 *   - Menempel di ujung mouse, memanjang searah gerakan cepat.
 *   - Membesar dan sedikit transparan di atas tombol, link, dan kartu.
 *   - Mengecil sebentar saat diklik.
 *   - Hilang saat mouse keluar jendela, muncul lagi saat mouse bergerak.
 *
 * Hanya untuk mouse (bukan layar sentuh) dan tidak dipakai untuk pengunjung
 * yang memakai prefers-reduced-motion: mereka memakai kursor biasa.
 */

const C = 96; // ukuran asli kanvas (px); ukuran tampil = skala dari ini
const BALL = 0.92; // diameter bola dibanding kotak kanvasnya
const SIZE = 22; // diameter normal (px)
const SIZE_HOVER = 42; // diameter di atas elemen yang bisa diklik
const INTERACTIVE = "a, button, [role=option], [data-mochi-curious]";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function MetalCursor() {
  const ref = useRef<HTMLDivElement>(null);
  // dipasang hanya di perangkat bermouse; di server dan HP tidak dirender
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(mq.matches);
    const id = requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const root = document.documentElement;

    let pointer: { x: number; y: number } | null = null;
    let cur = { x: 0, y: 0, d: SIZE };
    let hover = false;
    let press = 0; // 0–1, mengecil sesaat setelah diklik
    let frame = 0;

    const show = (on: boolean) => {
      el.style.opacity = on ? "1" : "0";
      root.classList.toggle("metal-cursor-on", on);
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!pointer) return;
      const prev = cur;
      const target = hover ? SIZE_HOVER : SIZE;
      // menempel ketat di ujung mouse supaya klik tetap presisi
      cur = { x: lerp(prev.x, pointer.x, 0.55), y: lerp(prev.y, pointer.y, 0.55), d: lerp(prev.d, target, 0.2) };
      press = Math.max(0, press - 0.08);

      const vx = cur.x - prev.x;
      const vy = cur.y - prev.y;
      const speed = Math.min(0.55, Math.hypot(vx, vy) / 40);
      const base = (cur.d / (BALL * C)) * (1 - press * 0.25);
      // urutan transform (dibaca dari kanan): ukuran dulu, lalu regangan
      // searah gerakan
      const stretch =
        speed > 0.01
          ? (() => {
              const a = Math.atan2(vy, vx);
              return `rotate(${a}rad) scale(${1 + speed}, ${1 - speed * 0.45}) rotate(${-a}rad) `;
            })()
          : "";
      el.style.transform = `translate3d(${cur.x - C / 2}px, ${cur.y - C / 2}px, 0) ${stretch}scale(${base})`;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!pointer) cur = { x: e.clientX, y: e.clientY, d: SIZE }; // muncul langsung di mouse
      pointer = { x: e.clientX, y: e.clientY };
      hover = e.target instanceof Element && !!e.target.closest(INTERACTIVE);
      el.style.setProperty("--cursor-alpha", hover ? "0.75" : "1");
      show(true);
    };
    const onDown = () => {
      press = 1;
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) show(false);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseout", onOut);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseout", onOut);
      root.classList.remove("metal-cursor-on");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      // di atas semua lapisan, termasuk layar intro (z-100) dan command palette
      className="metal-cursor pointer-events-none fixed left-0 top-0 z-[200]"
      style={{ width: C, height: C, opacity: 0, transform: "translate3d(-999px, -999px, 0)" }}
    >
      <MetalShader className="h-full w-full" scale={BALL} speed={0.8} />
    </div>
  );
}
