"use client";

/**
 * ============================================================================
 *  PORTFOLIO — satu file, siap tempel ke `app/page.tsx`
 *  Stack : Next.js (App Router) + TypeScript + Tailwind CSS
 *  Tema  : minimalis gelap, glassmorphism, aksen electric blue, orb gradien
 *
 *  Tidak butuh library tambahan (tanpa framer-motion / lucide). Animasi scroll,
 *  efek tilt 3D, dan ikon semuanya ditulis langsung di file ini.
 *
 *  CARA EDIT: cari tulisan  "GANTI DENGAN DATA KAMU"  (Ctrl+F). Semua data
 *  pribadi ada di BAGIAN 1 di bawah — kamu tidak perlu menyentuh bagian lain.
 * ============================================================================
 */

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

/* ----------------------------------------------------------------------------
 *  FONT (otomatis di-host oleh Next.js, tidak perlu <link> Google Fonts)
 * ------------------------------------------------------------------------- */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/* ============================================================================
 *  BAGIAN 1 — DATA PRIBADI
 *  ████████████  GANTI DENGAN DATA KAMU  ████████████
 * ========================================================================= */

const SITE = {
  // >>> GANTI DENGAN DATA KAMU: nama lengkap (tampil besar di hero)
  name: "Rauh Risqi Abdillah",
  // >>> GANTI DENGAN DATA KAMU: nama pendek / inisial untuk logo di navbar
  shortName: "Rauh",
  // >>> GANTI DENGAN DATA KAMU: jabatan / peran
  role: "Full-Stack Developer",
  // >>> GANTI DENGAN DATA KAMU: satu kalimat pembuka di hero
  tagline:
    "I build fast, clean web products — from smart contracts and AI tooling to the interfaces people actually touch.",
  // >>> GANTI DENGAN DATA KAMU: teks status kecil di atas nama (kosongkan "" untuk menyembunyikan)
  status: "Open to work",
  // >>> GANTI DENGAN DATA KAMU: lokasi
  location: "Balikpapan, Indonesia",
  // >>> GANTI DENGAN DATA KAMU: email
  email: "rauhrisqiabdil@gmail.com",
  // >>> GANTI DENGAN DATA KAMU: file CV — taruh PDF-nya di folder /public
  cvUrl: "/cv.pdf",
  // >>> GANTI DENGAN DATA KAMU: path foto — taruh fotonya di folder /public
  //     (kalau file tidak ada, otomatis diganti kotak berisi inisial nama)
  photo: "/profile.jpg",
};

// >>> GANTI DENGAN DATA KAMU: link sosial media (hapus / tambah baris sesukamu)
const SOCIALS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/Hojiez" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rauh-abdillah-5ab331326/" },
  { label: "Instagram", href: "https://instagram.com/mehemew" },
];

const ABOUT = {
  // >>> GANTI DENGAN DATA KAMU: bio — tiap string = satu paragraf
  bio: [
    "Tulis paragraf pertama bio kamu di sini. Ceritakan siapa kamu, apa yang sedang kamu kerjakan, dan apa yang membuatmu tertarik pada bidang ini.",
    "Paragraf kedua: pengalaman, cara kerja, atau hal yang ingin kamu pelajari berikutnya. Singkat saja — dua sampai tiga kalimat sudah cukup.",
  ],
  // >>> GANTI DENGAN DATA KAMU: angka sorotan (maksimal 4 supaya rapi)
  stats: [
    { value: "3+", label: "Years coding" },
    { value: "12", label: "Projects shipped" },
    { value: "4", label: "Hackathons" },
    { value: "∞", label: "Cups of coffee" },
  ],
};

// Kategori filter project. Boleh diganti, tapi "All" harus tetap ada di depan.
// >>> GANTI DENGAN DATA KAMU (opsional): daftar kategori
const CATEGORIES = ["All", "Web", "Backend", "Mobile", "Tools"] as const;
type Category = (typeof CATEGORIES)[number];

type Project = {
  title: string;
  description: string;
  category: Exclude<Category, "All">;
  tech: string[];
  liveUrl?: string; // opsional — hapus kalau tidak ada demo
  repoUrl?: string; // opsional — hapus kalau repo privat
};

// >>> GANTI DENGAN DATA KAMU: daftar project
const PROJECTS: Project[] = [
  {
    title: "Toko Perabotan (v2)",
    description:
      "Aplikasi web toko perabotan full-stack dengan login JWT, pembayaran via Midtrans, dan fitur AI berbasis Google Gemini.",
    category: "Web",
    tech: ["Node.js", "Express", "PostgreSQL", "JWT", "Midtrans", "Gemini API"],
    liveUrl: "https://app-database-new.vercel.app",
    repoUrl: "https://github.com/Hojiez/app-database-new",
  },
  {
    title: "Toko Perabotan (Go)",
    description:
      "Versi backend aplikasi toko perabotan yang ditulis ulang dengan Go dan framework Gin, terhubung ke database MySQL.",
    category: "Backend",
    tech: ["Go", "Gin", "MySQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan_golang",
  },
  {
    title: "Toko Perabotan",
    description:
      "Aplikasi CRUD database toko perabotan dengan REST API Express dan PostgreSQL, plus antarmuka web sederhana.",
    category: "Backend",
    tech: ["Node.js", "Express", "PostgreSQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan",
  },
  {
    title: "Rehab Stroke",
    description:
      "Aplikasi web untuk pengelolaan data rehabilitasi pasien stroke, dibangun dengan Spring Boot, Thymeleaf, dan MySQL.",
    category: "Web",
    tech: ["Java", "Spring Boot", "Thymeleaf", "MySQL"],
    repoUrl: "https://github.com/Hojiez/rehab",
  },
  {
    title: "Tugas Expo",
    description:
      "Aplikasi mobile React Native dengan Expo Router dan navigasi tab, dibuat sebagai tugas pengembangan aplikasi mobile.",
    category: "Mobile",
    tech: ["React Native", "Expo", "TypeScript"],
    repoUrl: "https://github.com/Hojiez/tugas-expo",
  },
  {
    title: "Fish Watcher",
    description:
      "Aplikasi desktop yang memantau pesan Discord dan otomatis bergabung ke server Roblox, dengan GUI dan notifikasi desktop.",
    category: "Tools",
    tech: ["Python", "Playwright", "CustomTkinter"],
    repoUrl: "https://github.com/Hojiez/fish-watcher",
  },
  {
    title: "rauh. — Portfolio Lama",
    description:
      "Portfolio single-page bergaya dark minimalist dengan glassmorphism, background partikel, dan pemutar musik acak.",
    category: "Web",
    tech: ["HTML", "Tailwind CSS", "JavaScript"],
    liveUrl: "https://hojiez.github.io/porto/",
    repoUrl: "https://github.com/Hojiez/porto",
  },
];

// >>> GANTI DENGAN DATA KAMU: tech stack, dikelompokkan
const SKILLS: { group: string; items: string[] }[] = [
  {
    group: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "HTML/CSS"],
  },
  {
    group: "Backend",
    items: ["Node.js", "Express", "Python", "PostgreSQL", "REST API"],
  },
  {
    group: "AI & Data",
    items: ["PyTorch", "scikit-learn", "Pandas", "LLM APIs"],
  },
  {
    group: "Tools",
    items: ["Git", "Docker", "Figma", "Vercel", "Linux"],
  },
];

/* ============================================================================
 *  SELESAI — di bawah ini kode tampilan. Tidak wajib diubah.
 * ========================================================================= */

const NAV = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

// Kelas "kaca" yang dipakai berulang
const GLASS =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d8dff]";

/* ----------------------------------------------------------------------------
 *  Ikon kecil (SVG inline, tanpa library)
 * ------------------------------------------------------------------------- */
function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
const ICON = {
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  download: "M12 4v11M7 11l5 5 5-5M5 20h14",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
};

/* ----------------------------------------------------------------------------
 *  Reveal — elemen muncul halus saat masuk layar
 * ------------------------------------------------------------------------- */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        shown
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 *  TiltCard — kartu kaca yang miring mengikuti kursor (desktop saja)
 * ------------------------------------------------------------------------- */
function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${
      (x - 0.5) * 8
    }deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative overflow-hidden rounded-2xl transition-transform duration-200 ease-out will-change-transform ${GLASS} ${className}`}
    >
      {/* kilau biru yang mengikuti kursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(45,123,255,0.18), transparent 60%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 *  Judul section
 * ------------------------------------------------------------------------- */
function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <Reveal className="mb-10 flex items-baseline gap-4 sm:mb-14">
      <span className="font-[family-name:var(--font-mono)] text-sm text-[#4d8dff]">
        {index}
      </span>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
    </Reveal>
  );
}

/* ----------------------------------------------------------------------------
 *  Foto profil dengan fallback inisial
 * ------------------------------------------------------------------------- */
function Portrait() {
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

/* ============================================================================
 *  HALAMAN
 * ========================================================================= */
export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Category>("All");
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const visibleProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <div
      className={`${inter.variable} ${mono.variable} relative min-h-screen overflow-x-clip bg-[#07090d] font-[family-name:var(--font-inter)] text-slate-300 antialiased selection:bg-[#2d7bff]/40 selection:text-white`}
    >
      {/* Animasi orb + smooth scroll. Ditaruh di sini supaya tetap satu file. */}
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes orb-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6vw,8vh) scale(1.15); } }
        @keyframes orb-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-8vw,-6vh) scale(1.1); } }
        @keyframes orb-c { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(4vw,-10vh) scale(0.9); } }
        .orb-a { animation: orb-a 22s ease-in-out infinite; }
        .orb-b { animation: orb-b 28s ease-in-out infinite; }
        .orb-c { animation: orb-c 34s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .orb-a, .orb-b, .orb-c { animation: none; }
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/*  LATAR: orb gradien + grid tipis                                    */}
      {/* ------------------------------------------------------------------ */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="orb-a absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-[#2d7bff]/25 blur-[120px]" />
        <div className="orb-b absolute -right-40 top-1/3 h-[520px] w-[520px] rounded-full bg-[#1a3fff]/20 blur-[140px]" />
        <div className="orb-c absolute bottom-[-180px] left-1/3 h-[420px] w-[420px] rounded-full bg-[#00c2ff]/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  NAVBAR                                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav
          aria-label="Navigasi utama"
          className={`mx-auto max-w-5xl rounded-2xl px-4 py-3 sm:px-6 ${GLASS} bg-[#07090d]/60`}
        >
          <div className="flex items-center justify-between">
            <a
              href="#top"
              className={`rounded font-[family-name:var(--font-mono)] text-sm font-medium text-white ${FOCUS}`}
            >
              <span className="text-[#4d8dff]">~/</span>
              {SITE.shortName}
            </a>

            {/* menu desktop */}
            <ul className="hidden items-center gap-8 md:flex">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className={`rounded text-sm text-slate-400 transition-colors hover:text-white ${FOCUS}`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={SITE.cvUrl}
                  download
                  className={`inline-flex items-center gap-2 rounded-lg bg-[#2d7bff] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4d8dff] ${FOCUS}`}
                >
                  <Icon d={ICON.download} />
                  CV
                </a>
              </li>
            </ul>

            {/* tombol menu HP */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-white md:hidden ${FOCUS}`}
            >
              <Icon d={menuOpen ? ICON.close : ICON.menu} className="h-5 w-5" />
            </button>
          </div>

          {/* menu HP */}
          {menuOpen && (
            <ul
              id="mobile-menu"
              className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3 md:hidden"
            >
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white ${FOCUS}`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={SITE.cvUrl}
                  download
                  onClick={() => setMenuOpen(false)}
                  className={`mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#2d7bff] px-3 py-3 font-medium text-white ${FOCUS}`}
                >
                  <Icon d={ICON.download} />
                  Download CV
                </a>
              </li>
            </ul>
          )}
        </nav>
      </header>

      <main id="top" className="relative z-10">
        {/* ---------------------------------------------------------------- */}
        {/*  HERO                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto flex min-h-[100svh] max-w-5xl flex-col justify-center px-6 pb-16 pt-32">
          {SITE.status && (
            <Reveal>
              <p
                className={`mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs text-slate-300 ${GLASS}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2d7bff] opacity-70 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4d8dff]" />
                </span>
                {SITE.status} · {SITE.location}
              </p>
            </Reveal>
          )}

          <Reveal delay={80}>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl md:text-8xl">
              {SITE.name}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 font-[family-name:var(--font-mono)] text-base text-[#4d8dff] sm:text-lg">
              {SITE.role}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-400 sm:text-xl">
              {SITE.tagline}
            </p>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#projects"
                className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d7bff] px-6 py-3.5 font-medium text-white shadow-[0_0_40px_-8px_rgba(45,123,255,0.7)] transition-colors hover:bg-[#4d8dff] ${FOCUS}`}
              >
                View projects
                <Icon d={ICON.arrowDown} />
              </a>
              <a
                href={SITE.cvUrl}
                download
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-medium text-white transition-colors hover:bg-white/10 ${GLASS} ${FOCUS}`}
              >
                <Icon d={ICON.download} />
                Download CV
              </a>
            </div>
          </Reveal>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  ABOUT                                                            */}
        {/* ---------------------------------------------------------------- */}
        <section id="about" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
          <SectionHeading index="01" title="About" />

          <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-14">
            <Reveal>
              <Portrait />
            </Reveal>

            <div>
              <Reveal delay={100}>
                <div className="space-y-5 text-lg leading-relaxed text-slate-300">
                  {ABOUT.bio.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>

              <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ABOUT.stats.map((s, i) => (
                  <Reveal key={s.label} delay={150 + i * 70}>
                    <div className={`h-full rounded-2xl p-5 ${GLASS}`}>
                      <dd className="text-3xl font-semibold tracking-tight text-white">
                        {s.value}
                      </dd>
                      <dt className="mt-1 font-[family-name:var(--font-mono)] text-xs text-slate-400">
                        {s.label}
                      </dt>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  PROJECTS                                                         */}
        {/* ---------------------------------------------------------------- */}
        <section id="projects" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
          <SectionHeading index="02" title="Projects" />

          {/* filter kategori */}
          <Reveal>
            <div
              role="group"
              aria-label="Filter project berdasarkan kategori"
              className="-mx-6 mb-10 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {CATEGORIES.map((c) => {
                const active = filter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full px-4 py-2 font-[family-name:var(--font-mono)] text-xs transition-colors ${FOCUS} ${
                      active
                        ? "bg-[#2d7bff] text-white"
                        : `text-slate-400 hover:text-white ${GLASS}`
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 60} className="h-full">
                  <TiltCard className="h-full">
                    <article className="flex h-full flex-col p-6">
                      <p className="font-[family-name:var(--font-mono)] text-xs text-[#4d8dff]">
                        {p.category}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                        {p.title}
                      </h3>
                      <p className="mt-2 flex-1 leading-relaxed text-slate-400">
                        {p.description}
                      </p>

                      <ul className="mt-5 flex flex-wrap gap-1.5">
                        {p.tech.map((t) => (
                          <li
                            key={t}
                            className="rounded-md border border-white/10 px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-slate-300"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>

                      {(p.liveUrl || p.repoUrl) && (
                        <div className="mt-6 flex gap-5 border-t border-white/10 pt-4 text-sm">
                          {p.liveUrl && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 rounded text-white hover:text-[#4d8dff] ${FOCUS}`}
                            >
                              Live
                              <Icon d={ICON.arrowUpRight} />
                              <span className="sr-only"> — {p.title}</span>
                            </a>
                          )}
                          {p.repoUrl && (
                            <a
                              href={p.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 rounded text-slate-400 hover:text-white ${FOCUS}`}
                            >
                              Code
                              <Icon d={ICON.arrowUpRight} />
                              <span className="sr-only"> — {p.title}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </article>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>

          {visibleProjects.length === 0 && (
            <p className={`rounded-2xl p-8 text-center text-slate-400 ${GLASS}`}>
              Belum ada project di kategori ini.
            </p>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  SKILLS / TECH STACK                                              */}
        {/* ---------------------------------------------------------------- */}
        <section id="skills" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
          <SectionHeading index="03" title="Skills" />

          <div className="grid gap-5 sm:grid-cols-2">
            {SKILLS.map((g, i) => (
              <Reveal key={g.group} delay={i * 70} className="h-full">
                <div className={`h-full rounded-2xl p-6 ${GLASS}`}>
                  <h3 className="font-[family-name:var(--font-mono)] text-sm text-[#4d8dff]">
                    {g.group}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {g.items.map((s) => (
                      <li
                        key={s}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-200"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  CONTACT                                                          */}
        {/* ---------------------------------------------------------------- */}
        <section id="contact" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
          <SectionHeading index="04" title="Contact" />

          <Reveal>
            <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-14 ${GLASS}`}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2d7bff]/30 blur-[100px]"
              />
              <div className="relative">
                <p className="max-w-lg text-pretty text-2xl font-semibold leading-snug tracking-tight text-white sm:text-4xl">
                  Have a project in mind? Let&apos;s talk.
                </p>
                <a
                  href={`mailto:${SITE.email}`}
                  className={`mt-6 inline-flex items-center gap-2 break-all rounded font-[family-name:var(--font-mono)] text-base text-[#4d8dff] underline decoration-[#4d8dff]/40 underline-offset-4 hover:decoration-[#4d8dff] sm:text-lg ${FOCUS}`}
                >
                  {SITE.email}
                </a>

                <ul className="mt-10 flex flex-wrap gap-3">
                  {SOCIALS.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white ${GLASS} ${FOCUS}`}
                      >
                        {s.label}
                        <Icon d={ICON.arrowUpRight} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/*  FOOTER                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 font-[family-name:var(--font-mono)] text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {SITE.name}
          </p>
          <p>Built with Next.js &amp; Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
