import { Reveal } from "./Reveal";

/* Judul section */
export function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <Reveal className="mb-10 flex items-baseline gap-4 sm:mb-14">
      <span className="font-[family-name:var(--font-mono)] text-sm text-[#4d8dff]">
        {index}
      </span>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
    </Reveal>
  );
}
