"use client";

import { PANEL } from "./styles";
import { useToast } from "./toast";

/* Tempat notifikasi tampil: pil kecil di tengah bawah layar. */
export function Toaster() {
  const toast = useToast();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <p role="status" aria-live="polite" className="sr-only">
        {toast?.text ?? ""}
      </p>
      {toast && (
        <div
          key={toast.id}
          aria-hidden="true"
          className={`toast-in rounded-full px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-fg ${PANEL} bg-ink/80`}
        >
          <span className="mr-2 text-accent">✓</span>
          {toast.text}
        </div>
      )}
    </div>
  );
}
