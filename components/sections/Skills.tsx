import { SKILLS } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GLASS } from "@/components/ui/styles";

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-20 sm:py-28">
      <SectionHeading index="03" title="Skills" />

      <div className="grid gap-5 sm:grid-cols-2">
        {SKILLS.map((g, i) => (
          <Reveal key={g.group} delay={i * 70} className="h-full">
            <div className={`h-full rounded-2xl p-6 ${GLASS}`}>
              <h3 className="font-[family-name:var(--font-mono)] text-sm text-[#4d8dff]">
                {g.group}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li
                    key={s}
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-200"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
