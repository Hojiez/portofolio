"use client";

import { SITE } from "@/content/site";
import { reactMochi } from "@/components/guide/mochiEvents";
import { INTRO_KEY } from "@/components/intro/introState";
import { showToast } from "@/components/ui/toast";

/*
 * Aksi yang dipakai bersama oleh command palette dan tombol-tombol di
 * halaman (misalnya tombol salin email di Contact).
 */

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Gulir ke section (id tanpa #); "top" = paling atas. */
export function goTo(id: string) {
  const behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth";
  if (id === "top") {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
}

/* Cara lama menyalin teks, untuk browser yang menolak navigator.clipboard. */
function legacyCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

/** Salin email. Mengembalikan true jika berhasil. */
export async function copyEmail() {
  let ok = false;
  try {
    // batas waktu: di beberapa browser janji clipboard bisa menggantung
    await Promise.race([
      navigator.clipboard.writeText(SITE.email),
      new Promise((_, reject) => setTimeout(reject, 1200)),
    ]);
    ok = true;
  } catch {
    ok = legacyCopy(SITE.email);
  }
  if (ok) {
    showToast(`Copied ${SITE.email}`);
    reactMochi("cheer");
  } else {
    // tidak bisa menyalin sama sekali: tampilkan alamatnya supaya bisa disalin manual
    showToast(SITE.email, 5000);
  }
  return ok;
}

export function downloadCv() {
  if (!SITE.cvUrl) return;
  const a = document.createElement("a");
  a.href = SITE.cvUrl;
  a.download = "";
  a.click();
  showToast("Downloading CV");
}

export function openUrl(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

/** Tampilkan intro lagi: hapus tanda "sudah dilihat", lalu muat ulang. */
export function replayIntro() {
  try {
    sessionStorage.removeItem(INTRO_KEY);
  } catch {
    // sessionStorage diblokir: intro memang selalu tampil saat reload
  }
  window.scrollTo(0, 0);
  window.location.reload();
}
