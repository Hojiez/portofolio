"use client";

import { useEffect, useRef } from "react";

/*
 * Teks logam yang "menyala" kata demi kata mengikuti scroll: saat paragraf
 * naik melewati layar, kata-katanya berubah dari redup menjadi logam terang.
 * Tiap kata punya gradien logamnya sendiri (.metal-text), karena gradien yang
 * dipotong ke teks tidak bisa diredupkan per kata dari luar.
 *
 * Tanpa JavaScript atau dengan prefers-reduced-motion: semua kata terang.
 */
export function ScrollLitText({
  text,
  as: Tag = "p",
  className = "",
}: {
  text: string;
  as?: "p" | "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = [...el.querySelectorAll<HTMLSpanElement>("[data-word]")];
    let frame = 0;

    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 saat bagian atas paragraf di 85% tinggi layar, 1 saat bagian
      // bawahnya mencapai 45% (sudah terbaca di tengah layar)
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
      const lit = p * (spans.length + 1);
      spans.forEach((s, i) => {
        s.style.opacity = String(0.14 + 0.86 * Math.max(0, Math.min(1, lit - i)));
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [text]);

  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i}>
          <span data-word className="metal-text transition-opacity duration-150">
            {w}
          </span>{" "}
        </span>
      ))}
    </Tag>
  );
}
