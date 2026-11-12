"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import { FOCUS } from "@/components/ui/styles";
import { spring, StatRow } from "./StatRow";

/*
 * Baris "English (certified)" di About yang bisa dibuka: penampil PDF mini
 * bergaya situs (gelap, hitam-putih) untuk sertifikat EnglishScore.
 *
 * Halaman ditampilkan sebagai gambar (public/certificates/*.webp, dibuat
 * dari PDF-nya), jadi ringan dan langsung tampil tanpa library PDF. File
 * PDF aslinya tetap bisa dibuka atau diunduh dari toolbar, dan kode
 * verifikasinya bisa dicek di situs EnglishScore.
 */

const CERT = {
  file: "/certificates/englishscore-c1.pdf",
  name: "englishscore-c1.pdf",
  pages: ["/certificates/englishscore-c1-p1.webp", "/certificates/englishscore-c1-p2.webp"],
  verifyUrl: "https://www.englishscore.com/verify",
  code: "9b7a3885",
};

/* Tingkat zoom: seluruh halaman terlihat (lebar dihitung dari tinggi area
   tampil 340px dikurangi padding, dibagi rasio kertas A4), selebar area,
   lalu hampir dua kali lebar area untuk membaca detail. */
const VIEW_H = 480;
const ZOOMS = [`calc((${VIEW_H}px - 1.5rem) / 1.4142)`, "100%", "180%"];

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-fg/80 transition-colors hover:bg-white/10 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent ${FOCUS}`}
    >
      {children}
    </button>
  );
}

const icon = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CertViewer({ label, value }: { label: string; value: string }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(0); // indeks ZOOMS
  const [dir, setDir] = useState(1); // arah ganti halaman, untuk animasi geser

  const go = (next: number) => {
    setDir(next > page ? 1 : -1);
    setPage(next);
  };

  return (
    <MotionConfig reducedMotion="user">
      <StatRow
        label={label}
        value={value}
        chip="view"
        open={open}
        onToggle={() => {
          setOpen((o) => !o);
          setPage(0);
          setZoom(0);
        }}
        title="EnglishScore certificate"
      >
        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-ink">
          {/* toolbar */}
          <div className="flex items-center gap-1 border-b border-white/10 px-2 py-1.5">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" className="ml-1 shrink-0 text-muted" {...icon}>
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
            </svg>
            <span className="mr-auto truncate font-[family-name:var(--font-mono)] text-[11px] text-muted">{CERT.name}</span>

            <ToolButton label="Previous page" onClick={() => go(page - 1)} disabled={page === 0}>
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...icon}>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </ToolButton>
            <span className="min-w-[2.5rem] text-center font-[family-name:var(--font-mono)] text-[11px] tabular-nums text-fg/80">
              {page + 1} / {CERT.pages.length}
            </span>
            <ToolButton label="Next page" onClick={() => go(page + 1)} disabled={page === CERT.pages.length - 1}>
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...icon}>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </ToolButton>

            <span aria-hidden="true" className="mx-1 h-4 w-px bg-white/10" />

            <ToolButton label="Zoom out" onClick={() => setZoom((z) => z - 1)} disabled={zoom === 0}>
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...icon}>
                <circle cx="11" cy="11" r="7" />
                <path d="M8 11h6M21 21l-4.3-4.3" />
              </svg>
            </ToolButton>
            <ToolButton label="Zoom in" onClick={() => setZoom((z) => z + 1)} disabled={zoom === ZOOMS.length - 1}>
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...icon}>
                <circle cx="11" cy="11" r="7" />
                <path d="M8 11h6M11 8v6M21 21l-4.3-4.3" />
              </svg>
            </ToolButton>
          </div>

          {/* halaman: geser ke samping saat berganti, bisa di-scroll saat diperbesar */}
          <div
            className="relative overflow-auto overscroll-contain bg-[#1a1a1d] p-3"
            style={{ height: VIEW_H }}
            tabIndex={0}
            aria-label="Certificate page"
          >
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={page}
                custom={dir}
                initial={{ opacity: 0, x: dir * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -30 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className="mx-auto max-w-none"
                style={{ width: ZOOMS[zoom] }}
              >
                <motion.div layout transition={spring}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={CERT.pages[page]}
                    alt={
                      page === 0
                        ? "EnglishScore certificate: Rauh Risqi Abdillah achieved CEFR C1 Advanced, score 530, valid from 5 December 2023"
                        : "EnglishScore certificate page 2: how the score maps to CEFR levels"
                    }
                    width={1191}
                    height={1684}
                    loading="lazy"
                    className="block h-auto w-full rounded-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)]"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* aksi: buka, unduh, verifikasi */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 px-3 py-2 font-[family-name:var(--font-mono)] text-[11px]">
            <a href={CERT.file} target="_blank" rel="noopener noreferrer" className={`rounded text-fg/80 hover:text-fg ${FOCUS}`}>
              open ↗
            </a>
            <a href={CERT.file} download className={`rounded text-fg/80 hover:text-fg ${FOCUS}`}>
              download ↓
            </a>
            <a
              href={CERT.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-auto rounded text-muted hover:text-fg ${FOCUS}`}
            >
              verify · {CERT.code} ↗
            </a>
          </div>
        </div>
      </StatRow>
    </MotionConfig>
  );
}
