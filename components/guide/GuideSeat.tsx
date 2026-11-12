"use client";

import { SCRIPT, wordsOf, type SeatId } from "@/content/script";
import { useSeatLine } from "./guideStore";

/*
 * Kursi Mochi di satu section.
 *
 * - Kotak kiri (data-seat-spot) adalah tempat Mochi mendarat di layar lebar;
 *   Guide.tsx memindahkan Mochi ke sini.
 * - Kalimatnya ada di alur halaman (bukan melayang), jadi tidak pernah menutupi
 *   isi section, termasuk di HP saat Mochi menempel di pojok bawah.
 * - Semua kata sudah ada sejak awal tapi transparan, supaya tinggi kursi tidak
 *   berubah saat kata-kata muncul.
 */
export function GuideSeat({ id, className = "" }: { id: SeatId; className?: string }) {
  const line = useSeatLine(id);
  const words = wordsOf(id);
  const started = line.shown > 0;

  return (
    <div data-seat={id} className={`flex min-h-[88px] items-center gap-5 ${className}`}>
      <div data-seat-spot={id} aria-hidden="true" className="hidden h-[88px] w-[88px] shrink-0 md:block" />
      <div className="max-w-md flex-1">
        {/* di HP Mochi tidak duduk di sebelah kalimatnya, jadi beri nama pembicara */}
        <p
          aria-hidden="true"
          className={`mb-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-muted transition-opacity md:hidden ${
            started ? "opacity-100" : "opacity-0"
          }`}
        >
          Mochi
        </p>
        <p aria-hidden="true" className="text-base leading-snug text-fg/90 md:text-lg">
          {words.map((w, i) => (
            <span key={i} className={`guide-word ${i < line.shown ? "is-on" : ""}`}>
              {w}{" "}
            </span>
          ))}
        </p>
        {/* untuk pembaca layar: seluruh kalimat sekaligus, bukan kata demi kata */}
        <p className="sr-only" aria-live="polite">
          {started ? `Mochi: ${SCRIPT[id].text}` : ""}
        </p>
      </div>
    </div>
  );
}
