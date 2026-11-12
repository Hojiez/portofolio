"use client";

import { sfxToggleOn } from "@/components/intro/sfx";
import { FOCUS } from "@/components/ui/styles";
import { setSoundOn, useSoundOn } from "./soundPref";

/* Tombol suara di navbar: menyalakan/mematikan suara Mochi dan efek suara. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSoundOn();
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
      title={on ? "Sound on" : "Sound off"}
      onClick={() => {
        setSoundOn(!on);
        if (!on) sfxToggleOn();
      }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/5 ${
        on ? "text-fg" : "text-muted hover:text-fg"
      } ${FOCUS} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        {on ? (
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        ) : (
          <path d="m16 9 5 6M21 9l-5 6" />
        )}
      </svg>
    </button>
  );
}
