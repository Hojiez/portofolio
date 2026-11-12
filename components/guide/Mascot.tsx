"use client";

import { useEffect, useRef } from "react";
import { MetalShader } from "@/components/ui/MetalShader";
import type { MascotExpression } from "./expressions";

/*
 * Mochi — maskot blob logam (docs/MASTER_PLAN.md bagian 5).
 *
 * Badan: bola liquid metal yang sama dengan hero (MetalShader), sedikit
 * dipipihkan jadi oval. Wajah: SVG di atasnya. Tiap ekspresi adalah satu
 * lapisan wajah; ekspresi berganti dengan memudarkan lapisan lama ke yang baru.
 * Animasi (napas, kedip, mulut, "zzz") ada di app/globals.css bagian MOCHI dan
 * otomatis mati untuk pengunjung yang memakai prefers-reduced-motion.
 */

const INK = "#0d0e10";
const BLUSH = "#ff9eb0";

/* Mata bulat hitam mengilap. */
function Eye({ cx, cy, r = 1 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={13 * r} ry={16 * r} fill={INK} />
      <circle cx={cx + 4 * r} cy={cy - 6 * r} r={5.2 * r} fill="#fff" />
      <circle cx={cx - 4.5 * r} cy={cy + 6.5 * r} r={2.2 * r} fill="#fff" />
    </g>
  );
}

function Blush() {
  return (
    <g opacity={0.4}>
      <ellipse cx={50} cy={124} rx={12} ry={6} fill={BLUSH} />
      <ellipse cx={150} cy={124} rx={12} ry={6} fill={BLUSH} />
    </g>
  );
}

const line = {
  fill: "none",
  stroke: INK,
  strokeWidth: 5.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ---- Enam lapisan wajah ------------------------------------------------- */

function IdleFace() {
  return (
    <g>
      <g className="mochi-blink">
        <Eye cx={72} cy={98} />
        <Eye cx={128} cy={98} />
      </g>
      <path d="M88 124 Q100 135 112 124" {...line} />
    </g>
  );
}

function TalkFace() {
  return (
    <g>
      <g className="mochi-blink">
        <Eye cx={72} cy={96} />
        <Eye cx={128} cy={96} />
      </g>
      {/* mulut membuka-menutup */}
      <g className="mochi-talk">
        <ellipse cx={100} cy={128} rx={10} ry={9} fill={INK} />
        <ellipse cx={100} cy={132} rx={6} ry={3.5} fill={BLUSH} />
      </g>
    </g>
  );
}

function HappyFace() {
  return (
    <g>
      {/* mata melengkung ^ ^ */}
      <path d="M58 100 Q72 82 86 100" {...line} strokeWidth={7} />
      <path d="M114 100 Q128 82 142 100" {...line} strokeWidth={7} />
      {/* senyum lebar terbuka dengan lidah */}
      <path d="M82 118 Q100 118 118 118 Q116 142 100 142 Q84 142 82 118 Z" fill={INK} />
      <path d="M90 134 Q100 128 110 134 Q106 141 100 141 Q94 141 90 134 Z" fill={BLUSH} />
      <Blush />
    </g>
  );
}

function SmugFace() {
  return (
    <g>
      {/* mata setengah tertutup: bagian atas mata dipotong garis kelopak */}
      <defs>
        <clipPath id="mochi-lid">
          <rect x={40} y={98} width={120} height={40} />
        </clipPath>
      </defs>
      <g clipPath="url(#mochi-lid)">
        <Eye cx={72} cy={100} />
        <Eye cx={128} cy={100} />
      </g>
      <path d="M57 98 L87 98" {...line} />
      <path d="M113 98 L143 98" {...line} />
      {/* alis kanan terangkat */}
      <path d="M116 78 Q128 70 142 76" {...line} strokeWidth={4.5} />
      {/* senyum miring */}
      <path d="M90 128 Q104 132 116 120" {...line} />
    </g>
  );
}

function CuriousFace() {
  return (
    <g transform="rotate(-10 100 110)">
      <Eye cx={70} cy={98} r={1.12} />
      <Eye cx={130} cy={98} r={0.95} />
      {/* alis bertanya */}
      <path d="M56 72 Q70 66 84 72" {...line} strokeWidth={4.5} />
      <path d="M118 78 Q130 76 142 80" {...line} strokeWidth={4.5} />
      {/* mulut "o" kecil */}
      <ellipse cx={100} cy={130} rx={6} ry={7} fill={INK} />
    </g>
  );
}

function SleepFace() {
  return (
    <g>
      {/* mata terpejam */}
      <path d="M60 102 Q72 112 84 102" {...line} />
      <path d="M116 102 Q128 112 140 102" {...line} />
      <ellipse cx={100} cy={128} rx={5} ry={4} fill={INK} />
      <Blush />
      {/* zzz melayang */}
      <g className="mochi-z" style={{ animationDelay: "0s" }}>
        <text x={150} y={62} fontSize={20} fontWeight={700} fill="#e7e9ec">z</text>
      </g>
      <g className="mochi-z" style={{ animationDelay: "0.8s" }}>
        <text x={160} y={44} fontSize={15} fontWeight={700} fill="#e7e9ec">z</text>
      </g>
    </g>
  );
}

const FACES: Record<MascotExpression, () => React.JSX.Element> = {
  idle: IdleFace,
  talk: TalkFace,
  happy: HappyFace,
  smug: SmugFace,
  curious: CuriousFace,
  sleep: SleepFace,
};

/* ---- Arah pandang 3D ----------------------------------------------------
 *
 * Wajah diperlakukan seperti stiker di permukaan bola. Untuk "menoleh",
 * stiker diputar mengelilingi pusat bola (yang berada setengah diameter di
 * belakang layar): geser ke belakang, putar, geser kembali. Hasilnya wajah
 * bergeser ke arah pandang dan memipih di dekat tepi, seperti benda 3D.
 * Bagian wajah yang melewati tepi bola dipotong oleh clip-path oval.
 */

export type MascotLook = { x: number; y: number } | "cursor";

const MAX_TURN = 38; // derajat, saat x atau y = 1
const BODY_RX = 48; // jari-jari badan dalam % lebar (bola 0.96 kotak)
const BODY_RY = 48 * 0.88; // badan dipipihkan jadi oval

function clamp(v: number) {
  return Math.max(-1, Math.min(1, v));
}

function faceTransform(x: number, y: number, size: number) {
  const r = (size * BODY_RX) / 100;
  // rotateY positif membawa titik di depan bola ke kanan layar,
  // rotateX negatif membawanya ke bawah.
  return `perspective(${size * 4}px) translateZ(${-r}px) rotateX(${-clamp(y) * MAX_TURN}deg) rotateY(${
    clamp(x) * MAX_TURN
  }deg) translateZ(${r}px)`;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------------ */

export function Mascot({
  expression = "idle",
  size = 160,
  look,
  className = "",
}: {
  expression?: MascotExpression;
  size?: number;
  /** Arah pandang: {x, y} dari -1 sampai 1 (x kanan positif, y bawah positif),
   *  atau "cursor" untuk mengikuti kursor. Kosong = lihat depan dan sesekali
   *  melirik sendiri saat idle. */
  look?: MascotLook;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bounceRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const lookX = typeof look === "object" ? look.x : 0;
  const lookY = typeof look === "object" ? look.y : 0;

  // Arah pandang tetap (dari prop) atau lirikan acak saat idle.
  useEffect(() => {
    const face = faceRef.current;
    if (!face || look === "cursor") return;
    const set = (x: number, y: number) => (face.style.transform = faceTransform(x, y, size));
    set(lookX, lookY);

    // Tanpa arah dari luar, Mochi sesekali melirik sendiri supaya terasa hidup.
    if (look !== undefined || expression !== "idle" || reducedMotion()) return;
    let timer: number;
    const glance = () => {
      const away = Math.random() < 0.5;
      if (away) set(Math.random() * 1.4 - 0.7, Math.random() * 0.9 - 0.3);
      else set(0, 0);
      timer = window.setTimeout(glance, 1800 + Math.random() * 2600);
    };
    timer = window.setTimeout(glance, 1500 + Math.random() * 2000);
    return () => {
      window.clearTimeout(timer);
      set(0, 0);
    };
  }, [look, lookX, lookY, expression, size]);

  // Mengikuti kursor: arah dihitung dari pusat Mochi ke posisi kursor.
  useEffect(() => {
    const face = faceRef.current;
    const root = rootRef.current;
    if (look !== "cursor" || !face || !root || reducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.35);
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.35);
      face.style.transform = faceTransform(dx, dy, size);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [look, size]);

  // Pantulan kecil setiap kali ekspresi berganti (dilewati saat pertama tampil
  // dan untuk pengunjung yang memakai prefers-reduced-motion).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = bounceRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [
        { transform: "scale(1, 1)" },
        { transform: "scale(1.08, 0.9)" },
        { transform: "scale(0.96, 1.05)" },
        { transform: "scale(1, 1)" },
      ],
      { duration: 380, easing: "ease-out" }
    );
  }, [expression]);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={`Mochi, the site's guide (${expression})`}
      data-expression={expression}
      className={`mochi relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <div ref={bounceRef} className="absolute inset-0" style={{ transformOrigin: "50% 90%" }}>
        <div
          className={`mochi-breathe absolute inset-0 ${expression === "curious" ? "mochi-tilt" : ""}`}
        >
          {/* badan: bola logam dipipihkan jadi oval */}
          <div className="mochi-body absolute inset-0" style={{ transform: "scaleY(0.88)" }}>
            <MetalShader className="h-full w-full" scale={0.96} speed={0.4} look="soft" />
          </div>

          {/* wajah: dipotong mengikuti bentuk oval badan */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `ellipse(${BODY_RX}% ${BODY_RY}% at 50% 50%)` }}
          >
            <div
              ref={faceRef}
              className="mochi-face-3d absolute inset-0"
              style={{ transform: faceTransform(lookX, lookY, size) }}
            >
              {/* semua lapisan dirender, hanya yang aktif terlihat.
                  viewBox dipersempit supaya wajah tampil lebih besar di badan */}
              <svg
                viewBox="25 30 150 150"
                className="mochi-face-layer absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {(Object.keys(FACES) as MascotExpression[]).map((key) => {
                  const Face = FACES[key];
                  return (
                    <g
                      key={key}
                      className="mochi-face"
                      style={{ opacity: key === expression ? 1 : 0 }}
                    >
                      <Face />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
