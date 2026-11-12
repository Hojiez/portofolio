import { SITE } from "@/content/site";
import { Icon, ICON } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { FOCUS, GLASS } from "@/components/ui/styles";

export function Hero() {
  return (
    <section className="mx-auto flex min-h-[100svh] max-w-5xl flex-col justify-center px-6 pb-16 pt-32">
      {SITE.status && (
        <Reveal>
          <p
            className={`mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs text-slate-300 ${GLASS}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2d7bff] opacity-70 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4d8dff]" />
            </span>
            {SITE.status} · {SITE.location}
          </p>
        </Reveal>
      )}

      <Reveal delay={80}>
        <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl md:text-8xl">
          {SITE.name}
        </h1>
      </Reveal>

      <Reveal delay={160}>
        <p className="mt-5 font-[family-name:var(--font-mono)] text-base text-[#4d8dff] sm:text-lg">
          {SITE.role}
        </p>
      </Reveal>

      <Reveal delay={240}>
        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-400 sm:text-xl">
          {SITE.tagline}
        </p>
      </Reveal>

      <Reveal delay={320}>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#projects"
            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d7bff] px-6 py-3.5 font-medium text-white shadow-[0_0_40px_-8px_rgba(45,123,255,0.7)] transition-colors hover:bg-[#4d8dff] ${FOCUS}`}
          >
            View projects
            <Icon d={ICON.arrowDown} />
          </a>
          <a
            href={SITE.cvUrl}
            download
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-medium text-white transition-colors hover:bg-white/10 ${GLASS} ${FOCUS}`}
          >
            <Icon d={ICON.download} />
            Download CV
          </a>
        </div>
      </Reveal>
    </section>
  );
}
