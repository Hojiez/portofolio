/**
 * Halaman utama — hanya merangkai section.
 * Isi situs (nama, project, skill) ada di content/site.ts.
 */

import { Guide } from "@/components/guide/Guide";
import { Terminal } from "@/components/intro/Terminal";
import { INTRO_SCRIPT } from "@/components/intro/introState";
import { Background } from "@/components/layout/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { CommandPalette } from "@/components/command/CommandPalette";
import { InlineScript } from "@/components/ui/InlineScript";
import { Toaster } from "@/components/ui/Toaster";

export default function Page() {
  return (
    <>
      {/* Tandai apakah intro perlu tampil, sebelum halaman digambar */}
      <InlineScript html={INTRO_SCRIPT} />
      <Terminal />

      <div
        id="page"
        className="relative min-h-screen overflow-x-clip bg-ink font-[family-name:var(--font-inter)] text-fg/85 antialiased selection:bg-accent/30 selection:text-fg"
      >
        <Background />
        <Navbar />
        {/* Mochi melayang di atas isi halaman, dari kursi ke kursi */}
        <Guide />

        <main id="top" tabIndex={-1} className="relative z-10 outline-none">
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </main>

        <Footer />
      </div>

      {/* Ctrl/⌘+K: perintah cepat; notifikasi kecil di bawah layar */}
      <CommandPalette />
      <Toaster />
    </>
  );
}
