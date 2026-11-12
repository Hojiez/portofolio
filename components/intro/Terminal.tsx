"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { PROJECTS, SITE } from "@/content/site";
import { SCRIPT, wordsOf } from "@/content/script";
import { playVoice, stopVoice, wordTimings } from "@/components/guide/useVoice";
import { setLine } from "@/components/guide/guideStore";
import { Mascot, type MascotLook } from "@/components/guide/Mascot";
import { useCanAnimateShader } from "@/components/ui/useShaderGate";
import dynamic from "next/dynamic";
import { preloadIntroAssets } from "./preload";
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

/* Urutan langkah beserta jedanya, dibuat santai supaya terasa seperti orang
   mengetik: ketikan dan instalasi ±6 detik, lalu Mochi muncul. Sapaannya
   ±1,6 detik tanpa suara, atau sepanjang file suaranya jika suara aktif. */
function buildSchedule(): Step[] {
  const steps: Step[] = [];
  // tunggu kotak logam pembuka melebur jadi jendela (lihat .intro-egg) dan
  // chord piano pembuka sempat berdengung sebentar
  steps.push([2300, (p) => p]);
  for (let i = 1; i <= CMD.length; i++) {
    // ritme manusia: jeda tiap huruf sedikit acak, lebih lama setelah spasi;
    // spasi sendiri tidak berbunyi
    const space = CMD[i - 1] === " ";
    const wait = space ? 110 : 70 + Math.round(Math.random() * 50);
    steps.push([CMD[i - 2] === " " ? wait + 80 : wait, (p) => ({ ...p, cmd: i }), space ? undefined : () => sfxKey()]);
  }
  steps.push([450, (p) => ({ ...p, install: true }), () => sfxKey(true)]); // tekan Enter
  steps.push([700, (p) => ({ ...p, answered: true }), () => sfxKey()]); // berpikir, lalu ketik "y"
  CHECKS.forEach((_, i) => {
    steps.push([i === 0 ? 400 : 190, (p) => ({ ...p, checks: i + 1, spinning: true })]);
    steps.push([280, (p) => ({ ...p, spinning: false }), () => sfxCheck(i)]);
  });
  // Mochi muncul; sapaannya dijadwalkan terpisah (lihat greetingTimes)
  steps.push([500, (p) => ({ ...p, mochi: true })]);
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

// Shader logam cair untuk kotak pembuka (kodenya sudah dimuat saat loading).
const LiquidMetal = dynamic(() => import("@/components/ui/LiquidMetalCanvas"), { ssr: false });

const WIDE = "(min-width: 768px)";
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const isWide = () => window.matchMedia(WIDE).matches;

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
  // "loading": Mochi + cincin berputar sambil aset dimuat; "intro": kotak
  // logam cair lalu terminal.
  // "gate": aset siap, menunggu pengunjung memilih masuk dengan/tanpa suara.
  const [phase, setPhase] = useState<"loading" | "gate" | "intro">("loading");
  const phaseRef = useRef<"loading" | "gate" | "intro">("loading");
  const startRef = useRef<(() => void) | null>(null);
  const gateRef = useRef<HTMLButtonElement>(null);
  const [load, setLoad] = useState(0); // persen aset yang sudah dimuat
  const [loaderLook, setLoaderLook] = useState<MascotLook>({ x: 0, y: 0 });
  const [metalDone, setMetalDone] = useState(false); // shader kotak logam boleh dilepas
  // Kotak logam memakai shader asli hanya di layar lebar. Di HP (kartu grafis
  // umumnya lemah) dipakai versi CSS supaya intro tidak tersendat.
  const wide = useSyncExternalStore(subscribeWide, isWide, () => false);
  const liquid = useCanAnimateShader() && wide;

  const close = useCallback(() => {
    if (document.documentElement.getAttribute("data-intro") !== "show") return;
    stopVoice(); // sapaan Mochi berhenti jika intro ditutup di tengah kalimat
    sfxEnter();
    // sapaan intro dihitung sudah diucapkan (satu kalimat per kursi)
    setLine("intro", { part: 0, shown: INTRO_WORDS.length, done: true });
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

  // Urutan intro: loading screen (sambil memuat aset) -> kotak logam cair ->
  // efek ketik di terminal.
  useEffect(() => {
    if (document.documentElement.getAttribute("data-intro") !== "show") return;
    overlayRef.current?.focus({ preventScroll: true });

    let cancelled = false;
    const pending: number[] = [];
    const later = (fn: () => void, ms: number) => pending.push(window.setTimeout(fn, ms));
    const steps = buildSchedule();
    let i = 0;

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

    // Dipanggil dari klik tombol gerbang (lihat enter() di bawah). Klik itu
    // juga yang membuat browser mengizinkan suara diputar.
    const startIntro = () => {
      if (cancelled) return;
      setPhase("intro");
      if (reducedMotion()) {
        // teks langsung utuh; cukup satu bunyi "siap", tanpa rentetan bunyi tuts
        sfxReady();
        setP(DONE);
        return;
      }
      // bunyi kotak logam pembuka (hanya terdengar jika suara On dan browser
      // sudah mengizinkan audio; lihat sfx.ts)
      sfxBlob();
      // lepas shader kotak logam setelah ia melebur jadi terminal
      later(() => setMetalDone(true), 2600);
      run();
    };

    // Loading screen: tampil minimal sebentar supaya Mochi dan cincinnya sempat
    // terlihat, lalu berubah jadi gerbang dua tombol saat semua aset siap.
    startRef.current = startIntro;
    const minShow = new Promise((r) => window.setTimeout(r, reducedMotion() ? 300 : 1600));
    void Promise.all([preloadIntroAssets((d, t) => !cancelled && setLoad(Math.round((d / t) * 100))), minShow]).then(
      () => {
        if (!cancelled) setPhase("gate");
      }
    );

    return () => {
      cancelled = true;
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Loading screen: mata Mochi memutar mengikuti kilau cincin yang berputar.
  useEffect(() => {
    if (phase !== "loading" || reducedMotion()) return;
    let angle = 0;
    const id = window.setInterval(() => {
      angle += Math.PI / 4;
      setLoaderLook({ x: Math.cos(angle) * 0.7, y: Math.sin(angle) * 0.6 });
    }, 260);
    return () => window.clearInterval(id);
  }, [phase]);

  // Interaksi pertama pengunjung (klik, tap, tombol) membuka izin suara browser.
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  /* Masuk dari gerbang: simpan pilihan suara, buka izin audio browser (klik
     ini adalah interaksi pengunjung), lalu mulai kotak logam dan terminal. */
  const enter = useCallback((withSound: boolean) => {
    if (phaseRef.current !== "gate") return;
    phaseRef.current = "intro";
    setSoundOn(withSound);
    unlockAudio();
    if (withSound) sfxToggleOn();
    startRef.current?.();
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
    // gerbang muncul: fokus ke tombol utama supaya pengguna keyboard siap
    if (phase === "gate") gateRef.current?.focus({ preventScroll: true });
  }, [phase]);

  // Enter: di gerbang = masuk dengan suara; di terminal = menutup intro
  // (kecuali saat fokus di tombol lain: tombol itu yang menangani).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (e.target instanceof HTMLButtonElement && e.target !== enterRef.current) return;
      e.preventDefault();
      if (phaseRef.current === "gate") enter(true);
      else if (phaseRef.current === "intro") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, enter]);

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
      data-phase={phase}
      className="intro-overlay fixed inset-0 z-[100] flex flex-col bg-ink outline-none"
    >
      {/* kilau redup di belakang terminal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 45% at 50% 45%, rgba(220,226,235,0.07), transparent 70%)" }}
      />

      {/* Loading screen: Mochi dengan cincin logam yang berputar di sekelilingnya,
          sambil suara dan aset dimuat */}
      <div className="intro-loader pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-6">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div aria-hidden="true" className="loader-ring absolute inset-0 rounded-full" />
          <div className="loader-bob">
            {/* dilepas setelah loading memudar, supaya tidak memakai WebGL lagi */}
            {!metalDone ? (
              <Mascot
                size={96}
                expression={phase === "loading" ? "idle" : "happy"}
                look={phase === "loading" ? loaderLook : { x: 0, y: 0.35 }}
                lite
              />
            ) : (
              <span className="block h-24 w-24" />
            )}
          </div>
        </div>

        {phase === "loading" ? (
          <p role="status" className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-muted">
            LOADING {String(load).padStart(3, " ")}%
          </p>
        ) : (
          // Gerbang: klik di sini membuat browser mengizinkan suara, jadi
          // semua bunyi intro langsung terdengar.
          <div className="gate-in pointer-events-auto flex flex-col items-center gap-3">
            <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-muted">BEST WITH SOUND ON</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                ref={gateRef}
                type="button"
                onClick={() => enter(true)}
                className={`metal-button rounded-full px-5 py-2.5 text-sm font-semibold ${FOCUS}`}
              >
                Enter with sound
              </button>
              <button
                type="button"
                onClick={() => enter(false)}
                className={`rounded-full border border-line bg-surface/80 px-5 py-2.5 text-sm text-muted transition-colors hover:text-fg ${FOCUS}`}
              >
                Enter without sound
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="relative w-full max-w-[640px]">
        {/* kotak logam cair pembuka seukuran jendela: bergoyang, lalu melebur
            menjadi jendela terminal di bawahnya */}
        <div aria-hidden="true" className="intro-egg pointer-events-none absolute inset-0 z-10">
          {/* logam cair sungguhan (shader). Gradien CSS di belakangnya jadi
              cadangan jika WebGL tidak ada atau gerak dikurangi. */}
          {phase === "intro" && liquid && !metalDone && (
            <div className="intro-liquid absolute inset-0">
              <LiquidMetal
                className="h-full w-full"
                shape="none"
                fit="cover"
                scale={1}
                colorBack="#aaaaac"
                colorTint="#ffffff"
                repetition={2}
                softness={0.2}
                shiftRed={0.3}
                shiftBlue={0.3}
                distortion={0.18}
                contour={0.4}
                angle={70}
                speed={1.6}
              />
            </div>
          )}
        </div>
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
