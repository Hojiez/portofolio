import type { Gear } from "./moves";

/* Perlengkapan Mochi saat berpindah: skateboard di bawah, payung di atas,
   atau api jetpack di bawah. Digambar sebagai SVG logam kecil. */
export function GuideGear({ gear }: { gear: Gear }) {
  if (gear === "board") {
    return (
      <svg aria-hidden="true" viewBox="0 0 104 26" className="gear-pop pointer-events-none absolute -bottom-4 left-1/2 w-[104px] -translate-x-1/2">
        <defs>
          <linearGradient id="gear-deck" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef0f3" />
            <stop offset="0.5" stopColor="#9aa0a9" />
            <stop offset="1" stopColor="#4f545c" />
          </linearGradient>
        </defs>
        <path d="M6 6 Q2 6 3 10 L6 12 H98 L101 10 Q102 6 98 6 Z" fill="url(#gear-deck)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <rect x="22" y="12" width="6" height="4" fill="#3a3e45" />
        <rect x="76" y="12" width="6" height="4" fill="#3a3e45" />
        {[25, 79].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="20" r="5" fill="#1a1c20" />
            <circle cx={cx} cy="20" r="2" fill="#cfd3d9" />
          </g>
        ))}
      </svg>
    );
  }
  if (gear === "umbrella") {
    return (
      <svg aria-hidden="true" viewBox="0 0 110 74" className="gear-pop pointer-events-none absolute -top-[58px] left-1/2 w-[110px] -translate-x-1/2">
        <defs>
          <linearGradient id="gear-canopy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2f4f7" />
            <stop offset="1" stopColor="#7b818a" />
          </linearGradient>
        </defs>
        <path d="M6 40 Q55 -10 104 40 Q93 33 80 40 Q68 33 55 40 Q42 33 30 40 Q17 33 6 40 Z" fill="url(#gear-canopy)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <path d="M55 6 V40 M30 40 Q42 16 55 6 M80 40 Q68 16 55 6" stroke="rgba(30,32,36,0.35)" strokeWidth="1" fill="none" />
        <path d="M55 40 V70 Q55 74 59 73" stroke="#cfd3d9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (gear === "jet") {
    return (
      <div aria-hidden="true" className="gear-pop pointer-events-none absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-6">
        <span className="gear-flame" />
        <span className="gear-flame" />
      </div>
    );
  }
  return null;
}
