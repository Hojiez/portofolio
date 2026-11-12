"use client";

import { useEffect, useRef } from "react";

/*
 * Angka sorotan yang "menghitung" saat pertama kali terlihat di layar:
 *   - angka biasa ("8", "3+") naik dari 0 ke nilainya;
 *   - nilai berhuruf ("C1") diacak sebentar lalu terkunci, seperti teks
 *     terminal yang sedang di-decode.
 * HTML awal sudah berisi nilai akhirnya, jadi tanpa JavaScript atau dengan
 * prefers-reduced-motion nilainya langsung tampil.
 */

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
const DURATION = 1100;

export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const m = value.match(/^(\d+)(\D*)$/); // angka + akhiran ("3+")
    let frame = 0;

    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / DURATION);
        const ease = 1 - Math.pow(1 - t, 3);
        if (m) {
          el.textContent = `${Math.round(Number(m[1]) * ease)}${m[2]}`;
        } else {
          // huruf terkunci dari kiri ke kanan; sisanya acak
          const locked = Math.floor(ease * value.length);
          el.textContent = [...value]
            .map((ch, i) => (i < locked || t === 1 ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join("");
        }
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.8 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  );
}
