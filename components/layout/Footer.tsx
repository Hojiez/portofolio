"use client";

import { useSyncExternalStore } from "react";
import { SITE } from "@/content/site";

// Tahun diambil dari jam pengunjung setelah halaman tampil. Saat dirender di
// server dipakai angka tetap, supaya HTML server dan browser tidak berbeda.
const noopSubscribe = () => () => {};
const getYear = () => new Date().getFullYear();
const getServerYear = () => 2026;

export function Footer() {
  const year = useSyncExternalStore(noopSubscribe, getYear, getServerYear);

  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 font-[family-name:var(--font-mono)] text-xs text-slate-500 sm:flex-row">
        <p>
          © {year} {SITE.name}
        </p>
        <p>Built with Next.js &amp; Tailwind CSS</p>
      </div>
    </footer>
  );
}
