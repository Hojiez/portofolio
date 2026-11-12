/**
 * Halaman utama — hanya merangkai section.
 * Isi situs (nama, project, skill) ada di content/site.ts.
 */

import { Background } from "@/components/layout/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink font-[family-name:var(--font-inter)] text-fg/85 antialiased selection:bg-accent/30 selection:text-fg">
      <Background />
      <Navbar />

      <main id="top" className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
