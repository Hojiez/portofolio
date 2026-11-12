"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { useRef, useState } from "react";
import { PROJECTS, SKILLS, type Project } from "@/content/site";
import { goTo } from "@/components/command/actions";
import { Icon, ICON } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { FOCUS } from "@/components/ui/styles";

/*
 * Pita skill yang hidup (library Motion):
 *   - tiap baris bergulir terus, arah bergantian per baris;
 *   - makin cepat halaman di-scroll, makin cepat pita bergulir dan sedikit
 *     miring; scroll ke atas membalik arahnya; lalu kembali pelan saat berhenti;
 *   - kursor di atas pita = pita melambat sampai diam, supaya mudah diklik.
 *
 * Tiap skill bisa diklik: panel di bawah pita menampilkan project mana yang
 * memakainya (dicocokkan dengan daftar tech tiap project di content/site.ts).
 *
 * Dengan prefers-reduced-motion: pita diam dan isinya dibungkus ke bawah
 * (aturan CSS .marquee-* di globals.css).
 */

/* Skill yang dipakai untuk membangun situs portfolio ini sendiri. */
const THIS_SITE = ["TypeScript", "React", "Next.js", "Tailwind CSS", "Git", "Vercel", "HTML/CSS"];

/* Project yang memakai sebuah skill: nama skill dan nama tech dicocokkan
   tanpa memedulikan huruf besar, dan skill gabungan seperti
   "React Native (Expo)" atau "HTML/CSS" cocok dengan bagian-bagiannya. */
function projectsFor(skill: string): Project[] {
  const parts = skill
    .toLowerCase()
    .split(/[()/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return PROJECTS.filter((p) =>
    p.tech.some((t) => {
      const tech = t.toLowerCase();
      return parts.some((part) => tech === part || tech.startsWith(`${part} `) || tech === `${part} api`);
    })
  );
}

/* Ulangi isi kelompok yang pendek supaya satu putaran pita selalu lebih lebar
   dari layar (kalau tidak, ada celah kosong saat pita bergulir). */
const MIN_ITEMS = 10;
function fill(items: string[]) {
  const times = Math.max(1, Math.ceil(MIN_ITEMS / items.length));
  return Array.from({ length: times }, () => items).flat();
}

const BASE_SPEED = 1.6; // % lebar pita per detik (setengah lebar = satu putaran)

function Ribbon({
  items,
  direction,
  selected,
  onPick,
}: {
  items: string[];
  direction: 1 | -1;
  selected: string | null;
  onPick: (skill: string) => void;
}) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  // kecepatan scroll -> pengali kecepatan pita (0 = biasa, 5 = sangat cepat)
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  // kemiringan mengikuti kecepatan scroll
  const skew = useTransform(smoothVelocity, [-2000, 2000], [7, -7]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef<number>(direction);
  const hover = useRef(false);
  const slow = useRef(1); // 1 = jalan, 0 = diam (saat dihover)

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    slow.current += ((hover.current ? 0 : 1) - slow.current) * 0.08;
    const vf = velocityFactor.get();
    // scroll ke atas membalik arah, scroll ke bawah mengembalikannya
    if (vf < 0) dir.current = -direction;
    else if (vf > 0) dir.current = direction;
    let moveBy = dir.current * -BASE_SPEED * (delta / 1000);
    moveBy += moveBy * Math.abs(vf);
    baseX.set(baseX.get() + moveBy * slow.current);
  });

  return (
    <div
      className="marquee-mask min-w-0 flex-1 overflow-hidden"
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
    >
      <motion.div className="marquee-track" style={reduce ? undefined : { x, skewX: skew }}>
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="marquee-group">
            {fill(items).map((s, k) => {
              const hidden = copy === 1 || k >= items.length;
              const on = selected === s;
              return (
                <li key={k} aria-hidden={k >= items.length || undefined}>
                  <button
                    type="button"
                    tabIndex={hidden ? -1 : 0}
                    onClick={() => onPick(s)}
                    aria-pressed={on}
                    className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-base backdrop-blur-sm transition-colors sm:text-lg ${FOCUS} ${
                      on
                        ? "border-white/70 bg-white text-ink"
                        : "border-line bg-surface/70 text-fg/90 hover:border-white/30 hover:text-fg"
                    }`}
                  >
                    {s}
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </motion.div>
    </div>
  );
}

export function SkillsMarquee() {
  const [selected, setSelected] = useState<string | null>(null);
  const used = selected ? projectsFor(selected) : [];
  const onSite = selected ? THIS_SITE.includes(selected) : false;

  return (
    <div>
      <div className="space-y-5">
        {SKILLS.map((g, i) => (
          <Reveal key={g.group} step={i}>
            {/* di HP label di atas pita; di layar lebar label di kiri */}
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 sm:flex-row sm:items-center sm:gap-6">
              <h3 className="shrink-0 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-muted sm:w-36">
                {g.group}
              </h3>
              <Ribbon
                items={g.items}
                direction={i % 2 ? -1 : 1}
                selected={selected}
                onPick={(s) => setSelected((cur) => (cur === s ? null : s))}
              />
            </div>
          </Reveal>
        ))}
      </div>

      {/* skill terpilih: project yang memakainya */}
      <div className="mx-auto mt-8 max-w-5xl px-6" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur-md"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm text-muted">
                  Where <span className="font-semibold text-fg">{selected}</span> shows up
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className={`rounded font-[family-name:var(--font-mono)] text-[11px] text-muted hover:text-fg ${FOCUS}`}
                >
                  close ✕
                </button>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {used.map((p, i) => (
                  <motion.li
                    key={p.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <a
                      href={p.liveUrl ?? p.repoUrl ?? "#projects"}
                      target={p.liveUrl || p.repoUrl ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-fg/90 transition-colors hover:border-white/30 hover:text-fg ${FOCUS}`}
                    >
                      {p.title}
                      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase text-muted">{p.category}</span>
                      {(p.liveUrl || p.repoUrl) && <Icon d={ICON.arrowUpRight} />}
                    </a>
                  </motion.li>
                ))}
                {onSite && (
                  <motion.li initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <button
                      type="button"
                      onClick={() => goTo("top")}
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-sm text-fg/90 hover:border-white/30 hover:text-fg ${FOCUS}`}
                    >
                      This portfolio
                      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase text-muted">you&apos;re on it</span>
                    </button>
                  </motion.li>
                )}
                {used.length === 0 && !onSite && (
                  <li className="text-sm text-muted">Used day to day, not tied to one project.</li>
                )}
              </ul>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center font-[family-name:var(--font-mono)] text-[11px] text-muted"
            >
              click any skill to see where I used it
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
