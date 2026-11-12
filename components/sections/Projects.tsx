"use client";

import { useState } from "react";
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

function ProjectCard({ p, index, featured }: { p: Project; index: number; featured: boolean }) {
  return (
    <TiltCard className="h-full">
      <article data-mochi-curious className={`flex h-full flex-col ${featured ? "p-8 sm:p-10" : "p-6"}`}>
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

        {(p.liveUrl || p.repoUrl) && (
          <div className="mt-6 flex gap-5 border-t border-line pt-4 text-sm">
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

export function Projects() {
  const [filter, setFilter] = useState<Category>("All");

  const visibleProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

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

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {visibleProjects.map((p, i) => (
          <li key={p.title} className={spanFor(i, visibleProjects.length)}>
            <Reveal step={i} className="h-full">
              <ProjectCard p={p} index={PROJECTS.indexOf(p)} featured={i === 0 && visibleProjects.length > 2} />
            </Reveal>
          </li>
        ))}
      </ul>

      {visibleProjects.length === 0 && (
        <p className={`rounded-2xl p-8 text-center text-muted ${PANEL}`}>Nothing in this category yet.</p>
      )}
    </section>
  );
}
