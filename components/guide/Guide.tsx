"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SCRIPT, wordsOf, type SeatId } from "@/content/script";
import { INTRO_DONE_EVENT } from "@/components/intro/introState";
import { sfxBoing } from "@/components/intro/sfx";
import { FOCUS } from "@/components/ui/styles";
import type { MascotExpression } from "./expressions";
import { getLine, setLine } from "./guideStore";
import { Mascot, type MascotLook } from "./Mascot";

/*
 * Guide — Mochi sebagai pemandu (docs/MASTER_PLAN.md bagian 6).
 *
 * Satu Mochi untuk seluruh halaman. Di layar lebar ia melayang ke kursi
 * (GuideSeat) section yang sedang dibaca; di HP ia menempel di pojok kanan
 * bawah dan kalimatnya tetap muncul di kursi section.
 *
 * Aturan:
 *   - Kursi baru aktif setelah berada di tengah layar selama DWELL ms, jadi
 *     section yang hanya dilewati saat scroll cepat tidak diucapkan.
 *   - Satu kalimat per kursi per kunjungan; kembali ke kursi lama tidak
 *     mengulang kalimatnya.
 *   - Pindah kursi di tengah kalimat: sisa kalimat lama langsung tampil utuh.
 *   - Kalimat hero diucapkan tepat setelah intro ditutup.
 */

const SECTION_SEATS: SeatId[] = ["hero", "about", "projects", "skills", "contact"];

const SIZE = 88; // ukuran Mochi di layar lebar (sama dengan kotak kursi)
const DOCK_SIZE = 64; // ukuran Mochi saat menempel di pojok (HP)
const DWELL = 450; // ms kursi harus berada di tengah layar sebelum aktif
const TRAVEL = 800; // ms durasi terbang antar kursi (sama dengan .guide-mochi)
const WORD_MS = 115; // jeda antar kata
const PAUSE_MS = 280; // jeda setelah tanda baca
const REACT_MS = 2400; // lama ekspresi reaksi setelah selesai bicara

// Arah pandang saat bicara: ke balon teks.
const LOOK_BUBBLE: MascotLook = { x: 0.65, y: 0.1 }; // balon di kanan Mochi
const LOOK_BUBBLE_DOCKED: MascotLook = { x: -0.55, y: -0.55 }; // balon di atas-kiri

const MOBILE = "(max-width: 767px)";
function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(MOBILE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const isMobile = () => window.matchMedia(MOBILE).matches;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const introOpen = () => document.documentElement.getAttribute("data-intro") === "show";

type TimerKey = "dwell" | "arrive" | "speak" | "react" | "poke";

export function Guide() {
  const docked = useSyncExternalStore(subscribeMobile, isMobile, () => false);
  const [visible, setVisible] = useState(false);
  const [expression, setExpression] = useState<MascotExpression>("idle");
  const [look, setLook] = useState<MascotLook | undefined>(undefined);

  const mochiRef = useRef<HTMLDivElement>(null);
  const active = useRef<SeatId | null>(null);
  const speaking = useRef(false);
  const lastY = useRef(0);
  const timers = useRef<Partial<Record<TimerKey, number>>>({});

  const clear = useCallback((key: TimerKey) => window.clearTimeout(timers.current[key]), []);

  /* Taruh Mochi di kotak kursi (layar lebar). Mengembalikan posisi y-nya. */
  const place = useCallback((id: SeatId) => {
    const el = mochiRef.current;
    if (!el) return 0;
    if (isMobile()) {
      el.style.transform = "";
      return 0;
    }
    const spot = document.querySelector(`[data-seat-spot="${id}"]`);
    const page = document.getElementById("page");
    if (!spot || !page) return 0;
    const s = spot.getBoundingClientRect();
    const p = page.getBoundingClientRect();
    const x = s.left - p.left + (s.width - SIZE) / 2;
    const y = s.top - p.top + (s.height - SIZE) / 2;
    el.style.transform = `translate(${x}px, ${y}px)`;
    return y;
  }, []);

  /* Ekspresi reaksi sebentar setelah kalimat selesai, lalu kembali santai. */
  const react = useCallback(
    (id: SeatId) => {
      speaking.current = false;
      setExpression(SCRIPT[id].expression);
      clear("react");
      timers.current.react = window.setTimeout(() => {
        setExpression("idle");
        setLook(undefined); // kembali melirik sendiri
      }, REACT_MS);
    },
    [clear]
  );

  /* Ucapkan kalimat kursi kata demi kata (atau diam jika sudah pernah). */
  const speak = useCallback(
    (id: SeatId) => {
      clear("speak");
      clear("react");
      const words = wordsOf(id);
      const start = getLine(id);
      if (start.done) {
        setExpression("idle");
        setLook(undefined);
        return;
      }
      if (reducedMotion()) {
        setLine(id, { shown: words.length, done: true });
        react(id);
        return;
      }
      speaking.current = true;
      setExpression("talk");
      setLook(isMobile() ? LOOK_BUBBLE_DOCKED : LOOK_BUBBLE);
      let shown = start.shown;
      const step = () => {
        shown += 1;
        const done = shown >= words.length;
        setLine(id, { shown, done });
        if (done) {
          react(id);
          return;
        }
        const word = words[shown - 1];
        timers.current.speak = window.setTimeout(step, /[.,!?]$/.test(word) ? PAUSE_MS : WORD_MS);
      };
      step();
    },
    [clear, react]
  );

  /* Pindahkan Mochi ke kursi baru, lalu bicara setelah sampai. */
  const activate = useCallback(
    (id: SeatId) => {
      if (active.current === id) return;
      const prev = active.current;
      clear("arrive");
      clear("speak");
      clear("react");

      // kalimat lama yang terpotong langsung ditampilkan utuh
      if (prev) {
        const line = getLine(prev);
        if (line.shown > 0 && !line.done) setLine(prev, { shown: wordsOf(prev).length, done: true });
      }
      speaking.current = false;
      active.current = id;

      // kemunculan pertama: langsung di kursi tanpa terbang
      const el = mochiRef.current;
      const first = prev === null;
      if (first && el) el.style.transition = "none";
      const oldY = lastY.current;
      const newY = place(id);
      lastY.current = newY;
      if (first && el) {
        void el.offsetWidth; // paksa posisi diterapkan sebelum transisi dinyalakan lagi
        el.style.transition = "";
      }
      setVisible(true);

      const flies = !first && !isMobile() && !reducedMotion();
      if (flies) {
        setExpression("idle");
        setLook({ x: 0, y: newY > oldY ? 0.8 : -0.8 }); // menoleh ke arah terbang
      }
      timers.current.arrive = window.setTimeout(() => speak(id), flies ? TRAVEL : first ? 450 : 150);
    },
    [clear, place, speak]
  );

  // Pantau kursi mana yang sedang berada di tengah layar.
  useEffect(() => {
    const seatEl = (id: SeatId) => document.querySelector(`[data-seat="${id}"]`);
    const inBand = new Set<SeatId>();
    const atTop = () => window.scrollY < window.innerHeight * 0.5;

    const consider = (delay = DWELL) => {
      clear("dwell");
      if (introOpen()) return;
      // kursi yang paling dekat ke tengah layar
      let best: SeatId | null = null;
      let bestDist = Infinity;
      inBand.forEach((id) => {
        const r = seatEl(id)?.getBoundingClientRect();
        if (!r) return;
        const dist = Math.abs(r.top + r.height / 2 - window.innerHeight * 0.45);
        if (dist < bestDist) {
          bestDist = dist;
          best = id;
        }
      });
      // Di bagian paling atas kursi hero sering berada di bawah "tengah
      // layar", jadi hero dipilih jika tidak ada kursi lain.
      if (!best && atTop()) best = "hero";
      if (!best) return;
      const target: SeatId = best;
      timers.current.dwell = window.setTimeout(() => {
        if (!introOpen()) activate(target);
      }, delay);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = e.target.getAttribute("data-seat") as SeatId;
          if (e.isIntersecting) inBand.add(id);
          else inBand.delete(id);
        });
        consider();
      },
      // "tengah layar" = antara 15% dari atas dan 25% dari bawah
      { rootMargin: "-15% 0px -25% 0px" }
    );
    SECTION_SEATS.forEach((id) => {
      const el = seatEl(id);
      if (el) io.observe(el);
    });

    // Kalimat hero tepat setelah intro ditutup. (Saat halaman dibuka tanpa
    // intro, pemantau di atas langsung memanggil consider() sekali.)
    const onIntroDone = () => consider(350);
    window.addEventListener(INTRO_DONE_EVENT, onIntroDone);

    const t = timers.current;
    return () => {
      io.disconnect();
      window.removeEventListener(INTRO_DONE_EVENT, onIntroDone);
      Object.values(t).forEach((id) => window.clearTimeout(id));
    };
  }, [activate, clear]);

  // Isi halaman berubah tinggi (misalnya filter project, gambar dimuat, ukuran
  // layar berubah): pindahkan Mochi supaya tetap di kursinya.
  useEffect(() => {
    const page = document.getElementById("page");
    if (!page) return;
    const ro = new ResizeObserver(() => {
      if (active.current) lastY.current = place(active.current);
    });
    ro.observe(page);
    return () => ro.disconnect();
  }, [place]);

  // Berpindah antara mode HP (menempel di pojok) dan layar lebar.
  useEffect(() => {
    if (active.current) lastY.current = place(active.current);
  }, [docked, place]);

  /* Diklik: memantul dan tersenyum (bunyi "boing" jika suara aktif). */
  const poke = () => {
    sfxBoing();
    if (speaking.current) return;
    clear("poke");
    setExpression("happy");
    timers.current.poke = window.setTimeout(() => {
      if (!speaking.current) setExpression("idle");
    }, 1100);
  };

  return (
    <div
      ref={mochiRef}
      aria-hidden={!visible}
      className={`guide-mochi z-30 ${docked ? "fixed bottom-4 right-4" : "absolute left-0 top-0"} ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={poke}
        tabIndex={visible ? 0 : -1}
        aria-label="Mochi, the site's guide. Click to say hi."
        className={`block rounded-full ${FOCUS}`}
      >
        <Mascot expression={expression} look={look} size={docked ? DOCK_SIZE : SIZE} />
      </button>
    </div>
  );
}
