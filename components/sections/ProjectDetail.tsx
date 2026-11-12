"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { PROJECTS, type Project } from "@/content/site";
import { Icon, ICON } from "@/components/ui/Icon";
import { MetalText } from "@/components/ui/MetalText";
import { FOCUS, METAL_BUTTON, PANEL } from "@/components/ui/styles";

/*
 * Panel detail project: terbuka di tengah layar saat kartu project diklik
 * (components/sections/Projects.tsx). Isinya dari `details` di
 * content/site.ts; bagian peran, tantangan, dan pelajaran hanya tampil jika
 * sudah diisi.
 *
 * Esc atau klik di luar panel = tutup. Fokus keyboard dipindah ke panel saat
 * dibuka dan dikembalikan ke kartunya saat ditutup. Halaman di belakangnya
 * tidak bisa di-scroll selama panel terbuka.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-muted">{title}</h3>
      <div className="mt-3 text-[15px] leading-relaxed text-fg/85">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <motion.li
          key={t}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.05 }}
          className="flex gap-3"
        >
          <span aria-hidden="true" className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-fg/60" />
          <span>{t}</span>
        </motion.li>
      ))}
    </ul>
  );
}

/* Panel dirender langsung di <body> (portal): kalau tetap di dalam <main>,
   lapisan z-index-nya terkunci di bawah navbar dan Mochi. */
const noop = () => () => {};
function useBody() {
  return useSyncExternalStore(
    noop,
    () => document.body,
    () => null
  );
}

export function ProjectDetail({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const body = useBody();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<Element | null>(null);

  // terbuka: kunci scroll halaman, fokus ke panel, Esc menutup
  useEffect(() => {
    if (!project) return;
    returnFocus.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => panelRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      const el = returnFocus.current;
      if (el instanceof HTMLElement) el.focus({ preventScroll: true });
    };
  }, [project, onClose]);

  const d = project?.details;
  const number = project ? String(PROJECTS.indexOf(project) + 1).padStart(2, "0") : "";

  if (!body) return null;
  return createPortal(
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {project && (
          <motion.div
            key="detail"
            className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-detail-title"
              tabIndex={-1}
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className={`relative max-h-[92svh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-3xl outline-none sm:rounded-3xl ${PANEL} bg-ink/95`}
            >
              {/* kepala panel, menempel di atas saat isinya di-scroll */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-ink/90 px-6 py-3 backdrop-blur-md sm:px-8">
                <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-muted">
                  {project.category} · {number}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close project details"
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg/80 hover:bg-white/10 hover:text-fg ${FOCUS}`}
                >
                  <Icon d={ICON.close} />
                </button>
              </div>

              <div className="px-6 pb-8 pt-6 sm:px-8">
                <MetalText
                  as="h2"
                  className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
                >
                  <span id="project-detail-title">{project.title}</span>
                </MetalText>
                <p className="mt-3 text-lg leading-relaxed text-muted">{project.description}</p>

                {project.media && (
                  <picture className="mt-6 block overflow-hidden rounded-xl border border-line bg-ink">
                    <source srcSet={project.media.poster} media="(prefers-reduced-motion: reduce)" />
                    {/* <img> biasa: animasi WebP harus dikirim apa adanya */}
                    <img
                      src={project.media.src}
                      alt={project.media.alt}
                      width={800}
                      height={500}
                      className="block aspect-[8/5] h-auto w-full object-cover"
                    />
                  </picture>
                )}

                {d && (
                  <>
                    <Section title="What it is">
                      <p>{d.overview}</p>
                    </Section>
                    {d.role && (
                      <Section title="My role">
                        <p>{d.role}</p>
                      </Section>
                    )}
                    <Section title="How it's built">
                      <Bullets items={d.built} />
                    </Section>
                    {d.highlights && d.highlights.length > 0 && (
                      <Section title="Highlights">
                        <Bullets items={d.highlights} />
                      </Section>
                    )}
                    {d.challenge && (
                      <Section title="The hard part">
                        <p>{d.challenge}</p>
                      </Section>
                    )}
                    {d.learned && (
                      <Section title="What I learned">
                        <p>{d.learned}</p>
                      </Section>
                    )}
                  </>
                )}

                <Section title="Stack">
                  <ul className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <li
                        key={t}
                        className="rounded-md border border-line px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-fg/80"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </Section>

                {(project.liveUrl || project.repoUrl) && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium ${METAL_BUTTON} ${FOCUS}`}
                      >
                        Open live site
                        <Icon d={ICON.arrowUpRight} />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm text-fg transition-colors hover:bg-white/10 ${PANEL} ${FOCUS}`}
                      >
                        View the code
                        <Icon d={ICON.arrowUpRight} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>,
    body
  );
}
