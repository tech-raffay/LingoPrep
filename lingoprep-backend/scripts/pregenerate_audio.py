"""
Pre-generate the listening recordings so no candidate ever waits for one.

    cd lingoprep-backend
    python scripts/pregenerate_audio.py                # from the database
    python scripts/pregenerate_audio.py --json DIR     # from the JSON written by
                                                       # tools/listening-seed/build.mjs

Writes static/audio/<audio_id>-<fingerprint>.mp3 for every recording that is
missing and removes files for transcripts that no longer exist. Commit the
files: the deployed backend then serves them straight from disk.
"""

import asyncio
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services import tts_service  # noqa: E402


def from_json(folder: Path) -> list[dict]:
    sources = []
    for f in sorted(folder.glob("listening_audios_exam_type_*.json")):
        for a in json.loads(f.read_text(encoding="utf-8"))["data"]:
            sources.append({"id": a["id"], "title": a["title"], "transcript": a["transcript"], "exam_type": a["exam_type"]})
    return sources


def from_db() -> list[dict]:
    from app.services import listening_service
    return listening_service.list_audio_sources()


async def main() -> None:
    if "--json" in sys.argv:
        sources = from_json(Path(sys.argv[sys.argv.index("--json") + 1]))
    else:
        sources = from_db()
    sources.sort(key=lambda a: a["id"])
    wanted: set[str] = set()

    for a in sources:
        transcript = a.get("transcript") or ""
        exam = a.get("exam_type") or "ielts"
        if not transcript:
            print(f"skip   {a['id']}  (no transcript)")
            continue
        path = tts_service.get_audio_file_path(a["id"], transcript, exam)
        wanted.add(path.name)
        if path.exists() and path.stat().st_size > 0:
            print(f"ok     {path.name}  {a.get('title', '')}")
            continue
        started = time.time()
        await tts_service.get_or_generate_audio(a["id"], transcript, exam)
        print(f"built  {path.name}  {a.get('title', '')}  ({time.time() - started:.0f}s, {path.stat().st_size // 1024} KB)")

    # Recordings whose transcript has since changed are dead weight.
    for old in tts_service.AUDIO_CACHE_DIR.glob("*.mp3"):
        if old.name not in wanted:
            old.unlink()
            print(f"removed {old.name}  (no longer matches any transcript)")


if __name__ == "__main__":
    asyncio.run(main())
