"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PROJECTS, SITE } from "@/content/site";
import { SCRIPT, wordsOf } from "@/content/script";
import { playVoice, stopVoice, wordTimings } from "@/components/guide/useVoice";
import { setLine } from "@/components/guide/guideStore";
import { Mascot } from "@/components/guide/Mascot";
import { setSoundOn, useSoundOn } from "@/components/guide/soundPref";
import { FOCUS } from "@/components/ui/styles";
import { introShouldShow, markIntroSeen } from "./introState";
import { sfxBlob, sfxCheck, sfxEnter, sfxKey, sfxReady, sfxToggleOn, unlockAudio } from "./sfx";

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
  mochi: boolean; // Mochi sudah muncul di terminal
  words: number; // jumlah kata sapaan Mochi yang sudah tampil
  ready: boolean; // baris "press ENTER" sudah tampil
};

// Sapaan Mochi di terminal = kalimat kursi "intro" di content/script.ts
const INTRO_WORDS = wordsOf("intro");

const START: Progress = {
  cmd: 0,
  install: false,
  answered: false,
  checks: 0,
  spinning: false,
  mochi: false,
  words: 0,
  ready: false,
};
const DONE: Progress = {
  cmd: CMD.length,
  install: true,
  answered: true,
  checks: CHECKS.length,
  spinning: false,
  mochi: true,
  words: INTRO_WORDS.length,
  ready: true,
};

/* Satu langkah: jeda (ms), perubahan tampilan, dan efek suara (opsional). */
type Step = [number, (p: Progress) => Progress, (() => void)?];

/* Urutan langkah beserta jedanya: ketikan dan instalasi ±3,9 detik, lalu
   Mochi muncul. Sapaannya ±1,6 detik tanpa suara, atau sepanjang file suaranya
   (±3,7 detik) jika suara aktif. */
function buildSchedule(): Step[] {
  const steps: Step[] = [];
  // tunggu blob logam pembuka mengembang dan melebur jadi jendela (lihat .intro-egg)
  steps.push([2100, (p) => p]);
  for (let i = 1; i <= CMD.length; i++) {
    // spasi tidak berbunyi, supaya ritmenya terdengar seperti mengetik sungguhan
    const sound = CMD[i - 1] === " " ? undefined : sfxKey;
    steps.push([45, (p) => ({ ...p, cmd: i }), sound]);
  }
  steps.push([300, (p) => ({ ...p, install: true }), sfxKey]); // tekan Enter
  steps.push([450, (p) => ({ ...p, answered: true }), sfxKey]); // ketik "y"
  CHECKS.forEach((_, i) => {
    steps.push([180, (p) => ({ ...p, checks: i + 1, spinning: true })]);
    steps.push([180, (p) => ({ ...p, spinning: false }), () => sfxCheck(i)]);
  });
  // Mochi muncul; sapaannya dijadwalkan terpisah (lihat greetingTimes)
  steps.push([300, (p) => ({ ...p, mochi: true })]);
  return steps;
}

/* Waktu muncul tiap kata sapaan Mochi (ms sejak mulai). Jika suaranya
   diputar, mengikuti durasi audio; jika tidak, kecepatan teks biasa. */
function greetingTimes(duration: number | null) {
  if (duration) return wordTimings(INTRO_WORDS, duration);
  let t = 350;
  return INTRO_WORDS.map((_, i) => {
    if (i > 0) t += /[.,!?]$/.test(INTRO_WORDS[i - 1]) ? 260 : 90;
    return t;
  });
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
  // Mochi di terminal dilepas setelah intro selesai memudar, supaya tidak
  // terus memakai WebGL di belakang layar.
  const [released, setReleased] = useState(false);

  const close = useCallback(() => {
    if (document.documentElement.getAttribute("data-intro") !== "show") return;
    stopVoice(); // sapaan Mochi berhenti jika intro ditutup di tengah kalimat
    sfxEnter();
    // sapaan intro dihitung sudah diucapkan (satu kalimat per kursi)
    setLine("intro", { shown: INTRO_WORDS.length, done: true });
    markIntroSeen();
    window.setTimeout(() => setReleased(true), 700);
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
      // teks langsung utuh; cukup satu bunyi "siap", tanpa rentetan bunyi tuts
      const id = window.setTimeout(() => {
        sfxReady();
        setP(DONE);
      }, 0);
      return () => window.clearTimeout(id);
    }

    // bunyi blob pembuka (hanya terdengar jika suara On dan browser sudah
    // mengizinkan audio; lihat sfx.ts)
    sfxBlob();

    const steps = buildSchedule();
    let i = 0;
    let cancelled = false;
    const pending: number[] = [];
    const later = (fn: () => void, ms: number) => pending.push(window.setTimeout(fn, ms));

    // Sapaan Mochi: putar suaranya (jika suara aktif dan diizinkan browser),
    // munculkan kata-katanya mengikuti suara, lalu baris "press ENTER".
    const greet = () => {
      void playVoice(SCRIPT.intro.voice).then((duration) => {
        if (cancelled) return;
        const times = greetingTimes(duration);
        times.forEach((t, w) => later(() => setP((q) => ({ ...q, words: w + 1 })), t));
        const end = duration ? duration * 1000 : times[times.length - 1];
        later(() => {
          sfxReady();
          setP((q) => ({ ...q, ready: true }));
        }, end + 250);
      });
    };

    const run = () => {
      if (i >= steps.length) return greet();
      const [wait, apply, sound] = steps[i++];
      later(() => {
        sound?.();
        setP(apply);
        run();
      }, wait);
    };
    run();
    return () => {
      cancelled = true;
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Interaksi pertama pengunjung (klik, tap, tombol) membuka izin suara browser.
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
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
        <div className="relative w-full max-w-[640px]">
        {/* blob logam cair pembuka: mengembang dari telur kecil lalu melebur
            menjadi jendela terminal di bawahnya */}
        <div aria-hidden="true" className="intro-egg pointer-events-none absolute inset-0 z-10" />
        <div className="intro-window relative w-full overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
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

            {/* Mochi muncul dan menyapa */}
            {p.mochi && (
              <div className="intro-mochi mt-4 flex items-center gap-3">
                <div className="h-[56px] w-[56px] shrink-0">
                  {!released && (
                    <Mascot
                      size={56}
                      expression={p.words < INTRO_WORDS.length ? "talk" : "happy"}
                      look={{ x: 0.7, y: 0.05 }}
                    />
                  )}
                </div>
                <p className="font-[family-name:var(--font-inter)] text-[15px] leading-snug text-fg/90">
                  {INTRO_WORDS.map((w, i) => (
                    <span key={i} className={`guide-word ${i < p.words ? "is-on" : ""}`}>
                      {w}{" "}
                    </span>
                  ))}
                </p>
              </div>
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
              onClick={(e) => {
                setSoundOn(on);
                if (on) sfxToggleOn();
                // Diklik dengan mouse/tap (bukan keyboard): kembalikan fokus ke
                // terminal, supaya Enter berikutnya melanjutkan intro, bukan
                // menekan tombol ini lagi.
                if (e.detail > 0) (enterRef.current ?? overlayRef.current)?.focus({ preventScroll: true });
              }}
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
