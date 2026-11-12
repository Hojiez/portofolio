"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { useId, type ReactNode } from "react";
import { CountUp } from "@/components/ui/CountUp";
import { MetalText } from "@/components/ui/MetalText";
import { FOCUS } from "@/components/ui/styles";

/*
 * Baris angka sorotan di About yang bisa dibuka (dropdown): label + penanda
 * kecil yang berdenyut (supaya pengunjung tahu bisa diklik), garis titik, dan
 * nilainya. Isinya (children) muncul di panel di bawahnya.
 */

export const spring: Transition = { type: "spring", stiffness: 260, damping: 22 };

export function StatRow({
  label,
  value,
  chip,
  open,
  onToggle,
  panelLabel,
  children,
}: {
  label: string;
  value: string;
  /** teks penanda saat tertutup, misalnya "story" atau "view" */
  chip: string;
  open: boolean;
  onToggle: () => void;
  panelLabel: string;
  children: ReactNode;
}) {
  const panelId = useId();
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
            {open ? "close" : chip}
          </span>
        </span>
        <span aria-hidden="true" className="flex-1 translate-y-[-3px] border-b border-dotted border-white/15" />
        <MetalText className="font-[family-name:var(--font-mono)] text-lg font-semibold">
          <CountUp value={value} />
        </MetalText>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={panelLabel}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
