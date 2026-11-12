"use client";

import { useEffect, useRef } from "react";
import { MetalShader } from "@/components/ui/MetalShader";

/*
 * Bola logam yang hidup di seluruh halaman. Satu elemen, tiga wujud:
 *
 *   1. Hero    — bola besar di hero, di posisi penanda [data-orb-anchor].
 *   2. Scroll  — saat halaman di-scroll, bola mengecil dan meluncur ke tepi
 *                kanan, menjadi kapsul logam yang naik-turun mengikuti posisi
 *                scroll (seperti scroll bar).
 *   3. Kursor  — saat mouse mendekati kapsul, kapsul lepas dan menjadi kursor
 *                logam yang mengikuti mouse: memanjang searah gerakan cepat,
 *                membesar di atas tombol/link. Mouse diam IDLE_MS, keluar
 *                jendela, atau scroll kembali ke hero: kursor mengalir pulang.
 *
 * Perpindahan antar wujud tidak memakai animasi terpisah: posisi dan ukuran
 * bola selalu "dikejar" pelan-pelan menuju targetnya tiap frame, jadi semua
 * perubahan terlihat seperti logam cair yang mengalir.
 *
 * HP / layar sentuh: hanya wujud 1 dan 2. prefers-reduced-motion: tanpa
 * wujud kursor dan tanpa efek mengejar (langsung di posisi).
 */

const S = 300; // ukuran asli kanvas (px); wujud lain = skala dari ukuran ini
const BALL = 0.92; // diameter bola dibanding kotak kanvasnya
const HERO_BALL = 0.75; // diameter bola hero dibanding kotak penandanya
const IDLE_MS = 2600; // mouse diam selama ini: kursor kembali jadi scroll bar
const NEAR = 70; // jarak (px) mouse ke kapsul untuk berubah jadi kursor
const REARM = 150; // setelah kembali, mouse harus menjauh sejauh ini dulu

type Box = { x: number; y: number; w: number; h: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const INTERACTIVE = "a, button, [role=option], input, [data-mochi-curious]";

export function MetalOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    const dot = dotRef.current;
    const track = trackRef.current;
    if (!orb || !dot || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const canCursor = finePointer && !reduced;
    const root = document.documentElement;

    let cur: Box | null = null;
    let mode: "page" | "cursor" = "page";
    let armed = true; // boleh berubah jadi kursor lagi
    let pointer = { x: -999, y: -999 };
    let overInteractive = false;
    let idleTimer = 0;
    let frame = 0;
    let shown = false;

    const setCursorMode = (on: boolean) => {
      mode = on ? "cursor" : "page";
      root.classList.toggle("orb-cursor", on);
      dot.style.opacity = on ? "1" : "0";
      if (!on) armed = false;
    };

    /* Target wujud hero/scroll bar, dicampur sesuai seberapa jauh scroll. */
    const pageTarget = (): { box: Box; k: number } => {
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

      const { box: page, k } = pageTarget();
      // kembali ke hero: kursor pulang
      if (mode === "cursor" && k < 0.6) setCursorMode(false);

      const target: Box =
        mode === "cursor"
          ? { x: pointer.x, y: pointer.y, w: overInteractive ? 46 : 24, h: overInteractive ? 46 : 24 }
          : page;

      if (!cur || reduced) cur = { ...target };
      const prev = cur;
      // seberapa cepat mengejar: kursor paling lincah, scroll cukup cepat
      // supaya tidak tertinggal, perubahan ukuran sedikit lebih lembut
      const a = mode === "cursor" ? 0.32 : 0.24;
      const as = 0.16;
      cur = {
        x: lerp(prev.x, target.x, a),
        y: lerp(prev.y, target.y, a),
        w: lerp(prev.w, target.w, as),
        h: lerp(prev.h, target.h, as),
      };

      // memanjang searah gerakan (hanya wujud kursor)
      const vx = cur.x - prev.x;
      const vy = cur.y - prev.y;
      const speed = mode === "cursor" ? Math.min(0.55, Math.hypot(vx, vy) / 45) : 0;
      const angle = Math.atan2(vy, vx);
      const sx = (cur.w / (BALL * S)) * (1 + speed);
      const sy = (cur.h / (BALL * S)) * (1 - speed * 0.45);
      orb.style.transform =
        `translate3d(${cur.x - S / 2}px, ${cur.y - S / 2}px, 0) rotate(${angle}rad) ` +
        `scale(${speed ? sx : cur.w / (BALL * S)}, ${speed ? sy : cur.h / (BALL * S)}) rotate(${-angle}rad)`;
      // kapsul yang sedang jadi kursor tampil sedikit transparan di atas link
      orb.style.opacity = mode === "cursor" && overInteractive ? "0.8" : "1";

      // garis rel scroll bar, muncul seiring bola meninggalkan hero
      track.style.opacity = String(k * (mode === "cursor" ? 0.25 : 0.5));

      lastK = k;
      if (!shown) {
        shown = true;
        orb.classList.add("orb-shown");
      }
    };
    let lastK = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
      overInteractive = e.target instanceof Element && !!e.target.closest(INTERACTIVE);
      if (mode === "cursor") {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => setCursorMode(false), IDLE_MS);
        return;
      }
      // mouse digerakkan mendekati kapsul: berubah jadi kursor. (Hanya saat
      // mouse bergerak, bukan saat kapsul yang lewat di bawah mouse diam,
      // misalnya ketika scroll bar bawaan browser sedang diseret.)
      if (cur && lastK > 0.95) {
        const dist = Math.hypot(pointer.x - cur.x, (pointer.y - cur.y) * 0.6);
        if (!armed && dist > REARM) armed = true;
        if (armed && dist < NEAR) {
          setCursorMode(true);
          idleTimer = window.setTimeout(() => setCursorMode(false), IDLE_MS);
        }
      }
    };
    // mouse keluar jendela: kursor pulang
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget && mode === "cursor") setCursorMode(false);
    };

    frame = requestAnimationFrame(tick);
    if (canCursor) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseout", onOut);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onOut);
      root.classList.remove("orb-cursor");
    };
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
      {/* titik kecil di ujung kursor asli, supaya klik tetap presisi */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[91] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.65)]"
        style={{ opacity: 0 }}
      />
    </>
  );
}
