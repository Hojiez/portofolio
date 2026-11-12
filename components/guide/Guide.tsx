"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { lineOf, SCRIPT, wordsOf, type LinePart, type SeatId } from "@/content/script";
import { INTRO_DONE_EVENT } from "@/components/intro/introState";
import { sfxBoing, sfxLand } from "@/components/intro/sfx";
import { FOCUS } from "@/components/ui/styles";
import type { MascotExpression } from "./expressions";
import { getLine, setActiveSeat, setLine } from "./guideStore";
import { burst } from "./fx";
import { GuideGear } from "./GuideGear";
import { Mascot, type MascotLook } from "./Mascot";
import { ACTS, CLICK_ACTS, IDLE_ACTS, pick, randomMove, type Gear, type Pos } from "./moves";
import { playVoice, stopVoice, useStopVoiceWhenMuted, wordTimings } from "./useVoice";

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
 *   - Pengunjung diam di satu section tanpa scroll selama MORE_MS setelah
 *     kalimat utama selesai: Mochi menyeringai, lalu mengucapkan kalimat
 *     tambahan section itu (sekali per kunjungan). Scroll mengulang hitungan.
 */

const SECTION_SEATS: SeatId[] = ["hero", "about", "projects", "skills", "contact"];

const SIZE = 88; // ukuran Mochi di layar lebar (sama dengan kotak kursi)
const DOCK_SIZE = 64; // ukuran Mochi saat menempel di pojok (HP)
const DWELL = 450; // ms kursi harus berada di tengah layar sebelum aktif
const WORD_MS = 115; // jeda antar kata
const PAUSE_MS = 280; // jeda setelah tanda baca
const REACT_MS = 2400; // lama ekspresi reaksi setelah selesai bicara
const MORE_MS = 6000; // diam tanpa scroll selama ini: kalimat tambahan

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

type TimerKey = "dwell" | "arrive" | "speak" | "react" | "poke" | "land" | "gear" | "more";

export function Guide() {
  const docked = useSyncExternalStore(subscribeMobile, isMobile, () => false);
  const [visible, setVisible] = useState(false);
  const [expression, setExpression] = useState<MascotExpression>("idle");
  const [look, setLook] = useState<MascotLook | undefined>(undefined);

  const [gear, setGear] = useState<Gear>(null);

  const mochiRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const traveling = useRef(false);
  const hovering = useRef(false);
  const clicks = useRef<number[]>([]);
  const active = useRef<SeatId | null>(null);
  const speaking = useRef(false);
  const speakToken = useRef(0); // naik setiap ada kalimat baru; membatalkan yang lama
  useStopVoiceWhenMuted();
  const lastPos = useRef<Pos | null>(null);
  const timers = useRef<Partial<Record<TimerKey, number>>>({});

  const clear = useCallback((key: TimerKey) => window.clearTimeout(timers.current[key]), []);

  /* Taruh Mochi di kotak kursi (layar lebar), langsung tanpa animasi.
     Mengembalikan posisinya, atau null di HP (Mochi menempel di pojok). */
  const place = useCallback((id: SeatId) => {
    const el = mochiRef.current;
    if (!el) return null;
    if (isMobile()) {
      el.style.transform = "";
      return null;
    }
    const spot = document.querySelector(`[data-seat-spot="${id}"]`);
    const page = document.getElementById("page");
    if (!spot || !page) return null;
    const s = spot.getBoundingClientRect();
    const p = page.getBoundingClientRect();
    const pos = { x: s.left - p.left + (s.width - SIZE) / 2, y: s.top - p.top + (s.height - SIZE) / 2 };
    el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    return pos;
  }, []);

  /* Pindah ke kursi baru dengan salah satu dari delapan gerakan acak
     (moves.ts): lompat, hantam tanah, skateboard, jetpack, gasing,
     pantul-pantul, teleport, atau payung. Mengembalikan durasinya (ms). */
  const travel = useCallback((from: Pos, to: Pos) => {
    const el = mochiRef.current;
    if (!el) return 0;
    const mv = randomMove(from, to);
    traveling.current = true;
    setGear(mv.gear);
    setExpression(mv.expression);
    el.animate(mv.frames, { duration: mv.duration });
    timers.current.land = window.setTimeout(sfxLand, mv.duration * mv.land);
    // partikel: debu di bawah kaki, percikan di tengah badan
    mv.fx.forEach((f) => {
      const p = f.where === "from" ? from : to;
      const y = f.kind === "dust" ? p.y + SIZE * 0.92 : p.y + SIZE / 2;
      window.setTimeout(() => burst(f.kind, p.x + SIZE / 2, y), mv.duration * f.at);
    });
    timers.current.gear = window.setTimeout(() => {
      setGear(null);
      traveling.current = false;
    }, mv.duration);
    return mv.duration;
  }, []);

  /* Gerakan di tempat pada badan Mochi (tidak mengubah posisinya): animasi
     diam, reaksi klik, dan perpindahan di HP. */
  const act = useCallback((name: string) => {
    const a = ACTS[name];
    actorRef.current?.animate(a.frames, { duration: a.duration, easing: "ease-in-out" });
    return a;
  }, []);

  /* Percikan di sekitar Mochi (misalnya saat pusing diklik berkali-kali). */
  const sparkleHere = useCallback(() => {
    const el = mochiRef.current;
    const page = document.getElementById("page");
    if (!el || !page) return;
    const r = el.getBoundingClientRect();
    const p = page.getBoundingClientRect();
    burst("sparks", r.left - p.left + r.width / 2, r.top - p.top + r.height / 2);
  }, []);

  /* Suasana hati di luar kalimat (diatur efek "curious/sleep" di bawah). */
  const mood = useRef({ curious: false, sleeping: false });

  /* Kembali santai: "curious" jika kursor masih di atas kartu project,
     "sleep" jika pengunjung sedang diam, selain itu "idle". */
  const rest = useCallback(() => {
    if (mood.current.sleeping) {
      setExpression("sleep");
      setLook({ x: 0, y: 0.25 });
    } else if (mood.current.curious) {
      setExpression("curious");
      setLook("cursor");
    } else {
      setExpression("idle");
      setLook(undefined); // kembali melirik sendiri
    }
  }, []);

  /* Kursi yang sedang menunggu kalimat tambahan (scroll mengulang hitungan). */
  const moreFor = useRef<SeatId | null>(null);
  const speakRef = useRef<(id: SeatId, part?: LinePart) => void>(() => {});

  /* Mulai hitungan kalimat tambahan, jika kursi ini punya dan belum
     diucapkan. */
  const armMore = useCallback(
    (id: SeatId) => {
      clear("more");
      const line = getLine(id);
      if (!SCRIPT[id].more || line.part !== 0 || !line.done) {
        moreFor.current = null;
        return;
      }
      moreFor.current = id;
      const fire = () => {
        // tunggu dulu jika Mochi sedang sibuk (bicara, pindah, tidur, disentuh)
        if (active.current !== id) return;
        if (speaking.current || traveling.current || mood.current.sleeping || hovering.current) {
          timers.current.more = window.setTimeout(fire, MORE_MS);
          return;
        }
        moreFor.current = null;
        clear("poke");
        clear("react");
        setExpression("smirk");
        setLook({ x: -0.35, y: 0 });
        const wait = reducedMotion() ? 500 : act("smirk").duration;
        timers.current.more = window.setTimeout(() => {
          if (active.current === id) speakRef.current(id, 1);
        }, wait);
      };
      timers.current.more = window.setTimeout(fire, MORE_MS);
    },
    [clear, act]
  );

  /* Ekspresi reaksi sebentar setelah kalimat selesai, lalu kembali santai.
     Setelah kalimat utama, mulai hitungan kalimat tambahan. */
  const react = useCallback(
    (id: SeatId, part: LinePart) => {
      speaking.current = false;
      setExpression(lineOf(id, part).expression);
      clear("react");
      timers.current.react = window.setTimeout(rest, REACT_MS);
      if (part === 0) armMore(id);
    },
    [clear, rest, armMore]
  );

  /* Ucapkan kalimat kursi kata demi kata (atau diam jika sudah pernah).
     Jika suara aktif, kata-kata dan gerak mulut mengikuti durasi file
     suaranya; jika mati atau gagal dimuat, memakai kecepatan teks biasa. */
  const speak = useCallback(
    (id: SeatId, part: LinePart = 0) => {
      clear("speak");
      clear("react");
      const token = ++speakToken.current;
      const words = wordsOf(id, part);
      const current = getLine(id);
      // kembali ke kursi lama: kalimat utama sudah diucapkan, jadi yang
      // berlaku adalah kalimat terakhir yang tampil di kursi itu
      if (part === 0 && (current.part === 1 || current.done)) {
        rest();
        armMore(id);
        return;
      }
      const start = current.part === part ? current : { part, shown: 0, done: false };
      speaking.current = true;
      setExpression("talk");
      setLook(isMobile() ? LOOK_BUBBLE_DOCKED : LOOK_BUBBLE);

      void playVoice(lineOf(id, part).voice).then((duration) => {
        // Mochi sudah pindah kursi selama menunggu file dimuat
        if (token !== speakToken.current) return;
        const t0 = performance.now();
        const left = () => (duration ? Math.max(0, duration * 1000 - (performance.now() - t0)) : 0);

        if (reducedMotion()) {
          // teks langsung utuh; suara (jika ada) tetap diputar sampai selesai
          setLine(id, { part, shown: words.length, done: true });
          timers.current.speak = window.setTimeout(() => react(id, part), left());
          return;
        }

        const times = duration ? wordTimings(words, duration) : null;
        let shown = start.shown;
        const step = () => {
          shown += 1;
          const done = shown >= words.length;
          setLine(id, { part, shown, done });
          if (done) {
            // tunggu suaranya selesai sebelum berhenti "bicara"
            timers.current.speak = window.setTimeout(() => react(id, part), left());
            return;
          }
          const wait = times
            ? Math.max(0, times[shown] - (performance.now() - t0))
            : /[.,!?]$/.test(words[shown - 1])
              ? PAUSE_MS
              : WORD_MS;
          timers.current.speak = window.setTimeout(step, wait);
        };
        step();
      });
    },
    [clear, react, rest, armMore]
  );
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  /* Pindahkan Mochi ke kursi baru, lalu bicara setelah sampai. */
  const activate = useCallback(
    (id: SeatId) => {
      if (active.current === id) return;
      const prev = active.current;
      clear("arrive");
      clear("speak");
      clear("react");
      clear("more");
      moreFor.current = null;
      // hentikan suara kalimat lama (hanya satu kalimat berbunyi sekaligus)
      speakToken.current++;
      stopVoice();

      // kalimat lama yang terpotong langsung ditampilkan utuh
      if (prev) {
        const line = getLine(prev);
        if (line.shown > 0 && !line.done)
          setLine(prev, { part: line.part, shown: wordsOf(prev, line.part).length, done: true });
      }
      speaking.current = false;
      active.current = id;
      setActiveSeat(id); // balon teks di kursi lama hilang, di kursi baru boleh tampil

      // kemunculan pertama langsung di kursi; selanjutnya melompat
      const first = prev === null;
      const from = lastPos.current;
      const to = place(id);
      lastPos.current = to;
      setVisible(true);

      visibleRef.current = true;

      const moves = !first && !reducedMotion();
      let wait = first ? 450 : 150;
      if (moves && from && to) {
        setLook({ x: 0, y: to.y > from.y ? 0.8 : -0.8 }); // menoleh ke arah tujuan
        wait = travel(from, to);
      } else if (moves && isMobile()) {
        // di HP Mochi tetap di pojok; gerakan kecil acak tanda pindah section
        wait = act(pick(["bounce", "spin", "squish", "wiggle"])).duration;
      }
      timers.current.arrive = window.setTimeout(() => speak(id), wait);
    },
    [clear, place, speak, travel, act]
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
      stopVoice();
    };
  }, [activate, clear]);

  // Isi halaman berubah tinggi (misalnya filter project, gambar dimuat, ukuran
  // layar berubah): pindahkan Mochi supaya tetap di kursinya.
  useEffect(() => {
    const page = document.getElementById("page");
    if (!page) return;
    const ro = new ResizeObserver(() => {
      if (active.current) lastPos.current = place(active.current);
    });
    ro.observe(page);
    return () => ro.disconnect();
  }, [place]);

  // Suasana hati di luar kalimat:
  //   - "curious" (dan mengikuti kursor) saat kursor di atas elemen bertanda
  //     data-mochi-curious, misalnya kartu project;
  //   - "sleep" setelah pengunjung diam IDLE_MS; bangun dengan senyum saat
  //     ada gerakan lagi.
  // Keduanya tidak mengganggu Mochi yang sedang bicara.
  useEffect(() => {
    const IDLE_MS = 30000;
    const m = mood.current;
    let idleTimer = 0;

    // Ganti ke suasana hati baru sekarang juga (memotong ekspresi reaksi),
    // kecuali Mochi sedang bicara: nanti dipakai saat kalimatnya selesai.
    const applyNow = () => {
      if (speaking.current) return;
      clear("react");
      clear("poke");
      rest();
    };
    const arm = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (speaking.current) return arm();
        m.sleeping = true;
        applyNow();
      }, IDLE_MS);
    };
    const activity = () => {
      if (m.sleeping) {
        m.sleeping = false;
        if (!speaking.current) {
          // bangun dengan senyum, lalu kembali santai
          clear("react");
          setExpression("happy");
          setLook({ x: 0, y: 0 });
          clear("poke");
          timers.current.poke = window.setTimeout(() => {
            if (!speaking.current) rest();
          }, 900);
        }
      }
      arm();
    };
    const cardOf = (t: EventTarget | null) =>
      t instanceof Element ? t.closest("[data-mochi-curious]") : null;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || m.curious || !cardOf(e.target)) return;
      m.curious = true;
      if (!m.sleeping) applyNow();
    };
    const out = (e: PointerEvent) => {
      const from = cardOf(e.target);
      if (!m.curious || !from || from === cardOf(e.relatedTarget)) return;
      m.curious = false;
      if (!m.sleeping) applyNow();
    };

    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((ev) => window.addEventListener(ev, activity, { passive: true }));
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    arm();
    return () => {
      window.clearTimeout(idleTimer);
      events.forEach((ev) => window.removeEventListener(ev, activity));
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
    };
  }, [clear, rest]);

  // Scroll mengulang hitungan kalimat tambahan: kalimat itu hanya untuk
  // pengunjung yang diam di satu section.
  useEffect(() => {
    const onScroll = () => {
      if (moreFor.current) armMore(moreFor.current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [armMore]);

  // Berpindah antara mode HP (menempel di pojok) dan layar lebar.
  useEffect(() => {
    if (active.current) lastPos.current = place(active.current);
  }, [docked, place]);

  // Animasi diam acak: sesekali Mochi memantul, berputar, bergoyang, penyet,
  // atau mengintip, selama ia sedang tidak bicara, berpindah, tidur, atau
  // disentuh kursor.
  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => {
      const m = mood.current;
      if (!visibleRef.current || speaking.current || traveling.current || m.sleeping || hovering.current) return;
      if (document.hidden || Math.random() < 0.35) return;
      const a = act(pick(IDLE_ACTS));
      if (a.expression) {
        clear("poke");
        setExpression(a.expression);
        timers.current.poke = window.setTimeout(() => {
          if (!speaking.current) rest();
        }, a.duration + 300);
      }
    }, 6500);
    return () => window.clearInterval(id);
  }, [act, clear, rest]);

  /* Diklik: reaksi acak (berputar, penyet, memantul, salto, bergoyang) dengan
     bunyi "boing". Diklik 5 kali dalam 2,5 detik: Mochi pusing berputar-putar. */
  const poke = () => {
    sfxBoing();
    const now = performance.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 2500), now];
    const dizzy = clicks.current.length >= 5;
    if (dizzy) clicks.current = [];
    const a = reducedMotion() ? ACTS.squish : act(dizzy ? "dizzy" : pick(CLICK_ACTS));
    if (dizzy) window.setTimeout(sparkleHere, a.duration * 0.7);
    if (speaking.current) return; // wajah bicara tetap, hanya badannya bereaksi
    clear("poke");
    setExpression(a.expression ?? pick<MascotExpression>(["happy", "smug"]));
    timers.current.poke = window.setTimeout(() => {
      if (!speaking.current) rest();
    }, a.duration + 400);
  };

  /* Kursor di atas Mochi: Mochi menatap kursor. */
  const hoverIn = () => {
    hovering.current = true;
    if (!speaking.current && !mood.current.sleeping) setLook("cursor");
  };
  const hoverOut = () => {
    hovering.current = false;
    if (!speaking.current && !traveling.current) rest();
  };

  return (
    <div
      ref={mochiRef}
      aria-hidden={!visible}
      className={`guide-mochi z-30 ${docked ? "fixed bottom-4 right-4" : "absolute left-0 top-0"} ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* badan Mochi untuk animasi di tempat (diam, klik), terpisah dari
          pembungkus luar yang menyimpan posisi di halaman */}
      <div ref={actorRef} className="relative">
        <GuideGear gear={gear} />
        <button
          type="button"
          onClick={poke}
          onPointerEnter={hoverIn}
          onPointerLeave={hoverOut}
          tabIndex={visible ? 0 : -1}
          aria-label="Mochi, the site's guide. Click to say hi."
          className={`relative block rounded-full ${FOCUS}`}
        >
          {/* Mochi (dan shader WebGL-nya) baru dibuat saat pertama kali muncul,
              supaya tidak membebani saat halaman dibuka */}
          {visible ? (
            <Mascot expression={expression} look={look} size={docked ? DOCK_SIZE : SIZE} />
          ) : (
            <span className="block" style={{ width: docked ? DOCK_SIZE : SIZE, height: docked ? DOCK_SIZE : SIZE }} />
          )}
        </button>
      </div>
    </div>
  );
}
