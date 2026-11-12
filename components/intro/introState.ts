/*
 * Status intro, disimpan di atribut <html data-intro="...">:
 *   "show" — intro sedang tampil (halaman di belakangnya disembunyikan & dikunci)
 *   "seen" — intro sudah dilihat di sesi ini, atau sudah ditutup
 *   (tanpa atribut) — JavaScript mati: intro tidak pernah tampil
 *
 * CSS di app/globals.css bagian INTRO membaca atribut ini, jadi tampil atau
 * tidaknya intro tidak menunggu React.
 */

export const INTRO_KEY = "intro-seen";
export const INTRO_DONE_EVENT = "intro:done";

/** Dijalankan saat HTML dibaca, sebelum halaman digambar. */
export const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{d.setAttribute("data-intro",sessionStorage.getItem("${INTRO_KEY}")?"seen":"show")}catch(e){d.setAttribute("data-intro","seen")}})()`;

export function introShouldShow() {
  try {
    return !sessionStorage.getItem(INTRO_KEY);
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    // sessionStorage diblokir: intro akan tampil lagi saat reload, tidak masalah
  }
  document.documentElement.setAttribute("data-intro", "seen");
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}
