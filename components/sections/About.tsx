import { ABOUT } from "@/content/site";
import { GuideSeat } from "@/components/guide/GuideSeat";
import { MetalText } from "@/components/ui/MetalText";
import { Portrait } from "@/components/ui/Portrait";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollLitText } from "@/components/ui/ScrollLitText";
import { CountUp } from "@/components/ui/CountUp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CertViewer } from "./CertViewer";
import { CodingStory } from "./CodingStory";
import { ABOUT_DRAWER_ID } from "./StatRow";

/* About bergaya editorial: kalimat pembuka besar dan bio di kiri; foto dan
   angka sebagai daftar bertitik di kolom kanan yang lebih sempit. */
export function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-24 sm:py-32">
      <SectionHeading index="01" title="About" />
      <GuideSeat id="about" className="mb-12" />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          {/* kalimat pembuka menyala kata demi kata saat di-scroll */}
          <ScrollLitText
            text={ABOUT.headline}
            className="text-balance text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl"
          />
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
          {/* angka sorotan: label kiri, nilai kanan, dihubungkan garis titik.
              "Years coding" dan "English (certified)" bisa dibuka (cerita
              singkat dan sertifikat); sisanya baris biasa. */}
          <div className="mt-10 space-y-4">
            {ABOUT.stats.map((s, i) => (
              <Reveal key={s.label} step={3 + i}>
                {i === 0 ? (
                  <CodingStory label={s.label} value={s.value} />
                ) : s.value === "C1" ? (
                  <CertViewer label={s.label} value={s.value} />
                ) : (
                  <dl className="flex items-baseline gap-3">
                    <dt className="text-sm text-muted">{s.label}</dt>
                    <span aria-hidden="true" className="flex-1 translate-y-[-3px] border-b border-dotted border-white/15" />
                    <MetalText as="dd" className="font-[family-name:var(--font-mono)] text-lg font-semibold">
                      <CountUp value={s.value} />
                    </MetalText>
                  </dl>
                )}
              </Reveal>
            ))}
          </div>
        </aside>
      </div>

      {/* tempat panel yang dibuka dari baris angka di atas (cerita dan
          sertifikat), selebar section; diisi lewat portal oleh StatRow.tsx */}
      <div id={ABOUT_DRAWER_ID} className="mt-12 space-y-10 empty:mt-0" />
    </section>
  );
}
