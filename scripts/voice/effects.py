"""
Efek dan suara alternatif untuk Mochi (dipakai generate.py dan variants.py).
Hanya memakai numpy, yang sudah terpasang bersama kokoro-onnx.
"""

import numpy as np


def pitch_up(render, factor: float):
    """Naikkan nada tanpa mengubah tempo.

    Trik: minta Kokoro bicara lebih lambat (speed / factor), lalu percepat
    rekamannya `factor` kali. Mempercepat rekaman menaikkan nada sekaligus
    memendekkan durasi, sehingga tempo kembali normal tapi nadanya naik.
    `render(speed)` harus mengembalikan (samples, rate).
    """
    samples, rate = render(1.0 / factor)
    n = int(len(samples) / factor)
    x_old = np.arange(len(samples))
    x_new = np.linspace(0, len(samples) - 1, n)
    return np.interp(x_new, x_old, samples).astype(np.float32), rate


def metallic(samples: np.ndarray, rate: int, delay_ms: float = 4.5, feedback: float = 0.55, mix: float = 0.45):
    """Dengung logam: filter sisir (gema sangat pendek berulang) yang memberi
    resonansi seperti suara di dalam tabung logam."""
    d = max(1, int(rate * delay_ms / 1000))
    out = samples.astype(np.float32).copy()
    for i in range(d, len(out)):
        out[i] += feedback * out[i - d]
    out = (1 - mix) * samples + mix * out / (np.max(np.abs(out)) + 1e-9) * np.max(np.abs(samples))
    return normalize(out)


def normalize(samples: np.ndarray, peak: float = 0.9):
    return (samples / (np.max(np.abs(samples)) + 1e-9) * peak).astype(np.float32)


def babble(text: str, rate: int = 24000, base_hz: float = 520.0, seed: int = 7, unit: float = 0.036):
    """Bahasa "Mochi": celoteh blip pendek, satu blip per suku kata kasar.

    Nada tiap blip ditentukan dari hurufnya (jadi kalimat yang sama selalu
    berbunyi sama) dan naik di akhir pertanyaan/seruan. Bunyinya gabungan nada
    dasar + harmonik dengan sedikit "boing" supaya terdengar kenyal.

    Waktu tiap kata sebanding dengan bobotnya: (panjang kata + 1), ditambah 4
    jika diakhiri tanda baca (dipakai sebagai jeda). Ini rumus yang sama
    dengan wordTimings() di components/guide/useVoice.ts, jadi kata di layar
    muncul pas dengan blip-nya.
    """
    rng = np.random.default_rng(seed)
    out: list[np.ndarray] = []
    vowels = set("aeiouy")

    for word in text.split():
        core = "".join(ch for ch in word.lower() if ch.isalpha())
        punct = word[-1:] in ".,!?"
        speak = (len(word) + 1) * unit  # bagian yang berbunyi
        pause = 4 * unit if punct else 0.0  # jeda setelah tanda baca
        # satu blip per kelompok vokal (perkiraan jumlah suku kata), minimal satu
        syllables = max(1, sum(1 for i, ch in enumerate(core) if ch in vowels and (i == 0 or core[i - 1] not in vowels)))
        per = speak / syllables
        for s in range(syllables):
            ch = core[min(s * 2, len(core) - 1)] if core else "a"
            semitone = (ord(ch) - ord("a")) % 12 - 4  # -4..+7 semitone
            f = base_hz * 2 ** (semitone / 12) * (1 + rng.uniform(-0.03, 0.03))
            if s == syllables - 1 and word[-1:] in "?!":
                f *= 1.25
            n = int(rate * per)
            t = np.arange(int(n * 0.8)) / rate  # 80% berbunyi, 20% jeda kecil
            sweep = f * (1 + 0.18 * np.exp(-t * 40))  # "boing" kecil di awal
            phase = 2 * np.pi * np.cumsum(sweep) / rate
            tone = np.sin(phase) + 0.35 * np.sin(2 * phase) + 0.15 * np.sin(3 * phase)
            env = np.minimum(1, t / 0.006) * np.exp(-t * 18)
            out.append((tone * env).astype(np.float32))
            out.append(np.zeros(n - len(t), dtype=np.float32))
        out.append(np.zeros(int(rate * pause), dtype=np.float32))

    return normalize(np.concatenate(out), 0.7), rate
