import { GuideSeat } from "@/components/guide/GuideSeat";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkillsMarquee } from "./SkillsMarquee";

/*
 * Skills sebagai pita berjalan: satu baris per kelompok, bereaksi ke
 * kecepatan scroll, dan tiap skill bisa diklik untuk melihat project yang
 * memakainya (components/sections/SkillsMarquee.tsx).
 */
export function Skills() {
  return (
    <section id="skills" className="scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading index="03" title="Skills" />
        <GuideSeat id="skills" className="mb-12" />
      </div>
      <SkillsMarquee />
    </section>
  );
}
