"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { NAV, SITE, SOCIALS } from "@/content/site";
import { reactMochi } from "@/components/guide/mochiEvents";
import { setSoundOn, useSoundOn } from "@/components/guide/soundPref";
import { sfxEnter, sfxToggleOn } from "@/components/intro/sfx";
import { showToast } from "@/components/ui/toast";
import { PANEL } from "@/components/ui/styles";
import { copyEmail, downloadCv, goTo, openUrl, replayIntro } from "./actions";

/*
 * Command palette bergaya terminal (Ctrl+K / ⌘K, atau "/").
 *
 * Pengunjung mengetik untuk menyaring perintah: lompat ke section, unduh CV,
 * salin email, buka GitHub/LinkedIn, nyalakan/matikan suara, putar ulang
 * intro. Beberapa perintah rahasia hanya muncul jika diketik persis.
 * Navigasi dengan panah atas/bawah, Enter menjalankan, Esc menutup.
 */

export const PALETTE_OPEN_EVENT = "palette:open";
export const openPalette = () => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT));

/* Label tombol pintas: ⌘ di Mac, Ctrl di tempat lain. Di server selalu
   "Ctrl", supaya HTML server dan browser sama saat pertama dirender. */
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const noop = () => () => {};
export function useModKey() {
  return useSyncExternalStore(noop, () => (isMac() ? "⌘" : "Ctrl"), () => "Ctrl");
}

type Command = {
  id: string;
  group: "Go to" | "Actions" | "Links" | "Secret";
  label: string;
  hint?: string;
  keywords?: string;
  /** Perintah rahasia: hanya tampil jika teks yang diketik sama persis. */
  secret?: string;
  run: () => void;
};

function useCommands(): Command[] {
  const soundOn = useSoundOn();
  return useMemo(() => {
    const list: Command[] = [
      { id: "top", group: "Go to", label: "Top", hint: "~", keywords: "home hero start", run: () => goTo("top") },
      ...NAV.map((n) => ({
        id: n.href,
        group: "Go to" as const,
        label: n.label,
        hint: n.href,
        run: () => goTo(n.href.slice(1)),
      })),
      { id: "copy", group: "Actions", label: "Copy email address", hint: SITE.email, keywords: "mail contact", run: () => void copyEmail() },
      { id: "mail", group: "Actions", label: "Write an email", hint: "mailto", keywords: "contact send", run: () => (window.location.href = `mailto:${SITE.email}`) },
      ...(SITE.cvUrl
        ? [{ id: "cv", group: "Actions" as const, label: "Download CV", hint: "PDF", keywords: "resume", run: downloadCv }]
        : []),
      {
        id: "sound",
        group: "Actions",
        label: soundOn ? "Turn sound off" : "Turn sound on",
        keywords: "mute audio volume voice",
        run: () => {
          setSoundOn(!soundOn);
          if (!soundOn) sfxToggleOn();
          showToast(soundOn ? "Sound off" : "Sound on");
        },
      },
      { id: "intro", group: "Actions", label: "Replay the intro", keywords: "terminal restart again", run: replayIntro },
      ...SOCIALS.map((s) => ({
        id: s.href,
        group: "Links" as const,
        label: `Open ${s.label}`,
        hint: s.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
        run: () => openUrl(s.href),
      })),
      {
        id: "hire",
        group: "Secret",
        label: "sudo hire rauh",
        secret: "sudo hire rauh",
        run: () => {
          reactMochi("trick");
          showToast("Permission granted. Taking you to his contact details.", 3200);
          goTo("contact");
        },
      },
      {
        id: "mochi",
        group: "Secret",
        label: "mochi",
        secret: "mochi",
        run: () => {
          reactMochi("trick");
          showToast("Mochi did a backflip. You're welcome.");
        },
      },
      {
        id: "rm",
        group: "Secret",
        label: "rm -rf /",
        secret: "rm -rf /",
        run: () => {
          reactMochi("smirk");
          showToast("Nice try. This site has no files to delete.");
        },
      },
    ];
    return list;
  }, [soundOn]);
}

/* Cocokkan teks ketikan: semua hurufnya muncul berurutan di label+kata kunci. */
function matches(cmd: Command, q: string) {
  if (cmd.secret) return q === cmd.secret;
  if (!q) return true;
  const hay = `${cmd.label} ${cmd.keywords ?? ""} ${cmd.group}`.toLowerCase();
  if (hay.includes(q)) return true;
  let i = 0;
  for (const ch of hay) if (ch === q[i]) i++;
  return i === q.length;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const commands = useCommands();

  const q = query.trim().toLowerCase();
  const results = commands.filter((c) => matches(c, q));
  const active = Math.min(index, Math.max(0, results.length - 1));

  const show = () => {
    // jangan buka di atas intro
    if (document.documentElement.getAttribute("data-intro") === "show") return;
    returnFocus.current = document.activeElement;
    setQuery("");
    setIndex(0);
    setOpen(true);
  };
  const hide = () => {
    setOpen(false);
    const el = returnFocus.current;
    if (el instanceof HTMLElement) el.focus({ preventScroll: true });
  };
  const run = (cmd: Command | undefined) => {
    if (!cmd) return;
    sfxEnter();
    setOpen(false);
    // jalankan setelah palette tertutup, supaya scroll dan fokus tidak bentrok
    window.setTimeout(cmd.run, 10);
  };

  // Tombol pintas global: Ctrl/⌘+K membuka/menutup, "/" membuka.
  const showRef = useRef(show);
  const hideRef = useRef(hide);
  const openRef = useRef(open);
  useEffect(() => {
    showRef.current = show;
    hideRef.current = hide;
    openRef.current = open;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (openRef.current) hideRef.current();
        else showRef.current();
        return;
      }
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        showRef.current();
      }
    };
    const onOpen = () => showRef.current();
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_OPEN_EVENT, onOpen);
    };
  }, []);

  // Saat terbuka: fokus ke kolom ketik, kunci scroll halaman di belakangnya.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Pilihan aktif selalu terlihat saat digulir dengan panah.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((active + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((active - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      hide();
    } else if (e.key === "Tab") {
      // fokus tetap di kolom ketik (satu-satunya elemen yang bisa difokus)
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh]">
      <div className="palette-fade absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={hide} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={`palette-in relative w-full max-w-lg overflow-hidden rounded-2xl ${PANEL} bg-ink/90`}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <span aria-hidden="true" className="font-[family-name:var(--font-mono)] text-sm text-accent">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            placeholder="Type a command or search…"
            aria-label="Type a command"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-[family-name:var(--font-mono)] text-sm text-fg placeholder:text-muted focus:outline-none"
          />
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-muted sm:block">
            esc
          </kbd>
        </div>

        <ul ref={listRef} id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center font-[family-name:var(--font-mono)] text-xs text-muted">
              command not found: {query}
            </li>
          )}
          {results.map((cmd, i) => {
            const heading = i === 0 || results[i - 1].group !== cmd.group ? cmd.group : null;
            return (
              <li key={cmd.id} role="presentation">
                {heading && (
                  <p className="px-3 pb-1 pt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-muted first:pt-1">
                    {heading}
                  </p>
                )}
                <div
                  id={`palette-${cmd.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  onMouseMove={() => i !== active && setIndex(i)}
                  onClick={() => run(cmd)}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    i === active ? "bg-white/10 text-fg" : "text-fg/75"
                  }`}
                >
                  <span>{cmd.label}</span>
                  {cmd.hint && (
                    <span className="truncate font-[family-name:var(--font-mono)] text-[11px] text-muted">{cmd.hint}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-line px-4 py-2 font-[family-name:var(--font-mono)] text-[10px] text-muted">
          <span>↑↓ to move · enter to run</span>
          <span>try typing a secret</span>
        </div>
      </div>
    </div>
  );
}
