"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectDetail } from "./ProjectDetail";
import { CATEGORIES, PROJECTS, type Category, type Project } from "@/content/site";
import { GuideSeat } from "@/components/guide/GuideSeat";
import { Icon, ICON } from "@/components/ui/Icon";
import { MetalText } from "@/components/ui/MetalText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { FOCUS, METAL_BUTTON, PANEL } from "@/components/ui/styles";

/*
 * Grid "bento": kartu pertama besar (unggulan), sisanya kecil, dan baris
 * terakhir diregangkan supaya grid selalu penuh tanpa lubang. Di layar besar
 * grid-nya 6 kolom, di tablet 2 kolom, di HP 1 kolom.
 */
function spanFor(i: number, n: number) {
  if (n === 1) return "sm:col-span-2 lg:col-span-6";
  if (i === 0) return n === 2 ? "sm:col-span-2 lg:col-span-4" : "sm:col-span-2 lg:col-span-4 lg:row-span-2";
  if (n === 2) return "sm:col-span-2 lg:col-span-2";
  // setelah kartu unggulan + 2 kartu di sebelahnya, sisanya berbaris tiga-tiga
  const rest = n - 3;
  const pos = i - 3;
  const lastRowStart = rest - (rest % 3 || 3);
  const smLast = (n - 1) % 2 === 1 && i === n - 1 ? " sm:col-span-2" : "";
  if (i < 3 || pos < lastRowStart) return `lg:col-span-2${smLast}`;
  const inLastRow = rest % 3 || 3; // 1, 2, atau 3 kartu di baris terakhir
  // ditulis lengkap supaya Tailwind membuat kelasnya (nama kelas tidak boleh dirakit)
  const span = { 1: "lg:col-span-6", 2: "lg:col-span-3", 3: "lg:col-span-2" }[inLastRow];
  return `${span}${smLast}`;
}

function ProjectCard({
  p,
  index,
  featured,
  onOpen,
}: {
  p: Project;
  index: number;
  featured: boolean;
  onOpen: () => void;
}) {
  return (
    <TiltCard className="h-full">
      {/* klik di mana saja pada kartu (kecuali link Live/Code) membuka panel detail */}
      <article
        data-mochi-curious
        onClick={(e) => {
          if (p.details && !(e.target instanceof Element && e.target.closest("a, button"))) onOpen();
        }}
        className={`flex h-full flex-col ${p.details ? "cursor-pointer" : ""} ${featured ? "p-8 sm:p-10" : "p-6"}`}
      >
        {p.media && (
          // animasi demo; pengunjung dengan prefers-reduced-motion melihat poster diam
          <picture className="mb-5 block overflow-hidden rounded-xl border border-line bg-ink">
            <source srcSet={p.media.poster} media="(prefers-reduced-motion: reduce)" />
            {/* <img> biasa, bukan next/image: animasi WebP harus dikirim apa adanya */}
            <img
              src={p.media.src}
              alt={p.media.alt}
              width={800}
              height={500}
              loading="lazy"
              decoding="async"
              className="block aspect-[8/5] h-auto w-full object-cover"
            />
          </picture>
        )}
        <div className="flex items-start justify-between gap-4">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-muted">
            {p.category}
          </p>
          <MetalText
            className={`font-[family-name:var(--font-mono)] font-semibold leading-none ${
              featured ? "text-5xl sm:text-6xl" : "text-2xl"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </MetalText>
        </div>
        <h3
          className={`font-semibold tracking-tight text-fg ${
            featured ? "mt-6 text-3xl sm:text-4xl" : "mt-3 text-xl"
          }`}
        >
          {p.title}
        </h3>
        <p className={`mt-3 flex-1 leading-relaxed text-muted ${featured ? "max-w-md text-lg" : ""}`}>
          {p.description}
        </p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {p.tech.map((t) => (
            <li
              key={t}
              className="rounded-md border border-line px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-fg/80"
            >
              {t}
            </li>
          ))}
        </ul>

        {(p.liveUrl || p.repoUrl || p.details) && (
          <div className="mt-6 flex items-center gap-5 border-t border-line pt-4 text-sm">
            {p.details && (
              <button
                type="button"
                onClick={onOpen}
                className={`group/details mr-auto inline-flex items-center gap-1.5 rounded font-medium text-fg ${FOCUS}`}
              >
                Details
                <span aria-hidden="true" className="transition-transform group-hover/details:translate-x-0.5">
                  →
                </span>
                <span className="sr-only"> about {p.title}</span>
              </button>
            )}
            {p.liveUrl && (
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 rounded text-fg hover:text-accent ${FOCUS}`}
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
                className={`inline-flex items-center gap-1 rounded text-muted hover:text-accent ${FOCUS}`}
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
  );
}

/*
 * Scroll horizontal yang "terkunci": tinggi pembungkus luar = tinggi layar +
 * jeda awal + panjang geseran deretan + jeda akhir. Selama pembungkus itu
 * lewat, bagian dalamnya menempel (sticky) di layar dan deretan kartu digeser
 * ke kiri sebanding dengan posisi scroll, dengan jeda diam di kedua ujung.
 * Semua diatur langsung lewat style (tanpa state React).
 */
function useHorizontalPin(count: number) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    let distance = 0;
    let holdStart = 0; // jarak scroll (px) sebelum deretan mulai bergeser
    let holdEnd = 0; // jarak scroll (px) setelah kartu terakhir, sebelum halaman lanjut
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!pin.dataset.pinned) return;
      const rect = pin.getBoundingClientRect();
      // posisi geser: 0 selama jeda awal, 0–1 selama bergeser, 1 selama jeda akhir
      const scrolled = -rect.top - holdStart;
      const p = distance > 0 ? Math.max(0, Math.min(1, scrolled / distance)) : 0;
      track.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (countRef.current) {
        const n = Math.min(count, Math.floor(p * (count - 1) + 0.5) + 1);
        countRef.current.textContent = `${String(n).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // hitung ulang panjang geseran (ukuran layar berubah, filter berganti)
    const measure = () => {
      if (!mq.matches) {
        delete pin.dataset.pinned;
        pin.style.height = "";
        track.style.transform = "";
        return;
      }
      pin.dataset.pinned = "true";
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      // Jeda di kedua ujung: deretan berhenti sebentar di kartu pertama dan
      // terakhir, jadi scroll yang kebablasan tidak langsung melompat keluar
      // dari section (dan masuk ke section tidak langsung menggeser kartu).
      const vh = window.innerHeight;
      holdStart = vh * 0.2;
      holdEnd = vh * 0.45;
      pin.style.height = `${vh + holdStart + distance + holdEnd}px`;
      update();
    };

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  return { pinRef, trackRef, countRef, barRef };
}

export function Projects() {
  const [filter, setFilter] = useState<Category>("All");

  const visibleProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
  const { pinRef, trackRef, countRef, barRef } = useHorizontalPin(visibleProjects.length);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const closeProject = useCallback(() => setOpenProject(null), []);

  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-24 sm:py-32">
      <SectionHeading index="02" title="Projects" />

      {/* kalimat Mochi di kiri, filter kategori di kanan (bertumpuk di HP) */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <GuideSeat id="projects" />
        <Reveal>
          <div
            role="group"
            aria-label="Filter projects by category"
            className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 lg:justify-end"
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
                    active ? `font-medium ${METAL_BUTTON}` : `text-muted hover:text-fg ${PANEL}`
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* Di layar lebar: section "terkunci" di layar dan scroll ke bawah
          menggeser deretan kartu ke samping (useHorizontalPin). Di HP/tablet
          dan dengan prefers-reduced-motion: grid bento biasa. */}
      <div ref={pinRef} className="pin-outer relative">
        <div className="pin-sticky">
          <ul ref={trackRef} className="pin-track grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {visibleProjects.map((p, i) => (
              <li key={p.title} className={spanFor(i, visibleProjects.length)}>
                <Reveal step={Math.min(i, 3)} className="h-full">
                  <ProjectCard
                p={p}
                index={PROJECTS.indexOf(p)}
                featured={i === 0 && visibleProjects.length > 2}
                onOpen={() => setOpenProject(p)}
              />
                </Reveal>
              </li>
            ))}
          </ul>
          {/* penunjuk posisi deretan: nomor kartu dan garis progres */}
          <div aria-hidden="true" className="pin-meta">
            <span ref={countRef} className="font-[family-name:var(--font-mono)] text-xs text-muted">
              01 / {String(visibleProjects.length).padStart(2, "0")}
            </span>
            <span className="relative h-px w-40 overflow-hidden bg-white/10">
              <span ref={barRef} className="absolute inset-0 origin-left bg-white/60" style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
        </div>
      </div>

      {visibleProjects.length === 0 && (
        <p className={`rounded-2xl p-8 text-center text-muted ${PANEL}`}>Nothing in this category yet.</p>
      )}

      {/* panel detail project yang sedang dibuka */}
      <ProjectDetail project={openProject} onClose={closeProject} />
    </section>
  );
}
