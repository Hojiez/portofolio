"use client";

import { useState } from "react";
import { SITE } from "@/content/site";
import { GLASS } from "./styles";

/* Foto profil dengan fallback inisial */
export function Portrait() {
  const [failed, setFailed] = useState(false);
  const initials = SITE.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-3xl ${GLASS}`}
    >
      {SITE.photo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={SITE.photo}
          alt={`Foto ${SITE.name}`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2d7bff]/30 to-transparent text-6xl font-semibold text-white/80">
          {initials}
        </div>
      )}
    </div>
  );
}
