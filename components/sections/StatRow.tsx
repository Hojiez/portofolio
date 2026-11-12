"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CountUp } from "@/components/ui/CountUp";
import { MetalText } from "@/components/ui/MetalText";
import { FOCUS } from "@/components/ui/styles";

/*
 * Baris angka sorotan di About yang bisa dibuka: label + penanda kecil yang
 * berdenyut (supaya pengunjung tahu bisa diklik), garis titik, dan nilainya.
 *
 * Panelnya tidak muncul di bawah baris (kolom samping terlalu sempit), tapi
 * di bagian bawah section About selebar halaman: dipindahkan lewat portal ke
 * elemen #about-drawer. Saat dibuka, halaman bergulir ke panel itu.
 */

export const ABOUT_DRAWER_ID = "about-drawer";
export const spring: Transition = { type: "spring", stiffness: 260, damping: 22 };

/* Elemen tujuan portal. Dibaca lewat useSyncExternalStore: null saat
   dirender di server, elemennya saat di browser. */
const noop = () => () => {};
function useDrawer() {
  return useSyncExternalStore(
    noop,
    () => document.getElementById(ABOUT_DRAWER_ID),
    () => null
  );
}

export function StatRow({
  label,
  value,
  chip,
  open,
  onToggle,
  title,
  children,
}: {
  label: string;
  value: string;
  /** teks penanda saat tertutup, misalnya "story" atau "view" */
  chip: string;
  open: boolean;
  onToggle: () => void;
  /** judul panel (juga nama region untuk pembaca layar) */
  title: string;
  children: ReactNode;
}) {
  const panelId = useId();
  const drawer = useDrawer();
  const panelRef = useRef<HTMLDivElement>(null);

  // dibuka: gulir ke panelnya di bawah section (setelah mulai membesar)
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [open]);

  const panel = (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-label={title}
          key="panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="border-t border-line pt-6">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h3 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-muted">
                {title}
              </h3>
              <button
                type="button"
                onClick={onToggle}
                className={`rounded font-[family-name:var(--font-mono)] text-[11px] text-muted hover:text-fg ${FOCUS}`}
              >
                close ✕
              </button>
            </div>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        data-mochi-curious
        className={`group flex w-full items-baseline gap-3 rounded-md text-left ${FOCUS}`}
      >
        <span className="flex items-baseline gap-2 text-sm text-muted transition-colors group-hover:text-fg">
          {label}
          <span className={`story-chip ${open ? "is-open" : ""}`}>
            <motion.svg
              viewBox="0 0 12 12"
              width="9"
              height="9"
              aria-hidden="true"
              animate={{ rotate: open ? 90 : 0 }}
              transition={spring}
            >
              <path d="M4 2.5 7.5 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </motion.svg>
            {open ? "open" : chip}
          </span>
        </span>
        <span aria-hidden="true" className="flex-1 translate-y-[-3px] border-b border-dotted border-white/15" />
        <MetalText className="font-[family-name:var(--font-mono)] text-lg font-semibold">
          <CountUp value={value} />
        </MetalText>
      </button>

      {/* panel di bawah section (atau di sini jika tempatnya belum ada) */}
      {drawer ? createPortal(panel, drawer) : panel}
    </div>
  );
}
