"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import { PROJECTS } from "@/content/site";
import { FOCUS } from "@/components/ui/styles";
import { spring, StatRow } from "./StatRow";

/*
 * Baris "Years coding" di About yang bisa dibuka: animasi pendek hitam-putih
 * tentang perjalanan Rauh, dengan fotonya sebagai karakter (library Motion).
 *
 *   1. Kecil  — menulis cheat untuk game (HP jadi 9999).
 *   2. SMA    — penasaran dengan sisi sebaliknya: anti-cheat yang menangkapnya.
 *   3. Kuliah — membuat project sungguhan (diambil dari content/site.ts).
 *
 * Adegan berganti sendiri: garis di titik bab yang aktif terisi selama
 * SCENE_MS, lalu adegan berikutnya muncul. Kursor di atas animasi = jeda.
 * Titik bab bisa diklik untuk melompat. Dengan prefers-reduced-motion,
 * gerakan dimatikan dan adegan tidak berganti sendiri.
 */

const SCENES = [
  {
    tag: "kid",
    caption:
      "I started with game cheats. I wanted god mode, so I wrote it myself.",
  },
  {
    tag: "high school",
    caption:
      "In high school I got curious about the other side: how anti-cheat catches people like me.",
  },
  {
    tag: "university",
    caption: `Now at BINUS I build real software. ${PROJECTS.length} projects so far, and counting.`,
  },
] as const;

const SCENE_MS = 4200;

// warna hitam-putih
const INK = "#0b0b0c";
const PANEL = "#141416";
const LINE = "#3a3a3e";
const MID = "#8a8a90";
const WHITE = "#f2f2f2";

// posisi karakter (dari atas, %) tiap adegan
const AVATAR_TOP = ["44%", "28%", "16%"];

export function CodingStory({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [scene, setScene] = useState(0);
  const [run, setRun] = useState(0); // naik tiap putar ulang, supaya animasi mulai dari awal
  const [paused, setPaused] = useState(false);

  const goTo = (i: number) => {
    setScene(i);
    setRun((r) => r + 1);
  };

  return (
    <MotionConfig reducedMotion="user">
      <StatRow
        label={label}
        value={value}
        chip="story"
        open={open}
        onToggle={() => {
          setOpen((o) => !o);
          goTo(0);
        }}
        title="How I got into coding"
      >
        {/* layar lebar: animasi di kiri, cerita dan kontrol di kanan */}
        <div className="grid items-center gap-6 md:grid-cols-5">
          <div
            className="relative overflow-hidden rounded-xl border border-white/10 md:col-span-3"
            style={{ background: INK }}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            {/* adegan baru masuk dari kanan, adegan lama keluar ke kiri */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${scene}-${run}`}
                initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -40, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Scene index={scene} />
              </motion.div>
            </AnimatePresence>

            {/* karakter: foto Rauh dalam lingkaran putih; melompat ke posisi
              barunya tiap adegan, lalu melayang pelan */}
            <motion.div
              aria-hidden="true"
              className="absolute left-[4%] flex w-[15%] flex-col items-center gap-1"
              initial={false}
              animate={{ top: AVATAR_TOP[scene] }}
              transition={spring}
            >
              <motion.div
                key={`hop-${scene}-${run}`}
                className="relative w-full"
                initial={{ y: 0, scaleX: 1, scaleY: 1 }}
                animate={{
                  y: [0, -14, 0, 0],
                  scaleX: [1, 0.92, 1.12, 1],
                  scaleY: [1, 1.08, 0.88, 1],
                }}
                transition={{
                  duration: 0.6,
                  times: [0, 0.4, 0.75, 1],
                  ease: "easeOut",
                }}
              >
                {/* cincin yang berdenyut pelan */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 0 1px ${WHITE}` }}
                  animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/avatar.jpg"
                  alt=""
                  width={48}
                  height={48}
                  className="relative aspect-square w-full rounded-full object-cover grayscale"
                  style={{
                    boxShadow: `0 0 0 1.5px ${WHITE}, 0 8px 20px -6px #000`,
                  }}
                />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={scene}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="whitespace-nowrap font-[family-name:var(--font-mono)] text-[9px] text-muted"
                >
                  {SCENES[scene].tag}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {paused && scene < SCENES.length - 1 && (
              <span className="absolute right-2 top-2 font-[family-name:var(--font-mono)] text-[9px] text-muted">
                paused
              </span>
            )}
          </div>

          <div className="md:col-span-2">
            <p className="font-[family-name:var(--font-mono)] text-[11px] text-muted">
              {String(scene + 1).padStart(2, "0")} /{" "}
              {String(SCENES.length).padStart(2, "0")} · {SCENES[scene].tag}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`c-${scene}-${run}`}
                aria-live="polite"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="mt-2 min-h-[4.5rem] text-lg leading-snug text-fg/90"
              >
                {SCENES[scene].caption}
              </motion.p>
            </AnimatePresence>

            <div className="mt-4 flex items-center justify-between">
              {/* titik bab: yang aktif berisi garis waktu; saat garis penuh,
              adegan berikutnya muncul */}
              <div
                className="flex items-center gap-1.5"
                role="group"
                aria-label="Story chapters"
              >
                {SCENES.map((s, i) => (
                  <motion.button
                    key={s.tag}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Chapter ${i + 1}: ${s.tag}`}
                    aria-current={i === scene ? "step" : undefined}
                    animate={{ width: i === scene ? 28 : 6 }}
                    transition={spring}
                    className={`relative h-1.5 overflow-hidden rounded-full bg-white/25 hover:bg-white/45 ${FOCUS}`}
                  >
                    {i === scene && (
                      <span
                        key={`${scene}-${run}`}
                        className={`story-timer absolute inset-0 origin-left rounded-full bg-fg ${
                          scene === SCENES.length - 1 ? "is-last" : ""
                        } ${paused ? "is-paused" : ""}`}
                        style={{ animationDuration: `${SCENE_MS}ms` }}
                        onAnimationEnd={() => {
                          if (scene < SCENES.length - 1) goTo(scene + 1);
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => goTo(0)}
                className={`rounded font-[family-name:var(--font-mono)] text-[11px] text-muted hover:text-fg ${FOCUS}`}
              >
                replay ↺
              </button>
            </div>
          </div>
        </div>
      </StatRow>
    </MotionConfig>
  );
}

/* ---- Tiga adegan (SVG 280×170, hitam-putih) ----------------------------- */

const mono = { fontFamily: "var(--font-mono)", fontSize: 8.5 };

/* Teks yang "diketik": terbuka dari kiri ke kanan, dengan kursor berkedip
   di ujungnya setelah selesai (jika `caret`). */
function Typed({
  x,
  y,
  delay,
  fill = WHITE,
  caret = false,
  children,
}: {
  x: number;
  y: number;
  delay: number;
  fill?: string;
  caret?: boolean;
  children: string;
}) {
  const width = children.length * 5.1; // perkiraan lebar teks mono 8.5px
  return (
    <g>
      <motion.text
        x={x}
        y={y}
        fill={fill}
        style={mono}
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ delay, duration: 0.03 * children.length, ease: "linear" }}
      >
        {children}
      </motion.text>
      {caret && (
        <motion.rect
          x={x + width + 2}
          y={y - 7}
          width="4.5"
          height="8.5"
          fill={WHITE}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            delay: delay + 0.03 * children.length,
            duration: 0.9,
            repeat: Infinity,
            times: [0, 0.01, 0.5, 0.51],
          }}
        />
      )}
    </g>
  );
}

/* Monitor yang dipakai adegan 1 dan 2. */
function Monitor({ children }: { children: React.ReactNode }) {
  return (
    <g>
      <rect
        x="62"
        y="12"
        width="206"
        height="126"
        rx="10"
        fill="none"
        stroke={WHITE}
        strokeWidth="2"
      />
      <rect x="67" y="17" width="196" height="116" rx="7" fill={PANEL} />
      <rect x="156" y="139" width="18" height="9" fill={MID} />
      <rect x="132" y="148" width="66" height="4" rx="2" fill={WHITE} />
      {children}
    </g>
  );
}

/* Kilatan layar putih singkat pada detik `at`. */
function Flash({ at }: { at: number }) {
  return (
    <motion.rect
      x="67"
      y="17"
      width="196"
      height="116"
      rx="7"
      fill={WHITE}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.35, 0] }}
      transition={{ delay: at, duration: 0.35 }}
      style={{ pointerEvents: "none" }}
    />
  );
}

function Scene({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 280 170"
      className="block h-auto w-full"
      aria-hidden="true"
    >
      {index === 0 && <SceneCheats />}
      {index === 1 && <SceneAntiCheat />}
      {index === 2 && <SceneProjects />}
    </svg>
  );
}

/* 1. Cheat: kode diketik, bar HP melonjak penuh dengan percikan, karakter
   game melompat kegirangan. */
function SceneCheats() {
  const sparks = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return { dx: Math.cos(a) * 16, dy: Math.sin(a) * 10 };
  });
  return (
    <Monitor>
      {/* sprite game sederhana */}
      <motion.g
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: [0, 0, -12, 0, -6, 0] }}
        transition={{
          opacity: { delay: 0.1 },
          y: {
            delay: 2.0,
            duration: 0.8,
            times: [0, 0.01, 0.3, 0.55, 0.75, 1],
          },
        }}
      >
        <rect x="200" y="62" width="14" height="14" fill={WHITE} />
        <rect x="203" y="66" width="3" height="3" fill={INK} />
        <rect x="208" y="66" width="3" height="3" fill={INK} />
        <rect x="198" y="76" width="18" height="16" fill={MID} />
        <rect x="200" y="92" width="5" height="8" fill={LINE} />
        <rect x="209" y="92" width="5" height="8" fill={LINE} />
      </motion.g>
      {/* bar HP */}
      <text x="78" y="34" fill={MID} style={mono}>
        HP
      </text>
      <rect x="94" y="27.5" width="110" height="7" rx="3.5" fill={LINE} />
      <motion.rect
        x="94"
        y="27.5"
        height="7"
        rx="3.5"
        fill={WHITE}
        initial={{ width: 18 }}
        animate={{ width: 110 }}
        transition={{ delay: 1.6, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      />
      {/* percikan di ujung bar saat penuh */}
      {sparks.map((s, i) => (
        <motion.circle
          key={i}
          cx="204"
          cy="31"
          r="1.6"
          fill={WHITE}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: [0, s.dx], y: [0, s.dy] }}
          transition={{ delay: 2.05, duration: 0.6, ease: "easeOut" }}
        />
      ))}
      <motion.text
        x="210"
        y="34"
        fill={WHITE}
        style={{ ...mono, fontWeight: 700 }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.05, ...spring }}
      >
        9999
      </motion.text>
      <Typed x={78} y={104} delay={0.3}>
        {"> inject cheat.dll"}
      </Typed>
      <Typed x={78} y={118} delay={0.95} fill={MID} caret>
        {"> player.hp = 9999"}
      </Typed>
      <Flash at={2.05} />
    </Monitor>
  );
}

/* 2. Anti-cheat: perisai muncul, garis pindai menyapu, kaca pembesar
   menemukan cheat-nya, layar bergetar dan berkedip. */
function SceneAntiCheat() {
  return (
    <motion.g
      initial={{ x: 0 }}
      animate={{ x: [0, 0, -4, 4, -3, 3, 0] }}
      transition={{
        delay: 2.1,
        duration: 0.4,
        times: [0, 0.01, 0.2, 0.4, 0.6, 0.8, 1],
      }}
    >
      <Monitor>
        <motion.g
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, ...spring }}
          style={{ transformOrigin: "165px 62px" }}
        >
          <path
            d="M165 32 L190 41 V62 C190 77 179 87 165 93 C151 87 140 77 140 62 V41 Z"
            fill={WHITE}
          />
          <path
            d="M165 40 L183 47 V62 C183 73 175 80 165 85 C155 80 147 73 147 62 V47 Z"
            fill={PANEL}
          />
          <motion.path
            d="M156 62 L163 69 L175 55"
            fill="none"
            stroke={WHITE}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          />
        </motion.g>
        {/* garis pindai turun-naik */}
        <motion.rect
          x="70"
          y="20"
          width="190"
          height="1.5"
          fill={WHITE}
          initial={{ y: 20, opacity: 0.5 }}
          animate={{ y: [20, 128, 20] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <Typed x={78} y={110} delay={0.5} fill={MID}>
          {"anti-cheat: scanning memory..."}
        </Typed>
        <motion.text
          x="78"
          y="124"
          fill={WHITE}
          style={{ ...mono, fontWeight: 700 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.2, 1, 0.2, 1] }}
          transition={{ delay: 2.1, duration: 1 }}
        >
          [x] flagged: cheat.dll
        </motion.text>
        {/* kaca pembesar menyapu layar lalu berhenti di baris yang ketahuan */}
        <motion.g
          initial={{ x: 110, y: 60 }}
          animate={{ x: [110, 185, 150, 215], y: [60, 72, 95, 112] }}
          transition={{ duration: 2.1, ease: "easeInOut" }}
        >
          <circle
            cx="0"
            cy="0"
            r="11"
            fill={PANEL}
            fillOpacity="0.4"
            stroke={WHITE}
            strokeWidth="3"
          />
          <rect
            x="7"
            y="7"
            width="12"
            height="4"
            rx="2"
            transform="rotate(45 7 7)"
            fill={WHITE}
          />
        </motion.g>
        <Flash at={2.1} />
      </Monitor>
    </motion.g>
  );
}

/* 3. Kuliah: kartu-kartu project sungguhan mendarat bertumpuk, masing-masing
   mendapat centang. */
function SceneProjects() {
  // empat project berbeda: nama tanpa keterangan versi, tiap nama sekali saja
  // (Furniture Store punya tiga versi)
  const titles = [
    ...new Set(PROJECTS.map((p) => p.title.replace(/ \(.*\)$/, ""))),
  ].slice(0, 4);
  return (
    <g>
      {titles.map((t, i) => {
        const x = 92 + i * 6;
        const y = 18 + i * 30;
        const land = 0.2 + i * 0.4;
        return (
          <motion.g
            key={t}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: land,
              type: "spring",
              stiffness: 380,
              damping: 18,
            }}
          >
            <rect
              x={x}
              y={y}
              width="168"
              height="26"
              rx="6"
              fill={PANEL}
              stroke={i === 0 ? WHITE : LINE}
            />
            <text
              x={x + 12}
              y={y + 16.5}
              fill={WHITE}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 9.5,
                fontWeight: 600,
              }}
            >
              {t}
            </text>
            {/* centang "selesai" */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: land + 0.3, ...spring }}
              style={{ transformOrigin: `${x + 154}px ${y + 13}px` }}
            >
              <circle cx={x + 154} cy={y + 13} r="6" fill={WHITE} />
              <path
                d={`M${x + 151} ${y + 13} l2 2 l4 -4`}
                fill="none"
                stroke={INK}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>
          </motion.g>
        );
      })}
      <motion.text
        x="262"
        y="160"
        textAnchor="end"
        fill={MID}
        style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1 }}
      >
        {PROJECTS.length} projects
      </motion.text>
    </g>
  );
}
