import { MetalText } from "./MetalText";
import { Reveal } from "./Reveal";

/* Judul section, dengan angka raksasa bergaris tipis di belakangnya supaya
   tiap section punya "penanda" yang kuat tanpa mengganggu isi. */
export function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <Reveal className="relative mb-10 sm:mb-14">
      <span
        aria-hidden="true"
        className="section-ghost pointer-events-none absolute -top-16 right-0 select-none font-semibold leading-none sm:-top-24"
      >
        {index}
      </span>
      <div className="relative flex items-baseline gap-4">
        <span className="font-[family-name:var(--font-mono)] text-sm text-muted">{index}</span>
        <MetalText as="h2" className="text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </MetalText>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
    </Reveal>
  );
}
