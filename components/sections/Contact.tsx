import { SITE, SOCIALS } from "@/content/site";
import { Icon, ICON } from "@/components/ui/Icon";
import { MetalText } from "@/components/ui/MetalText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FOCUS, PANEL } from "@/components/ui/styles";

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
      <SectionHeading index="04" title="Contact" />

      <Reveal>
        <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-14 ${PANEL}`}>
          {/* kilau logam redup di pojok kanan atas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.07] blur-[100px]"
          />
          <div className="relative">
            <MetalText
              as="p"
              className="max-w-lg text-pretty text-2xl font-semibold leading-snug tracking-tight sm:text-4xl"
            >
              Have a project in mind? Let&apos;s talk.
            </MetalText>
            <a
              href={`mailto:${SITE.email}`}
              className={`mt-6 inline-flex items-center gap-2 break-all rounded font-[family-name:var(--font-mono)] text-base text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent sm:text-lg ${FOCUS}`}
            >
              {SITE.email}
            </a>

            <ul className="mt-10 flex flex-wrap gap-3">
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
        </div>
      </Reveal>
    </section>
  );
}
