"use client";

import { SCRIPT, SEATS } from "@/content/script";
import { canAnimateShader } from "@/components/ui/useShaderGate";
import { preloadChime } from "./sfx";

/*
 * Aset yang dimuat selama loading screen intro, supaya setelahnya semua
 * langsung siap: keenam file suara Mochi, font, dan kode shader (bola logam,
 * badan Mochi, kotak logam pembuka, latar gelombang).
 *
 * Tidak pernah menahan intro terlalu lama: jika ada yang lambat atau gagal,
 * intro tetap jalan setelah MAX_WAIT (yang gagal dimuat nanti saat dipakai).
 */

const MAX_WAIT = 6000;

export async function preloadIntroAssets(onProgress: (done: number, total: number) => void) {
  const tasks: Promise<unknown>[] = [
    ...SEATS.map((id) => fetch(SCRIPT[id].voice).then((r) => r.blob())),
    preloadChime(), // chord piano saat kotak logam menghilang
    document.fonts?.ready ?? Promise.resolve(),
  ];
  if (canAnimateShader()) {
    tasks.push(import("@/components/ui/LiquidMetalCanvas"), import("@/components/ui/WarpCanvas"));
  }

  let done = 0;
  const total = tasks.length;
  onProgress(0, total);
  const tracked = tasks.map((t) =>
    t
      .catch(() => {})
      .then(() => {
        done += 1;
        onProgress(done, total);
      })
  );
  await Promise.race([Promise.all(tracked), new Promise((r) => window.setTimeout(r, MAX_WAIT))]);
}
