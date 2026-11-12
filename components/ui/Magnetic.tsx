"use client";

import { useEffect } from "react";

/*
 * Tombol "magnet": elemen bertanda [data-magnetic] tertarik sedikit ke arah
 * kursor saat kursor mendekat (dalam RADIUS px dari tepinya), lalu kembali
 * ke tempatnya dengan pantulan halus saat kursor menjauh.
 *
 * Satu pendengar untuk seluruh halaman. Pergeseran dipasang lewat properti
 * CSS `translate` (bukan `transform`), jadi tidak bentrok dengan animasi lain
 * pada elemen yang sama. Hanya untuk mouse; tidak aktif dengan
 * prefers-reduced-motion.
 */

const RADIUS = 70; // jarak tarik di luar tepi elemen (px)
const PULL = 0.32; // seberapa kuat tertarik (bagian dari jarak ke kursor)
const MAX = 14; // pergeseran maksimum (px)

export function Magnetic() {
  useEffect(() => {
    const ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;
    let frame = 0;
    let pointer = { x: -1e4, y: -1e4 };
    const active = new Set<HTMLElement>();

    const update = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        // jarak kursor ke kotak elemen (0 jika di dalamnya)
        const dx = Math.max(r.left - pointer.x, 0, pointer.x - r.right);
        const dy = Math.max(r.top - pointer.y, 0, pointer.y - r.bottom);
        const near = Math.hypot(dx, dy) < RADIUS;
        if (near) {
          // tarik ke arah kursor, makin dekat makin kuat
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const strength = PULL * (1 - Math.hypot(dx, dy) / RADIUS);
          const tx = Math.max(-MAX, Math.min(MAX, (pointer.x - cx) * strength));
          const ty = Math.max(-MAX, Math.min(MAX, (pointer.y - cy) * strength));
          el.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
          el.classList.add("is-magnet");
          active.add(el);
        } else if (active.has(el)) {
          el.style.translate = "";
          el.classList.remove("is-magnet");
          active.delete(el);
        }
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(update);
    };
    const reset = () => {
      pointer = { x: -1e4, y: -1e4 };
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) reset();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("mouseout", onOut);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", reset);
      document.removeEventListener("mouseout", onOut);
      active.forEach((el) => {
        el.style.translate = "";
        el.classList.remove("is-magnet");
      });
    };
  }, []);

  return null;
}
