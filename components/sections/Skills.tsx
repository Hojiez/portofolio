import { SKILLS } from "@/content/site";
import { GuideSeat } from "@/components/guide/GuideSeat";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
 * Skills sebagai pita berjalan: satu baris per kelompok, bergulir tanpa henti
 * dengan arah bergantian, berhenti saat disentuh kursor. Isinya digandakan
 * supaya putarannya mulus; salinan kedua disembunyikan dari pembaca layar.
 * Dengan prefers-reduced-motion, pita diam dan isinya dibungkus ke bawah.
 */
/* Ulangi isi kelompok yang pendek supaya satu putaran pita selalu lebih lebar
   dari layar (kalau tidak, ada celah kosong saat pita bergulir). */
const MIN_ITEMS = 10;
function fill(items: string[]) {
  const times = Math.max(1, Math.ceil(MIN_ITEMS / items.length));
  return Array.from({ length: times }, () => items).flat();
}

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading index="03" title="Skills" />
        <GuideSeat id="skills" className="mb-12" />
      </div>

      <div className="space-y-5">
        {SKILLS.map((g, i) => (
          <Reveal key={g.group} step={i}>
            {/* di HP label di atas pita; di layar lebar label di kiri */}
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 sm:flex-row sm:items-center sm:gap-6">
              <h3 className="shrink-0 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-muted sm:w-36">
                {g.group}
              </h3>
              <div className="marquee-mask min-w-0 flex-1 overflow-hidden">
                <div className={`marquee-track ${i % 2 ? "marquee-reverse" : ""}`}>
                  {[0, 1].map((copy) => (
                    <ul key={copy} aria-hidden={copy === 1} className="marquee-group">
                      {fill(g.items).map((s, k) => (
                        <li
                          key={k}
                          // pengulangan untuk mengisi pita disembunyikan dari pembaca layar
                          aria-hidden={k >= g.items.length || undefined}
                          className="whitespace-nowrap rounded-full border border-line bg-surface/70 px-5 py-2.5 text-base text-fg/90 backdrop-blur-sm sm:text-lg"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
