# Persistence and resource limits

This change addresses audit B12 (duplicate/non-atomic persistence) and the remaining request-budget and workload portions of B05/B11. It builds on PR #4. PR #3's UUID/path validation, cache versioning and managed pruning must also be integrated; this branch does not replace that PR. The upload recognition helper and asynchronous transcription implementation are reused from PR #3 so duration and admission limits can be tested here.

## Learner behaviour

- Repeating the same submission with the same attempt key reuses its result. Concurrent duplicates receive 409 rather than running a second evaluation.
- Writing `/submit` collects history and essay records, then writes both in one PostgreSQL transaction. A failed second insert rolls back the first.
- A valid evaluation is checkpointed separately before the result transaction. If saving fails, feedback remains visible with `saved=false`. Signed-in learners can select **Retry saving result**; that endpoint never calls AI or grades again.
- Guests can still practise. They receive no permanent history/essay records, but their feedback is retained in a private, short-lived retry ledger.
- Busy services return 503; exhausted request budgets return 429. Both include `Retry-After`. Missing database protection/configuration fails closed before expensive work.

## Deployment order

1. Integrate the answer/record protections and authentication contracts from PRs #1, #2 and #4. Preserve and integrate PR #3's audio protections when resolving the overlapping audio files.
2. Apply `migration_persistence_resource_limits.sql` after `migration_protect_answers_and_records.sql`, using an administrative SQL connection. It is incremental and repeatable. Do not run the destructive `schema.sql` bootstrap against production.
3. Configure the backend-only `SUPABASE_SERVICE_ROLE_KEY` and a random `RESOURCE_LIMIT_SECRET` of at least 32 characters. Use the same secret on every worker and keep it stable across service-key rotation. Do not put either secret in frontend environment variables. Generate the resource secret with a cryptographic generator, not a memorable password.
4. Install `requirements.txt`. `imageio-ffmpeg` supplies the decoder on supported platforms. Alternatively configure `FFMPEG_BINARY` with an installed executable path. Audio validation returns 503 if no decoder is available; it never silently skips duration checks.
5. Schedule `SELECT public.expire_submission_data();` every 15 minutes using the database's scheduled-job service or an administrator-owned scheduler. This is required: PostgreSQL rows do not expire by themselves. Monitor job failures. Private response/record payloads become inaccessible for retry after 24 hours; scheduled cleanup physically clears them, with up to one scheduling interval of delay. Small attempt tombstones are deleted after seven days. No scheduler was configured in production by this change.
6. Deploy frontend and backend together. Submission clients now send `Idempotency-Key` (UUID); guest submission/transcription clients also send `X-Guest-Id` (UUID). Frontend code generates these automatically. Header values must survive proxy forwarding.
7. Configure Uvicorn/proxy trusted-forwarder addresses explicitly. The limiter uses `request.client.host`; it does not read arbitrary forwarded headers. Trusting every external sender allows IP spoofing, while hiding every user behind one proxy IP shares their budget. Retain edge connection, bandwidth and timeout limits.

## Retry contract and privacy

The key is scoped to a verified account or an opaque guest ID, and bound to the canonical request body plus endpoint. Changed payloads with an existing key return 409. Database records use a separately generated server UUID, not a client-provided row ID. Browser storage contains only a payload hash, attempt key and guest ID, never essay/answer text.

Responses include `attempt_id`, `saved` and `save_retry_available`. `POST /api/attempts/{attempt_id}/save` requires authentication and only accesses that account's checkpoint. Deleting a newly saved history record deletes its linked essay and erases the retry copy, preventing resurrection. Older records without these server attempt IDs remain unaffected.

All new tables and RPCs are inaccessible to public/browser roles. Backend functions set ownership from verified identity; rate-limit actors/IP addresses are stored as keyed hashes. Guest feedback can contain quoted learner text, so it is treated as private retry data even though no guest essay archive is written.

`saved=true` means the canonical history transaction succeeded. Speaking transcript feedback remains ungraded and unsaved. The legacy writing `/evaluate` endpoint continues to create history only; the active `/submit` endpoint creates history plus its essay archive.

If the provider succeeds but the database cannot checkpoint, an emergency buffer retains at most 32 responses, each up to 1 MiB, for 15 minutes on that worker. It is best-effort recovery, not durable storage. A different worker cannot access that buffer. A restart in the provider/checkpoint gap may lose feedback; the attempt stays interrupted and is never automatically evaluated again. There is no claim of exactly-once execution across an external provider and a database. An explicit new attempt can invoke the provider again.

Idempotency is bounded by the seven-day tombstone retention. Clients must use a new key for a deliberate retake, and never replay old keys after retention. The supplied frontend clears its key on retake. Failed evaluations are also retained with their error status; starting a new attempt is required to evaluate again. Save retries and replays count toward request budgets, but do not repeat paid evaluation.

## Default limits

Hourly quotas use fixed UTC hour windows and are checked against both account/guest identity and peer IP. Rotating guest IDs does not reset the IP quota. These defaults are intentionally centralized in `app/services/resource_limits.py` for adjustment after measuring real usage.

| Workload | Requests/hour per actor | Shared concurrent jobs |
| --- | ---: | ---: |
| Writing/speaking evaluation | 30 | 4 |
| Reading/listening scoring or account save retry | 120 | 12 |
| Transcription | 30 | 2 |
| Audio playback request preparation | 120 | 12 |
| TTS synthesis, global server budget | 60 | 2 |

Save retries use the verified account quota. Playback through a native audio element normally has no authorization header, so its budget is IP-based; authenticated API playback also checks account identity. Cached playback is included in the request quota, but does not consume a TTS synthesis slot. Database leases coordinate workers and expire after five minutes if a worker dies. Normal provider deadlines are shorter. Admission fails immediately when full; no application work queue is created.

- Eight POST/PUT/PATCH requests per worker may hold buffered request bodies at once. Reading an upload has a 30-second total deadline.
- JSON request limit: 128 KiB; multipart audio request: 11 MiB; actual audio file: 10 MiB. Actual streamed bytes are counted before parsing.
- Uploaded audio is decoded to bounded mono PCM before transcription. Maximum duration: ten minutes; decoder deadline: 20 seconds; output is capped at 601 seconds for over-limit detection. Protocols and demuxers are restricted, decoder threads/allocation size are limited, and temporary files are removed on success/failure/timeout.
- Transcription and AI evaluation each have a 45-second provider deadline. The frontend request timeout is 90 seconds to accommodate validation and persistence too; network/database delays can still exceed it, which is why retries carry stable keys.
- TTS: 50,000 transcript characters, 200 segments, 2,000 characters per spoken segment, 60 seconds per pause and 300 seconds total pauses, 180-second total synthesis deadline, 2 MiB per generated line and 16 MiB per recording. Small batches bound retained output and cancel sibling requests on failure.
- Listing listening exercises no longer starts background synthesis. Pregenerate normal content before deployment; a missing recording may require generation on first playback. The script-driven synthesis path uses the same shared limits.

These are application safeguards, not a complete host memory/disk quota or denial-of-service defence. Cache-disk retention remains managed by PR #3's explicit pruning workflow. TTS deduplication is still process-local; separate workers can synthesize the same missing file concurrently within the shared job limit. Preserve PR #3's unique temporary-file writes on integration.

## Local verification

From `lingoprep-backend`:

```powershell
.\venv\Scripts\python.exe -m unittest discover -s tests -q
.\venv\Scripts\python.exe tests/run_database_protection.py --pg-bin 'C:\Program Files\PostgreSQL\18\bin' --persistence
```

The database runner creates a separate temporary cluster and stops it in `finally`. It checks permissions, repeated migration application, rollback of the first writing insert when the second fails, ownership, expiry/deletion, and 16 simultaneous claims/finalizations/admissions using independent connections. Decoder tests use generated WAV/WebM fixtures; all AI/provider calls are mocked. Production credentials/data and paid services are not used.

From `lingoprep-frontend`, run `npm run build` to verify TypeScript and the production bundle. API tests run in-process; they do not leave frontend/backend servers listening.

Decoder options follow the [FFmpeg command documentation](https://ffmpeg.org/ffmpeg.html), [protocol restrictions](https://ffmpeg.org/ffmpeg-protocols.html), and [format restrictions](https://ffmpeg.org/ffmpeg-formats.html). The packaged decoder is provided by [imageio-ffmpeg](https://github.com/imageio/imageio-ffmpeg).
