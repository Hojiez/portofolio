"use client";

import { useState } from "react";
import { CATEGORIES, PROJECTS, type Category } from "@/content/site";
import { GuideSeat } from "@/components/guide/GuideSeat";
import { Icon, ICON } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { FOCUS, METAL_BUTTON, PANEL } from "@/components/ui/styles";

export function Projects() {
  const [filter, setFilter] = useState<Category>("All");

  const visibleProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <section id="projects" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
      <SectionHeading index="02" title="Projects" />
      <GuideSeat id="projects" className="mb-10" />

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
                    ? `font-medium ${METAL_BUTTON}`
                    : `text-muted hover:text-fg ${PANEL}`
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
                  <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-muted">
                    {p.category}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-fg">
                    {p.title}
                  </h3>
                  <p className="mt-2 flex-1 leading-relaxed text-muted">
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
            </Reveal>
          </li>
        ))}
      </ul>

      {visibleProjects.length === 0 && (
        <p className={`rounded-2xl p-8 text-center text-muted ${PANEL}`}>
          Belum ada project di kategori ini.
        </p>
      )}
    </section>
  );
}
