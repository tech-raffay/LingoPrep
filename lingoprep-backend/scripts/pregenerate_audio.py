"""Generate listening audio; only --prune removes superseded managed versions.

python scripts/pregenerate_audio.py                 # database source
python scripts/pregenerate_audio.py --json DIR      # seed generator JSON
python scripts/pregenerate_audio.py --json DIR --prune

A manifest tracks successful generation. Partial source sets never delete other
recordings, and unmanaged MP3 files are always preserved.
"""

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.services import tts_service  # noqa: E402

MANIFEST_NAME = "audio-manifest.json"


def validate_sources(sources: list[dict]) -> list[dict]:
    """Validate the entire input before generating, updating or pruning files."""
    if not isinstance(sources, list) or not sources:
        raise ValueError("No audio sources found; cache left unchanged.")
    validated = []
    seen = set()
    for source in sources:
        if not isinstance(source, dict):
            raise ValueError("Each audio source must be an object.")
        audio_id = tts_service.validate_audio_id(source.get("id"))
        transcript = source.get("transcript")
        exam = source.get("exam_type")
        if audio_id in seen:
            raise ValueError("Duplicate audio ID in source input.")
        if not isinstance(transcript, str) or not transcript.strip():
            raise ValueError("Every audio source must contain a nonempty transcript.")
        if exam not in {"ielts", "toefl"}:
            raise ValueError("Every audio source must specify ielts or toefl.")
        seen.add(audio_id)
        validated.append({"id": audio_id, "transcript": transcript, "exam_type": exam})
    return sorted(validated, key=lambda item: item["id"])


def from_json(folder: Path) -> list[dict]:
    if not folder.is_dir():
        raise ValueError("JSON source directory does not exist.")
    files = sorted(folder.glob("listening_audios_exam_type_*.json"))
    if not files:
        raise ValueError("No listening source JSON files found.")
    sources = []
    for source_file in files:
        document = json.loads(source_file.read_text(encoding="utf-8"))
        if not isinstance(document, dict) or not isinstance(document.get("data"), list):
            raise ValueError("Source JSON must contain a data array.")
        sources.extend(document["data"])
    return validate_sources(sources)


def from_db() -> list[dict]:
    from app.services import listening_service
    return validate_sources(listening_service.list_audio_sources())


def read_manifest() -> dict[str, list[str]]:
    path = tts_service.cache_path(MANIFEST_NAME)
    if not path.exists():
        return {}
    manifest = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(manifest, dict):
        raise ValueError("Invalid audio manifest.")
    for audio_id, filenames in manifest.items():
        canonical_id = tts_service.validate_audio_id(audio_id)
        if canonical_id != audio_id or not isinstance(filenames, list) or not filenames:
            raise ValueError("Invalid audio manifest entry.")
        for filename in filenames:
            if not isinstance(filename, str) or not re.fullmatch(
                re.escape(audio_id) + r"-[0-9a-f]{10}\.mp3", filename
            ):
                raise ValueError("Invalid audio manifest filename.")
            tts_service.cache_path(filename)
    return manifest


async def generate(sources: list[dict], *, prune: bool = False) -> None:
    sources = validate_sources(sources)
    previous = read_manifest()
    current = {}
    for source in sources:
        path = await tts_service.get_or_generate_audio(
            source["id"], source["transcript"], source["exam_type"]
        )
        expected = tts_service.get_audio_file_path(
            source["id"], source["transcript"], source["exam_type"]
        )
        if path != expected or not path.is_file() or path.stat().st_size == 0:
            raise ValueError("Audio generation did not produce the expected file.")
        current[source["id"]] = path.name
        print(f"ready  {path.name}")

    # Publish only after every requested recording succeeds. Keep entries for
    # IDs absent from a partial source set so they cannot be accidentally pruned.
    manifest = previous.copy()
    for audio_id, filename in current.items():
        manifest[audio_id] = [filename] if prune else sorted(set(previous.get(audio_id, []) + [filename]))
    tts_service.atomic_cache_write(
        tts_service.cache_path(MANIFEST_NAME),
        (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    )
    if prune:
        for audio_id, filenames in previous.items():
            for filename in filenames:
                if audio_id in current and filename != current[audio_id]:
                    old = tts_service.cache_path(filename)
                    old.unlink(missing_ok=True)
                    print(f"removed {filename} (superseded managed version)")


async def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", type=Path, help="Read a seed JSON directory instead of the database.")
    parser.add_argument("--prune", action="store_true", help="Remove only superseded manifest-managed versions of supplied IDs.")
    args = parser.parse_args(argv)
    sources = from_json(args.json) if args.json is not None else from_db()
    await generate(sources, prune=args.prune)


if __name__ == "__main__":
    asyncio.run(main())
