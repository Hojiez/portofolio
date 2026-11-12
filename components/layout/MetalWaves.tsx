"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useShaderGate } from "@/components/ui/useShaderGate";

/*
 * Latar gelombang logam: pita-pita perak yang meliuk sangat pelan di
 * belakang seluruh halaman. Dibuat megah tapi halus: transparan, memudar ke
 * arah bawah, dan digambar beresolusi rendah (latar buram tidak butuh detail,
 * dan ini menghemat kerja kartu grafis).
 *
 * Cadangan (tanpa WebGL / prefers-reduced-motion / sebelum shader boleh
 * menyala): gelombang diam dari gradien CSS (.metal-waves di globals.css).
 */

const Warp = dynamic(() => import("@/components/ui/WarpCanvas"), { ssr: false });

export function MetalWaves() {
  const ref = useRef<HTMLDivElement>(null);
  const { ready } = useShaderGate(ref, 4000);

  return (
    <div ref={ref} aria-hidden="true" className="metal-waves-mask absolute inset-0">
      <div className="metal-waves absolute inset-0" />
      {ready && (
        <Warp
          className="metal-waves-canvas absolute inset-0 h-full w-full"
          colors={["#08090b", "#1d2026", "#08090b", "#5f656e", "#08090b"]}
          proportion={0.45}
          softness={1}
          distortion={0.12}
          swirl={0.3}
          swirlIterations={3}
          shape="stripes"
          shapeScale={0.25}
          rotation={20}
          scale={2.4}
          speed={0.1}
          minPixelRatio={0.6}
          maxPixelCount={900_000}
        />
      )}
    </div>
  );
}
