import { ABOUT } from "@/content/site";
import { GuideSeat } from "@/components/guide/GuideSeat";
import { MetalText } from "@/components/ui/MetalText";
import { Portrait } from "@/components/ui/Portrait";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PANEL } from "@/components/ui/styles";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
      <SectionHeading index="01" title="About" />
      <GuideSeat id="about" className="mb-10" />

      <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-14">
        <Reveal>
          <Portrait />
        </Reveal>

        <div>
          <Reveal step={1}>
            <div className="space-y-5 text-lg leading-relaxed text-fg/85">
              {ABOUT.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>

          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ABOUT.stats.map((s, i) => (
              <Reveal key={s.label} step={2 + i}>
                <div className={`h-full rounded-2xl p-5 ${PANEL}`}>
                  <MetalText as="dd" className="text-3xl font-semibold tracking-tight">
                    {s.value}
                  </MetalText>
                  <dt className="mt-1 font-[family-name:var(--font-mono)] text-xs text-muted">
                    {s.label}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
