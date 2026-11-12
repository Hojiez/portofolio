/* Latar: orb gradien + grid tipis. Animasi orb ada di app/globals.css. */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="orb-a absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-[#2d7bff]/25 blur-[120px]" />
      <div className="orb-b absolute -right-40 top-1/3 h-[520px] w-[520px] rounded-full bg-[#1a3fff]/20 blur-[140px]" />
      <div className="orb-c absolute bottom-[-180px] left-1/3 h-[420px] w-[420px] rounded-full bg-[#00c2ff]/10 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}
