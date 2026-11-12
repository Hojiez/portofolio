"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { INTRO_DONE_EVENT } from "@/components/intro/introState";

/*
 * MetalShader — bola "liquid metal" (WebGL). Dipakai di hero dan sebagai
 * badan Mochi (components/guide/Mascot.tsx).
 *
 * Shader dimuat terpisah setelah halaman tampil, jadi tidak memperberat muat
 * awal. Cadangannya cakram logam dari CSS (.metal-disc di globals.css), dipakai:
 *   - saat dirender di server dan selama shader dimuat,
 *   - jika browser tidak mendukung WebGL,
 *   - jika pengunjung memakai prefers-reduced-motion.
 *
 * `scale` = diameter bola dibanding kotaknya (1 = memenuhi kotak). Cadangan
 * CSS memakai ukuran yang sama supaya tidak "melompat" saat shader muncul.
 */

function Fallback({ className, scale }: { className: string; scale: number }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center ${className}`}>
      <div
        className="metal-disc rounded-full"
        style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
      />
    </div>
  );
}

const LiquidMetal = dynamic(() => import("./LiquidMetalCanvas"), { ssr: false });

// --- Deteksi kemampuan browser (hanya berjalan di browser) ------------------

let webglSupport: boolean | undefined;
function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const canAnimate = () => hasWebGL() && !window.matchMedia(REDUCED).matches;
const canAnimateOnServer = () => false;

// ---------------------------------------------------------------------------

/* Dua tampilan logam:
 *   "orb"  — pita pantulan tajam dan kontras, untuk bola di hero.
 *   "soft" — pantulan lebar dan halus, untuk badan Mochi supaya wajahnya
 *            tetap terbaca dan tidak ada pola gelap yang mirip mulut. */
const LOOKS = {
  orb: { repetition: 2, softness: 0.15, shiftRed: 0.15, shiftBlue: 0.15, distortion: 0.08, contour: 0.45, angle: 70 },
  soft: { repetition: 1.2, softness: 0.5, shiftRed: 0.1, shiftBlue: 0.1, distortion: 0.04, contour: 0.15, angle: 100 },
};

export function MetalShader({
  className = "",
  scale = 0.75,
  speed = 0.6,
  look = "orb",
}: {
  className?: string;
  scale?: number;
  speed?: number;
  look?: keyof typeof LOOKS;
}) {
  const animate = useSyncExternalStore(subscribeMotion, canAnimate, canAnimateOnServer);
  const boxRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Shader baru dimuat saat kotaknya dekat layar DAN browser sedang senggang,
  // supaya tidak membebani saat halaman pertama dibuka (Lighthouse: Total
  // Blocking Time). Sampai saat itu yang tampil cakram CSS.
  // Shader di halaman (#page) juga menunggu intro ditutup: selama intro tampil
  // halaman tersembunyi, jadi menyalakan shader di belakangnya hanya membuang
  // tenaga perangkat.
  useEffect(() => {
    const el = boxRef.current;
    if (!animate || !el) return;
    let idle: number | undefined;
    const whenIdle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const behindIntro = () =>
      !!el.closest("#page") && document.documentElement.getAttribute("data-intro") === "show";
    const start = () => {
      if (behindIntro()) return; // dicoba lagi saat intro ditutup
      window.removeEventListener(INTRO_DONE_EVENT, start);
      idle = whenIdle(() => setReady(true), { timeout: 2500 });
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        window.addEventListener(INTRO_DONE_EVENT, start);
        start();
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener(INTRO_DONE_EVENT, start);
      if (idle !== undefined) cancelIdle(idle);
    };
  }, [animate]);

  return (
    <div ref={boxRef} aria-hidden="true" className={`relative ${className}`}>
      {/* cadangan tetap di bawah sampai kanvas shader menutupinya */}
      <Fallback className="absolute inset-0" scale={scale} />
      {animate && ready && (
        <LiquidMetal
          className="absolute inset-0 h-full w-full"
          shape="circle"
          colorBack="#00000000"
          colorTint="#ffffff"
          {...LOOKS[look]}
          scale={scale}
          speed={speed}
        />
      )}
    </div>
  );
}
