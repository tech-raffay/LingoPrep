"""
LingoPrep API — Text-to-Speech (TTS) Service
Generates authentic regional accent audio for IELTS (British English) and TOEFL (American English).
Utilizes Edge-TTS Neural speech synthesis with multi-speaker dialogue support and local caching.
"""

import os
import re
import asyncio
from pathlib import Path
import edge_tts

# Audio cache directory
AUDIO_CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "audio"
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Accent voice definitions
VOICE_MAP = {
    "ielts": {
        "female": "en-GB-SoniaNeural",
        "male": "en-GB-RyanNeural",
        "narrator": "en-GB-LibbyNeural",
        "academic": "en-GB-ThomasNeural",
        "voices": ["en-GB-SoniaNeural", "en-GB-RyanNeural", "en-GB-LibbyNeural", "en-GB-ThomasNeural"],
        "accent_name": "British English (UK RP)",
        "accent_code": "en-GB"
    },
    "toefl": {
        "female": "en-US-JennyNeural",
        "male": "en-US-GuyNeural",
        "narrator": "en-US-AriaNeural",
        "academic": "en-US-ChristopherNeural",
        "voices": ["en-US-JennyNeural", "en-US-GuyNeural", "en-US-AriaNeural", "en-US-ChristopherNeural"],
        "accent_name": "North American English (US)",
        "accent_code": "en-US"
    }
}


def get_audio_file_path(audio_id: str) -> Path:
    """Get the path to a cached audio file for a given audio ID."""
    return AUDIO_CACHE_DIR / f"{audio_id}.mp3"


def is_audio_cached(audio_id: str) -> bool:
    """Check if the audio file has already been generated and cached."""
    p = get_audio_file_path(audio_id)
    return p.exists() and p.stat().st_size > 0


def get_accent_info(exam_type: str = "ielts") -> dict:
    """Get metadata about the accent used for this exam type."""
    key = "toefl" if (exam_type or "").lower() == "toefl" else "ielts"
    cfg = VOICE_MAP[key]
    return {
        "accent_name": cfg["accent_name"],
        "accent_code": cfg["accent_code"],
        "voices": cfg["voices"]
    }


async def synthesize_transcript(transcript: str, exam_type: str = "ielts", output_path: Path | None = None) -> bytes:
    """
    Synthesize transcript text into authentic accented audio.
    Supports multi-speaker dialogues (e.g. 'Librarian:', 'Student:') with distinct voices.
    """
    key = "toefl" if (exam_type or "").lower() == "toefl" else "ielts"
    voice_config = VOICE_MAP[key]
    available_voices = voice_config["voices"]

    # Normalize transcript lines
    lines = [line.strip() for line in transcript.split("\n") if line.strip()]
    speaker_pattern = re.compile(r"^([A-Za-z0-9\s\.\-]+):\s*(.*)$")

    segments: list[tuple[str, str]] = []
    speaker_voice_assignment: dict[str, str] = {}
    voice_index = 0

    for line in lines:
        match = speaker_pattern.match(line)
        if match:
            speaker_name = match.group(1).strip()
            speech_text = match.group(2).strip()

            if speaker_name not in speaker_voice_assignment:
                speaker_voice_assignment[speaker_name] = available_voices[voice_index % len(available_voices)]
                voice_index += 1

            assigned_voice = speaker_voice_assignment[speaker_name]
            segments.append((assigned_voice, speech_text))
        else:
            # Monologue / narrator line
            segments.append((voice_config["narrator"], line))

    # Stream & combine audio chunks into a single MP3 byte buffer
    combined_audio = bytearray()
    for voice, text in segments:
        if not text:
            continue
        # Use edge-tts Communicate
        comm = edge_tts.Communicate(text, voice)
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                combined_audio.extend(chunk["data"])

    audio_bytes = bytes(combined_audio)

    # Save to file if output_path specified
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(audio_bytes)

    return audio_bytes


async def get_or_generate_audio(audio_id: str, transcript: str, exam_type: str = "ielts") -> Path:
    """
    Returns the path to the cached MP3 file.
    If not cached, synthesizes and caches it.
    """
    cached_path = get_audio_file_path(audio_id)
    if cached_path.exists() and cached_path.stat().st_size > 0:
        return cached_path

    if not transcript:
        raise ValueError(f"No transcript provided to generate audio for {audio_id}")

    await synthesize_transcript(transcript, exam_type, cached_path)
    return cached_path
