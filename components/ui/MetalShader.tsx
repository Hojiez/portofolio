"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/*
 * MetalShader — satu elemen "liquid metal" (WebGL) untuk hero.
 *
 * Shader dimuat terpisah setelah halaman tampil, jadi tidak memperberat muat
 * awal. Cadangannya cakram logam dari CSS (.metal-disc di globals.css), dipakai:
 *   - saat dirender di server dan selama shader dimuat,
 *   - jika browser tidak mendukung WebGL,
 *   - jika pengunjung memakai prefers-reduced-motion.
 */

function Fallback({ className }: { className: string }) {
  return <div aria-hidden="true" className={`metal-disc rounded-full ${className}`} />;
}

const LiquidMetal = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.LiquidMetal),
  { ssr: false, loading: () => <Fallback className="h-full w-full" /> }
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

export function MetalShader({ className = "" }: { className?: string }) {
  const animate = useSyncExternalStore(subscribeMotion, canAnimate, canAnimateOnServer);

  if (!animate) return <Fallback className={className} />;

  return (
    <div aria-hidden="true" className={className}>
      <LiquidMetal
        className="h-full w-full"
        shape="circle"
        colorBack="#00000000"
        colorTint="#ffffff"
        repetition={2}
        softness={0.15}
        shiftRed={0.15}
        shiftBlue={0.15}
        distortion={0.08}
        contour={0.45}
        angle={70}
        scale={0.75}
        speed={0.6}
      />
    </div>
  );
}
