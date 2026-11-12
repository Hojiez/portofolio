"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

/*
 * TiltCard — kartu gelap bertepi tipis yang sedikit miring mengikuti kursor
 * (desktop saja). Saat disentuh kursor, tepinya berkilau di titik terdekat
 * kursor (.card-edge di globals.css) dan permukaannya ikut sedikit terang.
 */
export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    // posisi kilau tetap diperbarui walau gerak dikurangi
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${
      (x - 0.5) * 8
    }deg) translateY(-4px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative overflow-hidden rounded-2xl border border-line bg-surface transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {/* kilau permukaan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.06), transparent 60%)",
        }}
      />
      {/* kilau tepi */}
      <div
        aria-hidden="true"
        className="card-edge pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
