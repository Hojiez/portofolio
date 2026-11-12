"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useShaderGate } from "./useShaderGate";

/*
 * MetalShader — bola "liquid metal" (WebGL). Dipakai di hero dan sebagai
 * badan Mochi (components/guide/Mascot.tsx).
 *
 * Cadangannya cakram logam dari CSS (.metal-disc di globals.css), dipakai saat
 * dirender di server, selama shader belum boleh menyala (lihat useShaderGate),
 * jika browser tidak mendukung WebGL, atau jika pengunjung memakai
 * prefers-reduced-motion.
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
  cssOnly = false,
}: {
  className?: string;
  scale?: number;
  speed?: number;
  look?: keyof typeof LOOKS;
  /** Pakai cakram logam CSS saja, tanpa shader (lebih ringan). */
  cssOnly?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const gate = useShaderGate(boxRef);
  const ready = gate.ready && !cssOnly;

  return (
    <div ref={boxRef} aria-hidden="true" className={`relative ${className}`}>
      {/* cadangan tetap di bawah sampai kanvas shader menutupinya */}
      <Fallback className="absolute inset-0" scale={scale} />
      {ready && (
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
