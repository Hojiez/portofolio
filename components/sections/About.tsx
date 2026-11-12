import { ABOUT } from "@/content/site";
import { GuideSeat } from "@/components/guide/GuideSeat";
import { MetalText } from "@/components/ui/MetalText";
import { Portrait } from "@/components/ui/Portrait";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/* About bergaya editorial: kalimat pembuka besar dan bio di kiri; foto dan
   angka sebagai daftar bertitik di kolom kanan yang lebih sempit. */
export function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-24 sm:py-32">
      <SectionHeading index="01" title="About" />
      <GuideSeat id="about" className="mb-12" />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <Reveal>
            <MetalText
              as="p"
              className="text-balance text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl"
            >
              {ABOUT.headline}
            </MetalText>
          </Reveal>
          <Reveal step={1}>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-fg/80 lg:pl-12">
              {ABOUT.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <aside className="lg:col-span-4 lg:pt-2">
          <Reveal step={2}>
            <div className="max-w-[220px]">
              <Portrait />
            </div>
          </Reveal>
          {/* angka sorotan: label kiri, nilai kanan, dihubungkan garis titik */}
          <dl className="mt-10 space-y-4">
            {ABOUT.stats.map((s, i) => (
              <Reveal key={s.label} step={3 + i}>
                <div className="flex items-baseline gap-3">
                  <dt className="text-sm text-muted">{s.label}</dt>
                  <span aria-hidden="true" className="flex-1 translate-y-[-3px] border-b border-dotted border-white/15" />
                  <MetalText as="dd" className="font-[family-name:var(--font-mono)] text-lg font-semibold">
                    {s.value}
                  </MetalText>
                </div>
              </Reveal>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
