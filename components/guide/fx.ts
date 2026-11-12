/*
 * Efek partikel kecil di sekitar Mochi: kepulan debu saat mendarat dan
 * percikan saat teleport/berputar. Elemen dibuat sementara di #page lalu
 * dihapus setelah animasinya selesai. Hanya transform dan opacity yang
 * dianimasikan, jadi ringan.
 */

import type { FxKind } from "./moves";

export function burst(kind: FxKind, x: number, y: number) {
  const page = document.getElementById("page");
  if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const count = kind === "dust" ? 9 : 12;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = kind === "dust" ? "fx-dust" : "fx-spark";
    const size = kind === "dust" ? 10 + Math.random() * 12 : 3 + Math.random() * 4;
    el.style.width = el.style.height = `${size}px`;
    el.style.left = `${x - size / 2}px`;
    el.style.top = `${y - size / 2}px`;
    page.appendChild(el);

    let dx: number, dy: number;
    if (kind === "dust") {
      // debu menyebar ke samping di permukaan tanah, sedikit naik
      const side = i % 2 ? 1 : -1;
      dx = side * (20 + Math.random() * 50);
      dy = -(4 + Math.random() * 18);
    } else {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const r = 30 + Math.random() * 40;
      dx = Math.cos(a) * r;
      dy = Math.sin(a) * r;
    }
    el.animate(
      [
        { transform: "translate(0, 0) scale(0.6)", opacity: kind === "dust" ? 0.55 : 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${kind === "dust" ? 1.6 : 0.4})`, opacity: 0 },
      ],
      { duration: kind === "dust" ? 650 + Math.random() * 250 : 550 + Math.random() * 250, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
    ).onfinish = () => el.remove();
  }
}
