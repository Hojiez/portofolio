"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PROJECTS, SITE } from "@/content/site";
import { setSoundOn, useSoundOn } from "@/components/guide/soundPref";
import { FOCUS } from "@/components/ui/styles";
import { introShouldShow, markIntroSeen } from "./introState";

/*
 * Intro terminal (docs/MASTER_PLAN.md bagian 4).
 *
 * Tampil atau tidaknya diatur oleh atribut <html data-intro> (lihat
 * introState.ts) dan CSS bagian INTRO di globals.css. Komponen ini hanya
 * mengatur efek ketik dan tombol-tombolnya.
 */

const CMD = "npx start @rauh";

const CHECKS: { mark: "✔" | "+"; label: string; value: string }[] = [
  { mark: "✔", label: "role", value: SITE.role },
  { mark: "✔", label: "based", value: SITE.location },
  { mark: "✔", label: "shipped", value: `${PROJECTS.length} projects` },
  { mark: "✔", label: "status", value: SITE.status.toLowerCase() },
  { mark: "+", label: "guide", value: "Mochi" },
];

/* Kemajuan efek ketik. */
type Progress = {
  cmd: number; // jumlah huruf perintah yang sudah diketik
  install: boolean; // "Need to install..." sudah tampil
  answered: boolean; // "(y) y" sudah dijawab
  checks: number; // jumlah baris centang yang sudah tampil
  spinning: boolean; // baris centang terakhir masih memuat
  ready: boolean; // baris "press ENTER" sudah tampil
};

const START: Progress = { cmd: 0, install: false, answered: false, checks: 0, spinning: false, ready: false };
const DONE: Progress = { cmd: CMD.length, install: true, answered: true, checks: CHECKS.length, spinning: false, ready: true };

/* Urutan langkah beserta jedanya (ms). Total sekitar 4,3 detik:
   400 + 15×45 + 300 + 450 + 5×(220+220) + 300. */
function buildSchedule(): [number, (p: Progress) => Progress][] {
  const steps: [number, (p: Progress) => Progress][] = [];
  steps.push([400, (p) => p]);
  for (let i = 1; i <= CMD.length; i++) steps.push([45, (p) => ({ ...p, cmd: i })]);
  steps.push([300, (p) => ({ ...p, install: true })]);
  steps.push([450, (p) => ({ ...p, answered: true })]);
  CHECKS.forEach((_, i) => {
    steps.push([220, (p) => ({ ...p, checks: i + 1, spinning: true })]);
    steps.push([220, (p) => ({ ...p, spinning: false })]);
  });
  steps.push([300, (p) => ({ ...p, ready: true })]);
  return steps;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Cursor() {
  return <span aria-hidden="true" className="intro-cursor ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] bg-fg/80" />;
}

export function Terminal() {
  const [p, setP] = useState<Progress>(START);
  const soundOn = useSoundOn();
  const enterRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    if (document.documentElement.getAttribute("data-intro") !== "show") return;
    markIntroSeen();
    // pindahkan fokus keyboard ke awal halaman
    document.getElementById("top")?.focus({ preventScroll: true });
  }, []);

  // Mode pengembangan: React Strict Mode menghapus atribut <html> yang
  // dipasang skrip awal. Pasang lagi sebelum layar digambar (tidak ada efek
  // di production).
  useLayoutEffect(() => {
    const d = document.documentElement;
    if (!d.hasAttribute("data-intro")) d.setAttribute("data-intro", introShouldShow() ? "show" : "seen");
  }, []);

  // Jalankan efek ketik jika intro tampil.
  useEffect(() => {
    if (document.documentElement.getAttribute("data-intro") !== "show") return;
    overlayRef.current?.focus({ preventScroll: true });

    if (reducedMotion()) {
      const id = window.setTimeout(() => setP(DONE), 0);
      return () => window.clearTimeout(id);
    }

    const steps = buildSchedule();
    let i = 0;
    let timer: number;
    const run = () => {
      if (i >= steps.length) return;
      const [wait, apply] = steps[i++];
      timer = window.setTimeout(() => {
        setP(apply);
        run();
      }, wait);
    };
    run();
    return () => window.clearTimeout(timer);
  }, []);

  // Enter menutup intro (kecuali saat fokus di tombol lain: tombol itu yang menangani).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (e.target instanceof HTMLButtonElement && e.target !== enterRef.current) return;
      e.preventDefault();
      close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Fokus ke tombol Enter begitu muncul, supaya pengguna keyboard langsung siap.
  useEffect(() => {
    if (p.ready && document.activeElement === overlayRef.current) enterRef.current?.focus({ preventScroll: true });
  }, [p.ready]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Intro"
      tabIndex={-1}
      className="intro-overlay fixed inset-0 z-[100] flex flex-col bg-ink outline-none"
    >
      {/* kilau redup di belakang terminal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 45% at 50% 45%, rgba(220,226,235,0.07), transparent 70%)" }}
      />

      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="intro-window w-full max-w-[640px] overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
          {/* bilah judul jendela */}
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-white/15" />
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-white/15" />
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-white/15" />
            <span className="flex-1 text-center font-[family-name:var(--font-mono)] text-xs text-muted">
              rauh@portfolio ~ zsh
            </span>
            <span aria-hidden="true" className="w-[52px]" />
          </div>

          {/* isi terminal */}
          <div
            className="min-h-[340px] px-5 py-5 font-[family-name:var(--font-mono)] text-[13px] leading-relaxed text-muted sm:text-sm"
          >
            <p>
              <span className="text-muted">~ $ </span>
              <span className="text-fg">{CMD.slice(0, p.cmd)}</span>
              {!p.install && <Cursor />}
            </p>

            {p.install && (
              <>
                <p className="mt-4">Need to install the following packages:</p>
                <p className="pl-[2ch] text-fg">@rauh/portfolio</p>
                <p>
                  Ok to proceed? (y) {p.answered ? <span className="text-fg">y</span> : <Cursor />}
                </p>
              </>
            )}

            {p.checks > 0 && (
              <ul className="mt-4">
                {CHECKS.slice(0, p.checks).map((c, i) => {
                  const loading = p.spinning && i === p.checks - 1;
                  return (
                    <li key={c.label} className="flex">
                      <span
                        className={`w-[2ch] ${
                          loading ? "intro-spin text-muted" : c.mark === "✔" ? "text-accent" : "text-fg"
                        }`}
                      >
                        {loading ? "◌" : c.mark}
                      </span>
                      <span className="w-[10ch] text-muted">{c.label}</span>
                      <span className="text-fg">{c.value}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {p.ready && (
              <p className="mt-4">
                <button
                  ref={enterRef}
                  type="button"
                  onClick={close}
                  aria-label="Press Enter to continue"
                  className={`group inline-flex items-center gap-2 rounded text-fg ${FOCUS}`}
                >
                  <span className="text-accent">➜</span>
                  <span>
                    press{" "}
                    <kbd className="metal-button rounded px-1.5 py-0.5 text-xs font-semibold">ENTER</kbd>{" "}
                    to continue
                  </span>
                  <Cursor />
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* tombol suara (tengah bawah) dan lewati (kanan bawah) */}
      <div className="relative flex items-center justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div
          role="group"
          aria-label="Sound"
          className="flex items-center gap-1 rounded-full border border-line bg-surface/80 p-1 font-[family-name:var(--font-mono)] text-xs"
        >
          <span className="px-2 text-muted">Sound</span>
          {[true, false].map((on) => (
            <button
              key={String(on)}
              type="button"
              aria-pressed={soundOn === on}
              onClick={() => setSoundOn(on)}
              className={`rounded-full px-3 py-1.5 ${FOCUS} ${
                soundOn === on ? "metal-button font-semibold" : "text-muted hover:text-fg"
              }`}
            >
              {on ? "On" : "Off"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={close}
          className={`absolute right-4 rounded px-2 py-1.5 text-xs text-muted transition-colors hover:text-fg sm:right-6 ${FOCUS}`}
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}
