import type { Metadata } from "next";
import { Mascot } from "@/components/guide/Mascot";
import { EXPRESSIONS } from "@/components/guide/expressions";
import { MascotPlayground } from "./MascotPlayground";

// Halaman uji maskot — hanya untuk pengembangan, dihapus di Fase 4.
export const metadata: Metadata = {
  title: "Mochi — halaman uji",
  robots: { index: false, follow: false },
};

export default function MascotTestPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-fg">Mochi — halaman uji</h1>
      <p className="mt-2 text-muted">
        Klik tombol untuk mengganti ekspresi. Di bawahnya, keenam ekspresi di ukuran 160px dan 64px.
      </p>

      <MascotPlayground />

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {EXPRESSIONS.map((e) => (
          <section key={e} className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-[family-name:var(--font-mono)] text-sm text-muted">{e}</h2>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <Mascot expression={e} size={160} />
              <Mascot expression={e} size={64} />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
