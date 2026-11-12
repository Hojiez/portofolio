"use client";

import { useState } from "react";
import { Mascot, type MascotLook } from "@/components/guide/Mascot";
import { EXPRESSIONS, type MascotExpression } from "@/components/guide/expressions";
import { FOCUS, METAL_BUTTON, PANEL } from "@/components/ui/styles";

const LOOKS: { label: string; value: MascotLook | undefined }[] = [
  { label: "lirik sendiri", value: undefined },
  { label: "depan", value: { x: 0, y: 0 } },
  { label: "kanan bawah", value: { x: 0.9, y: 0.5 } },
  { label: "kiri bawah", value: { x: -0.9, y: 0.5 } },
  { label: "kanan", value: { x: 1, y: 0 } },
  { label: "kiri", value: { x: -1, y: 0 } },
  { label: "atas", value: { x: 0, y: -0.8 } },
  { label: "ikuti kursor", value: "cursor" },
];

function Chips<T extends string>({
  label,
  items,
  active,
  onPick,
}: {
  label: string;
  items: T[];
  active: T;
  onPick: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap justify-center gap-2">
      {items.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          aria-pressed={active === v}
          className={`rounded-full px-4 py-2 font-[family-name:var(--font-mono)] text-xs ${FOCUS} ${
            active === v ? `font-medium ${METAL_BUTTON}` : `text-muted hover:text-fg ${PANEL}`
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

/* Mochi besar dengan tombol ekspresi dan arah pandang. */
export function MascotPlayground() {
  const [expression, setExpression] = useState<MascotExpression>("idle");
  const [lookLabel, setLookLabel] = useState("lirik sendiri");
  const look = LOOKS.find((l) => l.label === lookLabel)?.value;

  return (
    <div className="mt-10 flex flex-col items-center gap-6 rounded-3xl border border-line p-10">
      <Mascot expression={expression} look={look} size={240} />
      <Chips label="Pilih ekspresi" items={[...EXPRESSIONS]} active={expression} onPick={setExpression} />
      <Chips
        label="Pilih arah pandang"
        items={LOOKS.map((l) => l.label)}
        active={lookLabel}
        onPick={setLookLabel}
      />

      {/* Contoh pemakaian di Fase 4: Mochi melirik ke balon teks di kanan bawahnya */}
      <div className="mt-6 flex w-full max-w-lg items-center gap-5 border-t border-line pt-8">
        <Mascot expression="talk" look={{ x: 0.7, y: 0.4 }} size={88} />
        <p className="text-fg/85">
          Swipe through. He built every one of these, which is frankly{" "}
          <span className="text-muted">showing off.</span>
        </p>
      </div>
    </div>
  );
}
