"use client";

import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/content/site";
import { openPalette, useModKey } from "@/components/command/CommandPalette";
import { SoundToggle } from "@/components/guide/SoundToggle";
import { Icon, ICON } from "@/components/ui/Icon";
import { FOCUS, METAL_BUTTON, PANEL } from "@/components/ui/styles";

/* Section yang sedang dibaca: yang melewati garis di tengah layar. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
          // kembali ke hero: tidak ada menu yang aktif
          else if (e.target.id === ids[0] && e.boundingClientRect.top > 0) setActive(null);
        });
      },
      // "garis tengah": pita tipis di 45% tinggi layar
      { rootMargin: "-45% 0px -54% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
}

/* Garis progres scroll di tepi bawah navbar. Lebarnya diatur langsung lewat
   transform (tanpa state React), sekali per frame. */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 bottom-0 h-px overflow-hidden">
      <div
        ref={ref}
        className="scroll-progress h-full origin-left bg-gradient-to-r from-white/20 via-white/80 to-white/30"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection();
  const mod = useModKey();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        aria-label="Main navigation"
        className={`relative mx-auto max-w-5xl rounded-2xl px-4 py-3 sm:px-6 ${PANEL} bg-ink/60`}
      >
        <div className="flex items-center justify-between">
          <a
            href="#top"
            className={`rounded font-[family-name:var(--font-mono)] text-sm font-medium text-fg ${FOCUS}`}
          >
            <span className="text-accent">~/</span>
            {SITE.shortName}
          </a>

          {/* menu desktop */}
          <ul className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => {
              const on = active === n.href.slice(1);
              return (
                <li key={n.href}>
                  <a
                    href={n.href}
                    aria-current={on ? "location" : undefined}
                    className={`relative rounded text-sm transition-colors hover:text-fg ${on ? "text-fg" : "text-muted"} ${FOCUS}`}
                  >
                    {n.label}
                    {/* titik logam di bawah menu yang aktif */}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-fg transition-opacity duration-300 ${
                        on ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={openPalette}
                aria-label="Open command palette"
                className={`inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-muted transition-colors hover:border-white/25 hover:text-fg ${FOCUS}`}
              >
                <kbd>{mod}</kbd>
                <kbd>K</kbd>
              </button>
            </li>
            <li className="-mx-4">
              <SoundToggle />
            </li>
            {SITE.cvUrl && (
              <li>
                <a
                  data-magnetic
                  href={SITE.cvUrl}
                  download
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${METAL_BUTTON} ${FOCUS}`}
                >
                  <Icon d={ICON.download} />
                  CV
                </a>
              </li>
            )}
          </ul>

          {/* perintah cepat + suara + menu HP */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={openPalette}
              aria-label="Open command palette"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg font-[family-name:var(--font-mono)] text-sm text-muted hover:text-fg ${FOCUS}`}
            >
              &gt;_
            </button>
            <SoundToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-fg md:hidden ${FOCUS}`}
            >
              <Icon d={menuOpen ? ICON.close : ICON.menu} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* menu HP */}
        {menuOpen && (
          <ul
            id="mobile-menu"
            className="mt-3 flex flex-col gap-1 border-t border-line pt-3 md:hidden"
          >
            {NAV.map((n) => {
              const on = active === n.href.slice(1);
              return (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={on ? "location" : undefined}
                    className={`block rounded-lg px-3 py-3 hover:bg-white/5 hover:text-fg ${on ? "bg-white/5 text-fg" : "text-fg/85"} ${FOCUS}`}
                  >
                    {n.label}
                  </a>
                </li>
              );
            })}
            {SITE.cvUrl && (
              <li>
                <a
                  href={SITE.cvUrl}
                  download
                  onClick={() => setMenuOpen(false)}
                  className={`mt-1 flex items-center justify-center gap-2 rounded-lg px-3 py-3 font-medium ${METAL_BUTTON} ${FOCUS}`}
                >
                  <Icon d={ICON.download} />
                  Download CV
                </a>
              </li>
            )}
          </ul>
        )}

        <ScrollProgress />
      </nav>
    </header>
  );
}
