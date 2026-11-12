import { MetalWaves } from "./MetalWaves";

/* Latar: gelombang logam yang meliuk pelan, kilau redup dari atas, dan vinyet
   di pinggir. Tanpa warna biru. */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <MetalWaves />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(220,226,235,0.09), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
