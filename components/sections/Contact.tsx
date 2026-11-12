import { SITE, SOCIALS } from "@/content/site";
import { Icon, ICON } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FOCUS, GLASS } from "@/components/ui/styles";

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
      <SectionHeading index="04" title="Contact" />

      <Reveal>
        <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-14 ${GLASS}`}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2d7bff]/30 blur-[100px]"
          />
          <div className="relative">
            <p className="max-w-lg text-pretty text-2xl font-semibold leading-snug tracking-tight text-white sm:text-4xl">
              Have a project in mind? Let&apos;s talk.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className={`mt-6 inline-flex items-center gap-2 break-all rounded font-[family-name:var(--font-mono)] text-base text-[#4d8dff] underline decoration-[#4d8dff]/40 underline-offset-4 hover:decoration-[#4d8dff] sm:text-lg ${FOCUS}`}
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
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white ${GLASS} ${FOCUS}`}
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
