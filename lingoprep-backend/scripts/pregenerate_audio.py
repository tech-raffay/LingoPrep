"""
Pre-generate the listening recordings so no candidate ever waits for one.

    cd lingoprep-backend
    python scripts/pregenerate_audio.py

Reads every listening transcript from the database and writes
static/audio/<audio_id>-<fingerprint>.mp3 for any that is missing. Commit the
new files: the deployed backend then serves them straight from disk. Run it
again whenever a transcript changes; files for old transcripts are removed.
"""

import asyncio
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services import listening_service, tts_service  # noqa: E402


async def main() -> None:
    sources = sorted(listening_service.list_audio_sources(), key=lambda a: a["id"])
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
