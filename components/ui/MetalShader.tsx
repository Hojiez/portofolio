"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

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

const LiquidMetal = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.LiquidMetal),
  { ssr: false }
);

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

  if (!animate) return <Fallback className={className} scale={scale} />;

  return (
    <div aria-hidden="true" className={`relative ${className}`}>
      {/* cadangan tetap di bawah sampai kanvas shader menutupinya */}
      <Fallback className="absolute inset-0" scale={scale} />
      <LiquidMetal
        className="absolute inset-0 h-full w-full"
        shape="circle"
        colorBack="#00000000"
        colorTint="#ffffff"
        {...LOOKS[look]}
        scale={scale}
        speed={speed}
      />
    </div>
  );
}
