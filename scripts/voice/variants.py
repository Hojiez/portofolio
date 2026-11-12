"""
Contoh variasi suara Mochi untuk dipilih (kalimat hero), hasil di
scripts/voice/samples/v2/.

    scripts/voice/.venv/Scripts/python scripts/voice/variants.py
"""

import pathlib
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from effects import babble, metallic, normalize, pitch_up  # noqa: E402
from generate import HERE, ROOT, load_lines, spoken  # noqa: E402

OUT = HERE / "samples" / "v2"
OUT.mkdir(parents=True, exist_ok=True)

text = load_lines()["hero"]["text"]
kokoro = Kokoro(str(HERE / "models" / "kokoro-v1.0.onnx"), str(HERE / "models" / "voices-v1.0.bin"))


def say(voice: str, speed: float = 1.0):
    return kokoro.create(spoken(text), voice=voice, speed=speed, lang="en-us")


variants = {
    # 1. suara Kokoro lain
    "1-bella": lambda: say("af_bella"),
    "2-nicole": lambda: say("af_nicole"),
    "3-emma-british": lambda: say("bf_emma"),
    "4-puck-male": lambda: say("am_puck"),
    # 2. af_heart diolah
    "5-heart-cute-higher": lambda: pitch_up(lambda s: say("af_heart", s), 1.25),
    "6-heart-metal-blob": lambda: (lambda sr: (metallic(sr[0], sr[1]), sr[1]))(pitch_up(lambda s: say("af_heart", s), 1.18)),
    # 3. bahasa "Mochi" (celoteh, tanpa kata)
    "7-mochi-babble": lambda: babble(text),
    "8-mochi-babble-low": lambda: babble(text, base_hz=330.0),
}

for name, make in variants.items():
    samples, rate = make()
    path = OUT / f"{name}.mp3"
    sf.write(path, normalize(samples), rate, format="MP3")
    print(f"{path.relative_to(ROOT)}  {len(samples) / rate:.1f} s")
