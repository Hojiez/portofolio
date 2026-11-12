"use client";

import { lineOf, SCRIPT, wordsOf, type LinePart, type SeatId } from "@/content/script";
import { useIsActiveSeat, useSeatLine } from "./guideStore";

/*
 * Kursi Mochi di satu section.
 *
 * - Kotak kiri (data-seat-spot) adalah tempat Mochi mendarat di layar lebar;
 *   Guide.tsx memindahkan Mochi ke sini.
 * - Kalimatnya tampil dalam balon teks di alur halaman (bukan melayang), jadi
 *   tidak pernah menutupi isi section, termasuk di HP.
 * - Balon hanya tampil selama Mochi duduk di kursi ini; saat Mochi pindah,
 *   balonnya memudar dan hilang.
 * - Kalimat utama dan kalimat tambahan ditumpuk di sel grid yang sama, dan
 *   semua kata sudah ada sejak awal tapi transparan, supaya tinggi kursi
 *   tidak berubah saat kata-kata muncul, kalimat berganti, atau balon hilang.
 */
export function GuideSeat({ id, className = "" }: { id: SeatId; className?: string }) {
  const line = useSeatLine(id);
  const here = useIsActiveSeat(id);
  const show = here && line.shown > 0;
  const parts: LinePart[] = SCRIPT[id].more ? [0, 1] : [0];

  return (
    <div data-seat={id} className={`flex min-h-[88px] items-center gap-5 ${className}`}>
      <div data-seat-spot={id} aria-hidden="true" className="hidden h-[88px] w-[88px] shrink-0 md:block" />
      <div
        aria-hidden="true"
        className={`guide-bubble relative max-w-md flex-1 rounded-2xl border border-line bg-surface/80 px-5 py-3.5 backdrop-blur-md ${
          show ? "is-shown" : ""
        }`}
      >
        {/* ekor balon yang menunjuk ke Mochi (layar lebar) */}
        <span className="guide-bubble-tail absolute -left-[7px] top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-b border-l border-line bg-surface md:block" />
        {/* di HP Mochi tidak duduk di sebelah balonnya, jadi beri nama pembicara */}
        <p className="mb-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-muted md:hidden">
          Mochi
        </p>
        <div className="grid">
          {parts.map((part) => (
            <p
              key={part}
              className={`text-base leading-snug text-fg/90 [grid-area:1/1] md:text-lg ${
                part === line.part ? "" : "invisible"
              }`}
            >
              {wordsOf(id, part).map((w, i) => (
                <span key={i} className={`guide-word ${part === line.part && i < line.shown ? "is-on" : ""}`}>
                  {w}{" "}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
      {/* untuk pembaca layar: seluruh kalimat sekaligus, bukan kata demi kata */}
      <p className="sr-only" aria-live="polite">
        {show ? `Mochi: ${lineOf(id, line.part).text}` : ""}
      </p>
    </div>
  );
}
