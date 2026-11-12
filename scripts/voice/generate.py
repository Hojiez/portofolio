"""
Pembuat suara Mochi dengan Kokoro-82M (lisensi Apache 2.0), lewat kokoro-onnx.

Teks diambil dari content/script.ts, jadi suara selalu sama dengan kalimat di
situs. Jalankan ulang skrip ini setiap kali naskah Mochi diubah.

Persiapan (sekali saja), dari folder proyek:
    py -3.13 -m venv scripts/voice/.venv
    scripts/voice/.venv/Scripts/python -m pip install kokoro-onnx==0.6.1 soundfile
    lalu unduh kokoro-v1.0.onnx dan voices-v1.0.bin dari
    https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
    ke scripts/voice/models/

Pemakaian:
    scripts/voice/.venv/Scripts/python scripts/voice/generate.py
        -> membuat public/voice/<kursi>.mp3 untuk semua kursi
    scripts/voice/.venv/Scripts/python scripts/voice/generate.py --samples
        -> membuat beberapa contoh kalimat hero di scripts/voice/samples/
"""

import argparse
import json
import pathlib
import re
import subprocess
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from effects import babble  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = ROOT / "scripts" / "voice"

# Jenis suara Mochi untuk file final:
#   "babble" — bahasa "Mochi": celoteh blip tanpa kata (dipilih, contoh 7)
#   "tts"    — kalimat diucapkan Kokoro dengan suara VOICE (dipakai sebelumnya)
MODE = "babble"
BABBLE_HZ = 520.0  # nada dasar celoteh; lebih kecil = lebih rendah (contoh 8: 330)

# Suara dan kecepatan untuk MODE = "tts".
VOICE = "af_heart"
SPEED = 1.0

# Ejaan khusus untuk TTS saja (teks di situs tidak berubah), karena nama-nama
# ini dibaca salah oleh Kokoro:
#   Rauh   -> dibaca "Ra'uh" (kata pemiliknya); tanpa ini dibaca "raw" (ɹˈɔː),
#             dengan ini jadi "ra-uh" (ɹˈɑːˈʌ)
#   Hessed -> tanpa ini dibaca "hest"     (hˈɛst)   ; jadi "he-set" (hˈɛsɛt)
#   Mochi  -> tanpa ini dibaca "ma-chai"  (mˈɑːtʃaɪ); jadi "mo-chi" (mˈoʊtʃiː)
PRONOUNCE: dict[str, str] = {
    "Rauh": "Rah-uh",
    "Hessed": "Hesset",
    "Mochi": "Mohchee",
}

# Variasi untuk --samples: (nama file, suara, kecepatan)
SAMPLES = [
    ("A-af_heart-1.00", "af_heart", 1.0),
    ("B-af_heart-1.12", "af_heart", 1.12),
    ("C-af_bella-1.10", "af_bella", 1.1),
]


def load_lines() -> dict:
    out = subprocess.check_output(["node", str(HERE / "export-lines.mjs")], cwd=ROOT, text=True, encoding="utf-8")
    return json.loads(out)


def spoken(text: str) -> str:
    for word, sound in PRONOUNCE.items():
        text = re.sub(rf"\b{re.escape(word)}\b", sound, text)
    return text


def render(kokoro: Kokoro, text: str, voice: str, speed: float, path: pathlib.Path) -> float:
    samples, rate = kokoro.create(spoken(text), voice=voice, speed=speed, lang="en-us")
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(path, samples, rate, format="MP3")
    return len(samples) / rate


def main() -> None:
    parser = argparse.ArgumentParser(description="Buat file suara Mochi.")
    parser.add_argument("--samples", action="store_true", help="buat contoh kalimat hero saja")
    args = parser.parse_args()

    lines = load_lines()
    kokoro = Kokoro(str(HERE / "models" / "kokoro-v1.0.onnx"), str(HERE / "models" / "voices-v1.0.bin"))

    if args.samples:
        for name, voice, speed in SAMPLES:
            path = HERE / "samples" / f"{name}.mp3"
            secs = render(kokoro, lines["hero"]["text"], voice, speed, path)
            print(f"{path.relative_to(ROOT)}  {secs:.1f} s")
        return

    # kalimat utama tiap kursi, ditambah kalimat tambahannya ("more") jika ada
    todo = []
    for seat, line in lines.items():
        todo.append((seat, line))
        if line.get("more"):
            todo.append((f"{seat}+", line["more"]))

    for seat, line in todo:
        # line["voice"] berbentuk "/voice/hero.mp3" -> public/voice/hero.mp3
        path = ROOT / "public" / line["voice"].lstrip("/")
        if MODE == "babble":
            samples, rate = babble(line["text"], base_hz=BABBLE_HZ)
            path.parent.mkdir(parents=True, exist_ok=True)
            sf.write(path, samples, rate, format="MP3")
            secs = len(samples) / rate
        else:
            secs = render(kokoro, line["text"], VOICE, SPEED, path)
        print(f"{seat:9} {secs:4.1f} s  {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
