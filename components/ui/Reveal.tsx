"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Reveal — elemen muncul halus saat masuk layar.
 *
 * Semua section memakai aturan yang sama: elemen ke-n dalam satu kelompok
 * muncul n × STAGGER ms setelah yang pertama (paling lambat MAX_STEP langkah,
 * supaya daftar panjang tidak terasa lama menunggu).
 */
const STAGGER = 80;
const MAX_STEP = 5;

export function Reveal({
  children,
  step = 0,
  className = "",
}: {
  children: ReactNode;
  /** Urutan elemen dalam kelompoknya (0 = pertama). */
  step?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Browser lama tanpa IntersectionObserver: langsung tampilkan.
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${Math.min(step, MAX_STEP) * STAGGER}ms` }}
      className={`transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none ${
        shown
          ? // filter-none (bukan blur-0) supaya efek kaca backdrop-blur di dalamnya tetap bekerja
            "translate-y-0 opacity-100 filter-none"
          : "translate-y-6 opacity-0 blur-[2px] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:filter-none"
      } ${className}`}
    >
      {children}
    </div>
  );
}
