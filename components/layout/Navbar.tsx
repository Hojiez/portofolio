"use client";

import { useState } from "react";
import { NAV, SITE } from "@/content/site";
import { SoundToggle } from "@/components/guide/SoundToggle";
import { Icon, ICON } from "@/components/ui/Icon";
import { FOCUS, METAL_BUTTON, PANEL } from "@/components/ui/styles";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        aria-label="Main navigation"
        className={`mx-auto max-w-5xl rounded-2xl px-4 py-3 sm:px-6 ${PANEL} bg-ink/60`}
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
          <ul className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className={`rounded text-sm text-muted transition-colors hover:text-fg ${FOCUS}`}
                >
                  {n.label}
                </a>
              </li>
            ))}
            <li className="-mx-4">
              <SoundToggle />
            </li>
            {SITE.cvUrl && (
              <li>
                <a
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

          {/* tombol suara + menu HP */}
          <div className="flex items-center md:hidden">
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
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-fg/85 hover:bg-white/5 hover:text-fg ${FOCUS}`}
                >
                  {n.label}
                </a>
              </li>
            ))}
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
      </nav>
    </header>
  );
}
