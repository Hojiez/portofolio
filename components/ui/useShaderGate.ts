"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { INTRO_DONE_EVENT } from "@/components/intro/introState";

/*
 * Kapan sebuah shader WebGL boleh dinyalakan. Dipakai bola logam (MetalShader)
 * dan latar gelombang (MetalWaves).
 *
 *   animate — browser mendukung WebGL dan pengunjung tidak memakai
 *             prefers-reduced-motion. Jika false, tampilkan cadangan CSS.
 *   ready   — elemen sudah dekat layar, intro sudah ditutup (untuk elemen di
 *             #page), dan browser sedang senggang. Menyalakan shader lebih awal
 *             membebani muat halaman (Lighthouse: Total Blocking Time) dan
 *             membuang tenaga untuk sesuatu yang belum terlihat.
 */

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

export function useShaderGate(ref: RefObject<HTMLElement | null>, idleTimeout = 2500) {
  const animate = useSyncExternalStore(subscribeMotion, canAnimate, canAnimateOnServer);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!animate || !el) return;
    let idle: number | undefined;
    const whenIdle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const behindIntro = () =>
      !!el.closest("#page") && document.documentElement.getAttribute("data-intro") === "show";
    const start = () => {
      if (behindIntro()) return; // dicoba lagi saat intro ditutup
      window.removeEventListener(INTRO_DONE_EVENT, start);
      idle = whenIdle(() => setReady(true), { timeout: idleTimeout });
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
  }, [animate, ref, idleTimeout]);

  return { animate, ready: animate && ready };
}
