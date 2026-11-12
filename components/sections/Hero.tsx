import { SITE } from "@/content/site";
import { Icon, ICON } from "@/components/ui/Icon";
import { MetalShader } from "@/components/ui/MetalShader";
import { MetalText } from "@/components/ui/MetalText";
import { Reveal } from "@/components/ui/Reveal";
import { FOCUS, METAL_BUTTON, PANEL } from "@/components/ui/styles";

export function Hero() {
  return (
    <section className="mx-auto grid min-h-[100svh] max-w-5xl content-center items-center gap-10 px-6 pb-16 pt-32 lg:grid-cols-[1fr_340px]">
      {/* Shader: di atas teks di HP, di kanan pada layar lebar */}
      <Reveal className="order-first lg:order-last">
        <MetalShader className="mx-auto h-40 w-40 sm:h-56 sm:w-56 lg:h-[340px] lg:w-[340px]" />
      </Reveal>

      <div>
        {SITE.status && (
          <Reveal>
            <p
              className={`mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs text-fg/85 ${PANEL}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {SITE.status} · {SITE.location}
            </p>
          </Reveal>
        )}

        <Reveal delay={80}>
          <MetalText
            as="h1"
            className="text-balance pb-2 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
          >
            {SITE.name}
          </MetalText>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-5 font-[family-name:var(--font-mono)] text-base text-muted sm:text-lg">
            {SITE.role}
          </p>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted sm:text-xl">
            {SITE.tagline}
          </p>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#projects"
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-medium transition ${METAL_BUTTON} ${FOCUS}`}
            >
              View projects
              <Icon d={ICON.arrowDown} />
            </a>
            <a
              href={SITE.cvUrl}
              download
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-medium text-fg transition-colors hover:bg-white/10 ${PANEL} ${FOCUS}`}
            >
              <Icon d={ICON.download} />
              Download CV
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
