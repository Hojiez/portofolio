import { SITE, SOCIALS } from "@/content/site";
import { GuideSeat } from "@/components/guide/GuideSeat";
import { Icon, ICON } from "@/components/ui/Icon";
import { MetalText } from "@/components/ui/MetalText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FOCUS, PANEL } from "@/components/ui/styles";

/* Penutup: "Let's talk." raksasa bergaya logam, lalu email dan sosial media
   dalam satu baris, tanpa kotak panel. */
export function Contact() {
  return (
    <section id="contact" className="relative mx-auto max-w-5xl scroll-mt-28 px-6 pb-24 pt-24 sm:pb-32 sm:pt-32">
      <SectionHeading index="04" title="Contact" />
      <GuideSeat id="contact" className="mb-12" />

      {/* kilau logam redup di belakang judul raksasa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-white/[0.05] blur-[110px]"
      />

      <Reveal>
        <MetalText
          as="p"
          className="relative pb-3 text-[clamp(3.75rem,14vw,10.5rem)] font-semibold leading-[0.9] tracking-[-0.04em]"
        >
          Let&apos;s talk.
        </MetalText>
      </Reveal>

      <Reveal step={1}>
        <div className="relative mt-10 flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="max-w-sm text-lg text-muted">Hiring, building something, or curious about one of the projects? Send me an email.</p>
            <a
              href={`mailto:${SITE.email}`}
              className={`mt-3 inline-flex items-center gap-2 break-all rounded font-[family-name:var(--font-mono)] text-lg text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent sm:text-2xl ${FOCUS}`}
            >
              {SITE.email}
            </a>
          </div>

          <ul className="flex flex-wrap gap-3">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-fg transition-colors hover:bg-white/10 ${PANEL} ${FOCUS}`}
                >
                  {s.label}
                  <Icon d={ICON.arrowUpRight} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
