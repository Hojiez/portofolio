import { MetalText } from "./MetalText";
import { Reveal } from "./Reveal";

/* Judul section */
export function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <Reveal className="mb-10 flex items-baseline gap-4 sm:mb-14">
      <span className="font-[family-name:var(--font-mono)] text-sm text-muted">
        {index}
      </span>
      <MetalText as="h2" className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </MetalText>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </Reveal>
  );
}
