"""
Bunyi "startup" saat kotak logam di intro menghilang: beberapa nada piano
ditekan bersamaan, dengan gema ruangan. Disintesis langsung (tanpa sampel
rekaman), terinspirasi bunyi startup komputer klasik.

Pemakaian (dari folder proyek):
    scripts/voice/.venv/Scripts/python scripts/voice/chime.py --samples <folder>
        -> membuat beberapa contoh (A, B, C, ...) di <folder>
    scripts/voice/.venv/Scripts/python scripts/voice/chime.py <nama-contoh>
        -> membuat public/sfx/chime.mp3 dari contoh terpilih
"""

import argparse
import pathlib

import numpy as np
import soundfile as sf

RATE = 44100
ROOT = pathlib.Path(__file__).resolve().parents[2]
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name: str) -> float:
    """'F#3' -> frekuensi (A4 = 440 Hz)."""
    pitch, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + NOTE[pitch]
    return 440.0 * 2 ** ((midi - 69) / 12)


def piano(f: float, dur: float, vel: float = 1.0, bright: float = 1.0, felt: float = 0.0) -> np.ndarray:
    """Satu nada piano sintetis: harmonik yang sedikit tidak selaras (seperti
    senar sungguhan), dua senar yang sedikit berbeda nada (berdenyut halus),
    harmonik tinggi meluruh lebih cepat, dan ketukan palu di awal."""
    t = np.arange(int(dur * RATE)) / RATE
    out = np.zeros_like(t)
    B = 0.00035  # ketidakselarasan senar
    for n in range(1, 16):
        fn = f * n * np.sqrt(1 + B * n * n)
        if fn > 16000:
            break
        amp = (1 / n ** (1.25 + felt)) * (bright ** (n - 1) if n > 1 else 1)
        # dua tahap peluruhan: cepat di awal, lalu dengung panjang
        fast = np.exp(-t * (2.2 + 0.9 * n))
        slow = np.exp(-t * (0.35 + 0.12 * n + f / 2200))
        env = 0.55 * fast + 0.45 * slow
        for detune in (-0.7, 0.7):  # dua senar, selisih ±0.7 cent
            out += amp * env * np.sin(2 * np.pi * fn * 2 ** (detune / 1200) * t + n)
    attack = np.minimum(1, t / (0.004 + 0.01 * felt))
    out *= attack
    # ketukan palu: derau pendek
    rng = np.random.default_rng(int(f))
    hammer = rng.normal(0, 1, len(t)) * np.exp(-t * 300) * 0.05 * (1 - felt)
    return (out + hammer) * vel


def reverb(x: np.ndarray, seconds: float = 2.2, wet: float = 0.35) -> np.ndarray:
    """Gema ruangan sederhana: konvolusi dengan derau yang meluruh."""
    n = int(seconds * RATE)
    rng = np.random.default_rng(1)
    t = np.arange(n) / RATE
    ir = rng.normal(0, 1, n) * np.exp(-t * 3.2)
    ir[: int(0.012 * RATE)] = 0  # jeda pantulan pertama
    # buramkan sedikit supaya gema lebih lembut (filter rata-rata)
    k = 24
    ir = np.convolve(ir, np.ones(k) / k, mode="same")
    ir /= np.sqrt(np.sum(ir ** 2))
    size = len(x) + n
    fft = 1 << (size - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, fft) * np.fft.rfft(ir, fft), fft)[: size]
    dry = np.pad(x, (0, n))
    return dry * (1 - wet) + y * wet * 0.9


def chord(notes, dur=4.2, roll=0.0, bright=0.82, felt=0.0, pad=0.0, room=0.35, octave_up_shimmer=False):
    total = np.zeros(int((dur + roll * len(notes)) * RATE))
    for i, name in enumerate(notes):
        f = hz(name)
        vel = 0.75 + 0.25 * (1 - i / max(1, len(notes) - 1))  # nada bawah sedikit lebih keras
        start = int(i * roll * RATE)
        tone = piano(f, dur, vel, bright, felt)
        total[start : start + len(tone)] += tone
        if pad:
            # lapisan "pad" lembut yang naik pelan di belakang piano
            t = np.arange(len(tone)) / RATE
            swell = np.minimum(1, t / 0.6) * np.exp(-t * 0.6)
            total[start : start + len(tone)] += pad * swell * np.sin(2 * np.pi * f * t) * vel
        if octave_up_shimmer:
            t = np.arange(len(tone)) / RATE
            sh = np.minimum(1, t / 0.25) * np.exp(-t * 1.1) * 0.08
            total[start : start + len(tone)] += sh * np.sin(2 * np.pi * 2 * f * t + 0.3 * np.sin(2 * np.pi * 5 * t))
    y = reverb(total, wet=room)
    # potong ekor sunyi dan pudarkan akhirnya
    y = y[: int((dur + 1.0) * RATE)]
    fade = int(0.8 * RATE)
    y[-fade:] *= np.linspace(1, 0, fade) ** 2
    return y / np.max(np.abs(y)) * 0.89


SAMPLES = {
    # nama: (deskripsi, argumen chord)
    "A-classic": ("F# major, all notes at once, warm and full",
                  dict(notes=["F#2", "C#3", "F#3", "A#3", "C#4", "F#4"], bright=0.8)),
    "B-bright": ("C major add9, brighter and lighter",
                 dict(notes=["C3", "G3", "C4", "E4", "G4", "D5"], bright=0.88)),
    "C-rolled": ("Db major 7, notes rolled quickly like a strum",
                 dict(notes=["Db2", "Ab2", "F3", "C4", "Eb4", "Ab4"], roll=0.035, bright=0.84)),
    "D-felt": ("Bb major on a soft felt piano, darker and gentle",
               dict(notes=["Bb1", "F2", "Bb2", "D3", "F3", "Bb3"], bright=0.72, felt=0.35, room=0.42)),
    "E-airy": ("E major add9 with a soft shimmer, more dreamy",
               dict(notes=["E2", "B2", "E3", "G#3", "B3", "F#4"], bright=0.8, pad=0.12, octave_up_shimmer=True, room=0.45)),
}


def fix_flats(notes):
    flats = {"Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"}
    return [flats.get(n[:-1], n[:-1]) + n[-1] for n in notes]


def render(name: str, path: pathlib.Path):
    args = dict(SAMPLES[name][1])
    args["notes"] = fix_flats(args["notes"])
    y = chord(**args)
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(path, y.astype(np.float32), RATE, format="MP3")
    print(f"{path.name:18} {len(y) / RATE:.1f} s  {SAMPLES[name][0]}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("name", nargs="?", help="contoh yang dipakai untuk public/sfx/chime.mp3")
    p.add_argument("--samples", metavar="FOLDER", help="buat semua contoh di folder ini")
    a = p.parse_args()
    if a.samples:
        for name in SAMPLES:
            render(name, pathlib.Path(a.samples) / f"chime-{name}.mp3")
    elif a.name:
        render(a.name, ROOT / "public" / "sfx" / "chime.mp3")
    else:
        p.print_help()


if __name__ == "__main__":
    main()
