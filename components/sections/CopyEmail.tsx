"use client";

import { useState } from "react";
import { copyEmail } from "@/components/command/actions";
import { FOCUS, PANEL } from "@/components/ui/styles";

/* Tombol salin email di sebelah alamat email (Contact). Berubah jadi tanda
   centang sebentar setelah disalin; Mochi ikut bereaksi (actions.ts). */
export function CopyEmail() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (!(await copyEmail())) return;
        setDone(true);
        window.setTimeout(() => setDone(false), 1800);
      }}
      aria-label={done ? "Email copied" : "Copy email address"}
      title="Copy email address"
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 font-[family-name:var(--font-mono)] text-xs text-fg/85 transition-colors hover:bg-white/10 hover:text-fg ${PANEL} ${FOCUS}`}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {done ? (
          <path d="M5 12l5 5L19 7" />
        ) : (
          <>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </>
        )}
      </svg>
      {done ? "Copied" : "Copy"}
    </button>
  );
}
