"use client";

import { useState } from "react";
import { SITE } from "@/content/site";
import { PANEL } from "./styles";

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
      className={`relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-3xl ${PANEL}`}
    >
      {SITE.photo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={SITE.photo}
          alt={`Photo of ${SITE.name}`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
          <span className="metal-text text-6xl font-semibold">{initials}</span>
        </div>
      )}
    </div>
  );
}
