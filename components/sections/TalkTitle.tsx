"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
 * Judul raksasa "Let's talk." di Contact yang bereaksi ke kursor (Motion):
 *   - huruf yang dekat kursor terdorong menjauh dan sedikit miring, lalu
 *     memantul kembali seperti cairan saat kursor pergi;
 *   - sorot cahaya putih mengikuti kursor di permukaan huruf, seperti senter
 *     di atas logam.
 * Hanya untuk mouse; dengan prefers-reduced-motion atau layar sentuh,
 * judulnya diam (tetap bergradien logam).
 */

const RADIUS = 220; // jarak pengaruh kursor (px)
const PUSH = 26; // dorongan maksimum (px)
const SPRING = { stiffness: 220, damping: 13, mass: 0.6 };

function Letter({ char, px, py }: { char: string; px: MotionValue<number>; py: MotionValue<number> }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const rotate = useSpring(0, SPRING);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = cx - px.get();
    const dy = cy - py.get();
    const dist = Math.hypot(dx, dy);
    const f = Math.max(0, 1 - dist / RADIUS) ** 2;
    x.set(dist ? (dx / dist) * PUSH * f : 0);
    y.set(dist ? (dy / dist) * PUSH * f : 0);
    rotate.set((dx / RADIUS) * -14 * f);
    // posisi sorot cahaya relatif terhadap huruf (persen); jauh = di luar huruf
    el.style.setProperty("--lx", `${((px.get() - r.left) / r.width) * 100}%`);
    el.style.setProperty("--ly", `${((py.get() - r.top) / r.height) * 100}%`);
  };
  useMotionValueEvent(px, "change", update);
  useMotionValueEvent(py, "change", update);

  if (char === " ") return <span> </span>;
  return (
    <motion.span ref={ref} className="spot-text metal-text inline-block" style={{ x, y, rotate }}>
      {char}
    </motion.span>
  );
}

export function TalkTitle({ text, className = "" }: { text: string; className?: string }) {
  const px = useMotionValue(-1e4);
  const py = useMotionValue(-1e4);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const id = requestAnimationFrame(() => setLive(mq.matches));
    if (!mq.matches) return () => cancelAnimationFrame(id);
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX);
      py.set(e.clientY);
    };
    // kursor keluar jendela: huruf kembali ke tempatnya
    const onOut = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      px.set(-1e4);
      py.set(-1e4);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onOut);
    };
  }, [px, py]);

  return (
    <p className={className} aria-label={text}>
      {live ? (
        <span aria-hidden="true">
          {[...text].map((c, i) => (
            <Letter key={i} char={c} px={px} py={py} />
          ))}
        </span>
      ) : (
        <span className="metal-text">{text}</span>
      )}
    </p>
  );
}
