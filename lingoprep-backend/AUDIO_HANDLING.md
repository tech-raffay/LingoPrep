# Audio handling

Listening item IDs must be UUIDs. Cache filenames use canonical IDs and the
existing transcript/accent/version fingerprint, so existing valid recordings
remain usable. Paths are resolved inside `static/audio`; symlinks and escaped
paths are rejected. Generation uses unique temporary files and atomic replacement
with a short bounded retry for Windows sharing conflicts.

Every playback request checks the current database transcript before selecting
the exact recording. An outdated MP3 is never substituted when the current one
is missing. The endpoint returns 404 for unknown IDs and 503 for metadata or
generation failures. Playback still supports byte ranges; `Cache-Control:
no-cache` requires clients to revalidate the stable recording URL. Database
availability is now required even when an older recording exists on disk.

## Pregeneration

From the backend directory:

```powershell
python scripts/pregenerate_audio.py
python scripts/pregenerate_audio.py --json PATH_TO_SEED_JSON
python scripts/pregenerate_audio.py --json PATH_TO_SEED_JSON --prune
```

The entire source set is validated before generation. Missing/empty input,
duplicate IDs, empty transcripts, invalid exams and malformed manifests fail
without pruning. A failed generation leaves the previous manifest and recordings
intact (successfully generated new files may remain for reuse).

`static/audio/audio-manifest.json` tracks generated versions. Default generation
never deletes recordings. `--prune` removes only superseded manifest-managed
versions of IDs in the supplied source set, after every requested recording has
succeeded. Partial input preserves other IDs. Unmanaged MP3s, including recordings
committed before manifests existed, are never automatically deleted. Commit the
manifest alongside generated recordings; do not hand-edit it to point elsewhere.

## Speaking uploads

The transcription endpoint accepts at most 10 MiB of audio and 11 MiB for the
whole multipart request. It checks actual received bytes, including chunked
uploads, before multipart parsing can spool an unbounded file. Rejected multipart
uploads close temporary spools. File reads are bounded and uploads always close.

Supported containers are WebM (including browser Opus recordings), WAV, Ogg,
FLAC, MP3 and M4A/MP4 audio. MIME types must match a recognized container header;
`application/octet-stream` is accepted only with a recognized header. Empty files
return 400, oversized files 413, and unsupported/mismatched files 415.

The original filename is ignored. Validated bytes are passed to the async speech
client with a generated name. No extra application-owned transcription file is
created. Provider operations have a 30-second request timeout, at most one retry,
and a 45-second total deadline. Failures return a generic 503 without provider
details or credentials.

Header checks are not full media decoding. Duration limits, authenticated quotas
and global workload limits remain separate work; valid-looking but corrupt media
can still be rejected by the provider. No live provider call is required by the
regression suite.

## Tests

```powershell
.\venv\Scripts\python.exe -m unittest discover -s tests -v
```

Tests use temporary directories and mocked database/speech services. The real
symlink test is skipped if the OS denies link creation; a separate test exercises
the link-rejection guard without that privilege.
