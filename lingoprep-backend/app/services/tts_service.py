"""
LingoPrep API — Text-to-Speech (TTS) Service
Generates authentic regional accent audio for IELTS (British English) and TOEFL (American English).
Utilizes Edge-TTS Neural speech synthesis with multi-speaker dialogue support and local caching.

── How playback stays instant ───────────────────────────────────────────────
Synthesising one section takes 20–60 seconds, so it must never happen while a
candidate is waiting on the play button:

  1. Recordings are cached as `<audio_id>-<fingerprint>.mp3`, where the
     fingerprint is a hash of the transcript and accent. The files for the
     seeded tests are committed in static/audio/ (run
     `python scripts/pregenerate_audio.py` after changing a transcript), so a
     fresh deploy serves them straight from disk.
  2. If a transcript has no file yet, `prewarm()` starts generating it in the
     background the moment the test list is requested, long before play.
  3. Generation runs the lines in parallel, is de-duplicated per recording,
     and writes atomically, so a half-written file is never served.
"""

import asyncio
import hashlib
import os
import re
from pathlib import Path

import edge_tts

# Audio cache directory
AUDIO_CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "audio"
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Bump to invalidate every cached recording (e.g. after changing voices).
_AUDIO_VERSION = "v2"

# ── Silence ──────────────────────────────────────────────────────────────
# The IELTS recording pauses so the candidate can read the next questions
# ("[pause 20]" in a transcript). Edge-TTS cannot produce silence, so these
# gaps are empty MPEG-2 Layer III frames in the format Edge-TTS returns
# (24 kHz, 48 kbps, mono): a 144-byte frame is 24 ms of silence.
_SILENT_FRAME = bytes([0xFF, 0xF3, 0x64, 0xC4]) + bytes(140)
_FRAME_SECONDS = 0.024


def silence(seconds: float) -> bytes:
    return _SILENT_FRAME * max(0, int(round(seconds / _FRAME_SECONDS)))

# Simultaneous requests to the speech service across the whole process.
_MAX_PARALLEL_LINES = 5

# Accent voice definitions. A transcript names each speaker's voice gender
# ("Student (f): …"); the voices for that gender are rotated per recording,
# so two recordings with the same roles do not sound identical.
# IELTS recordings mix British, Australian and North American voices, as the
# real test does; TOEFL (ETS 2026) likewise balances US, UK and Australian.
VOICE_MAP = {
    "ielts": {
        "female": ["en-GB-SoniaNeural", "en-AU-NatashaNeural", "en-GB-LibbyNeural", "en-US-JennyNeural"],
        "male": ["en-GB-RyanNeural", "en-GB-ThomasNeural", "en-AU-WilliamNeural", "en-US-GuyNeural"],
        "narrator": "en-GB-LibbyNeural",
        "accent_name": "British English (UK RP)",
        "accent_code": "en-GB"
    },
    "toefl": {
        "female": ["en-US-JennyNeural", "en-US-AriaNeural", "en-AU-NatashaNeural", "en-GB-SoniaNeural"],
        "male": ["en-US-GuyNeural", "en-US-ChristopherNeural", "en-GB-RyanNeural", "en-AU-WilliamNeural"],
        "narrator": "en-US-AriaNeural",
        "accent_name": "North American English (US)",
        "accent_code": "en-US"
    }
}

# A line of the transcript: "Name (f): words" / "Name (m): words" / "Name: words".
_SPEAKER_LINE = re.compile(r"^([A-Za-z0-9\s\.\-,']+?)\s*(?:\((m|f)\))?:\s*(.*)$")
_PAUSE_LINE = re.compile(r"^\[pause\s+(\d+(?:\.\d+)?)\]$", re.IGNORECASE)

# audio_id -> cache key, filled whenever a transcript is seen (test list,
# stream request), so the stream endpoint can usually skip the database.
_known_keys: dict[str, str] = {}
# audio_id key -> the task generating it, so concurrent requests share one.
_inflight: dict[str, asyncio.Task] = {}
_background: set[asyncio.Task] = set()
_line_semaphore: asyncio.Semaphore | None = None


def _exam_key(exam_type: str | None) -> str:
    return "toefl" if (exam_type or "").lower() == "toefl" else "ielts"


def audio_key(audio_id: str, transcript: str, exam_type: str = "ielts") -> str:
    """Cache key for a recording: changes whenever its transcript or accent does."""
    digest = hashlib.sha1(
        f"{_AUDIO_VERSION}|{_exam_key(exam_type)}|{transcript}".encode("utf-8")
    ).hexdigest()[:10]
    return f"{audio_id}-{digest}"


def register(audio_id: str, transcript: str, exam_type: str = "ielts") -> str:
    """Remember the current cache key for a recording and return it."""
    key = audio_key(audio_id, transcript, exam_type)
    _known_keys[audio_id] = key
    return key


def known_cached_path(audio_id: str) -> Path | None:
    """The cached file for a recording we have already seen, if it exists."""
    key = _known_keys.get(audio_id)
    if not key:
        return None
    path = AUDIO_CACHE_DIR / f"{key}.mp3"
    return path if path.exists() and path.stat().st_size > 0 else None


def committed_path(audio_id: str) -> Path | None:
    """The newest file for this recording in the cache directory, whatever
    its fingerprint (the pregenerate script keeps exactly one per recording)."""
    files = sorted(AUDIO_CACHE_DIR.glob(f"{audio_id}-*.mp3"), key=lambda p: p.stat().st_mtime)
    files = [p for p in files if p.stat().st_size > 0]
    return files[-1] if files else None


def get_audio_file_path(audio_id: str, transcript: str = "", exam_type: str = "ielts") -> Path:
    """Path of the cached audio file for this recording's current transcript."""
    return AUDIO_CACHE_DIR / f"{audio_key(audio_id, transcript, exam_type)}.mp3"


def is_audio_cached(audio_id: str, transcript: str = "", exam_type: str = "ielts") -> bool:
    """Check if the audio file has already been generated and cached."""
    p = get_audio_file_path(audio_id, transcript, exam_type)
    return p.exists() and p.stat().st_size > 0


def get_accent_info(exam_type: str = "ielts") -> dict:
    """Get metadata about the accent used for this exam type."""
    cfg = VOICE_MAP[_exam_key(exam_type)]
    return {
        "accent_name": cfg["accent_name"],
        "accent_code": cfg["accent_code"],
        "voices": cfg["female"] + cfg["male"],
    }


def _segments(transcript: str, exam_type: str, seed: str = "") -> list[tuple[str, str] | float]:
    """Split a transcript into (voice, text) lines and pauses (seconds).

    Dialogue speakers ("Tom (m): …") each get their own voice of the stated
    gender; a line with no speaker is the announcer. `seed` (the recording
    id) decides where in the voice list the rotation starts."""
    voice_config = VOICE_MAP[_exam_key(exam_type)]
    offset = int(hashlib.sha1(seed.encode("utf-8")).hexdigest(), 16) if seed else 0
    used = {"f": 0, "m": 0}

    segments: list[tuple[str, str] | float] = []
    assigned: dict[str, str] = {}

    for raw in transcript.split("\n"):
        line = raw.strip()
        if not line:
            continue
        pause = _PAUSE_LINE.match(line)
        if pause:
            segments.append(float(pause.group(1)))
            continue
        match = _SPEAKER_LINE.match(line)
        if match:
            speaker, gender, text = match.group(1).strip(), match.group(2), match.group(3).strip()
            if speaker not in assigned:
                g = gender or ("f" if (offset + len(assigned)) % 2 else "m")
                pool = voice_config["female" if g == "f" else "male"]
                assigned[speaker] = pool[(offset + used[g]) % len(pool)]
                used[g] += 1
            if text:
                segments.append((assigned[speaker], text))
        else:
            segments.append((voice_config["narrator"], line))
    return segments


def display_transcript(transcript: str) -> str:
    """The transcript as shown to the candidate afterwards: no pause
    markers and no voice-gender tags."""
    out = []
    for raw in transcript.split("\n"):
        line = raw.strip()
        if not line or _PAUSE_LINE.match(line):
            continue
        m = _SPEAKER_LINE.match(line)
        out.append(f"{m.group(1).strip()}: {m.group(3).strip()}" if m else line)
    return "\n".join(out)


async def _synthesize_line(voice: str, text: str) -> bytes:
    """One line of speech as MP3 bytes, with a couple of retries."""
    global _line_semaphore
    if _line_semaphore is None:
        _line_semaphore = asyncio.Semaphore(_MAX_PARALLEL_LINES)

    async with _line_semaphore:
        last_error: Exception | None = None
        for attempt in range(3):
            try:
                audio = bytearray()
                async for chunk in edge_tts.Communicate(text, voice).stream():
                    if chunk["type"] == "audio":
                        audio.extend(chunk["data"])
                if audio:
                    return bytes(audio)
                last_error = RuntimeError("speech service returned no audio")
            except Exception as e:  # network hiccup or throttling
                last_error = e
            await asyncio.sleep(0.6 * (attempt + 1))
        raise RuntimeError(f"Could not synthesise line: {last_error}")


async def synthesize_transcript(transcript: str, exam_type: str = "ielts", output_path: Path | None = None, seed: str = "") -> bytes:
    """
    Synthesize transcript text into authentic accented audio.
    Lines are synthesised in parallel and joined in order; pauses become
    silent frames.
    """
    segments = _segments(transcript, exam_type, seed)
    spoken = [s for s in segments if isinstance(s, tuple)]
    parts = iter(await asyncio.gather(*(_synthesize_line(voice, text) for voice, text in spoken)))
    audio_bytes = b"".join(silence(s) if isinstance(s, float) else next(parts) for s in segments)

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        # Write to a temp file and rename, so a request arriving mid-write can
        # never be served a truncated recording.
        tmp_path = output_path.with_name(output_path.name + ".part")
        with open(tmp_path, "wb") as f:
            f.write(audio_bytes)
        os.replace(tmp_path, output_path)

    return audio_bytes


async def get_or_generate_audio(audio_id: str, transcript: str, exam_type: str = "ielts") -> Path:
    """
    Returns the path to the cached MP3 file.
    If not cached, synthesizes and caches it (once, however many callers wait).
    """
    if not transcript:
        raise ValueError(f"No transcript provided to generate audio for {audio_id}")

    key = register(audio_id, transcript, exam_type)
    cached_path = AUDIO_CACHE_DIR / f"{key}.mp3"
    if cached_path.exists() and cached_path.stat().st_size > 0:
        return cached_path

    task = _inflight.get(key)
    if task is None:
        task = asyncio.create_task(synthesize_transcript(transcript, exam_type, cached_path, seed=audio_id))
        _inflight[key] = task
        task.add_done_callback(lambda _t, k=key: _inflight.pop(k, None))

    # shield: one listener disconnecting must not cancel it for the others.
    await asyncio.shield(task)
    return cached_path


async def _prewarm_run(items: list[tuple[str, str, str]]) -> None:
    for audio_id, transcript, exam_type in items:
        try:
            await get_or_generate_audio(audio_id, transcript, exam_type)
        except Exception as e:
            print(f"Audio prewarm failed for {audio_id}: {e}")


async def prewarm(items: list[tuple[str, str, str]]) -> None:
    """Start generating any missing recordings in the background, in order
    (section 1 first). Returns immediately."""
    missing = [
        (audio_id, transcript, exam_type)
        for audio_id, transcript, exam_type in items
        if transcript and not is_audio_cached(audio_id, transcript, exam_type)
    ]
    if not missing:
        return
    task = asyncio.create_task(_prewarm_run(missing))
    _background.add(task)
    task.add_done_callback(_background.discard)
